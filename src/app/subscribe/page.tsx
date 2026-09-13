"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getStudentAccess } from "@/lib/access";
import { getPaymentProvider, PaymentPlan, CheckoutResult, markPaymentPendingVerification } from "@/lib/payment";
import { StudentService } from "@/lib/services";
import {
  DiagnosticRepository,
  MasteryRepository,
  MissionRepository,
} from "@/lib/repositories";
import { trackEvent } from "@/lib/analytics";
import {
  Sparkles,
  Target,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Info,
  Clock,
  Zap,
  HelpCircle,
  ShieldAlert,
  Phone,
  Mail,
} from "lucide-react";

export default function SubscribePage() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [masteryCount, setMasteryCount] = useState(0);
  const [completedMissionsCount, setCompletedMissionsCount] = useState(0);
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentState, setPaymentState] = useState<string>("PAYMENT_REQUESTED");

  const supportWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const hasSupportContact = Boolean(supportWhatsApp || supportEmail);

  useEffect(() => {
    trackEvent("conversion_viewed", { userId: user?.id || null });

    async function loadData() {
      try {
        const uid = user?.id;
        const [prof, diag, mast, missions, plans] = await Promise.all([
          StudentService.getProfile(uid),
          DiagnosticRepository.getResults(uid),
          MasteryRepository.getMasteryRecords(uid),
          MissionRepository.getMissions(uid),
          getPaymentProvider().getAvailablePlans(),
        ]);

        setProfile(prof);
        setDiagnosticResult(diag);
        setMasteryCount(mast ? Object.keys(mast).length : 0);
        setCompletedMissionsCount(
          missions ? Object.values(missions).filter((m: any) => m.status === "completed" || m.status === "mastered").length : 0
        );
        if (plans && plans.length > 0) {
          setPlan(plans[0]);
        }
      } catch (err) {
        console.error("Subscribe page load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleStartCheckout = async () => {
    trackEvent("conversion_cta_clicked", { planId: plan?.id, userId: user?.id || null });
    trackEvent("payment_started", { planId: plan?.id, userId: user?.id || null });

    const provider = getPaymentProvider();
    const res = await provider.createCheckout({
      userId: user?.id || "guest_pilot",
      planId: plan?.id || "bac_season_pass_pilot",
      studentEmail: user?.email || undefined,
    });
    setCheckoutData(res);
    setPaymentState("PAYMENT_REQUESTED");
    setShowCheckoutModal(true);
  };

  const handleNotifySupervisor = () => {
    if (!checkoutData?.referenceId) return;
    markPaymentPendingVerification(checkoutData.referenceId);
    setPaymentState("PAYMENT_PENDING_VERIFICATION");
    trackEvent("payment_pending_verification", {
      userId: user?.id || null,
    });
  };

  const access = getStudentAccess(profile);
  const isExpired = access.status === "TRIAL_EXPIRED";

  return (
    <AppShell activeNav="home">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <Badge variant="primary" size="md" className="mx-auto flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>{isAr ? "مواصلة الرحلة نحو البكالوريا" : "Continuer vers le BAC"}</span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text tracking-tight font-sans">
            {isExpired
              ? isAr
                ? "تجربتك المجانية سالت."
                : "Votre essai gratuit est terminé."
              : isAr
              ? "استعد للبكالوريا بثقة وإتقان حقيقي"
              : "Préparez votre BAC avec une méthode rigoureuse"}
          </h1>

          <p className="text-sm sm:text-base text-theme-secondary max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "48 ساعة كانت باش تشوف واش يقدر BAC Mastery يدير معاك. الخريطة تاعك والتقدم تاعك ما راحوش."
              : "48 heures pour découvrir l'efficacité de la méthode. Votre roadmap et votre progression restent intégralement sauvegardées."}
          </p>
        </div>

        {/* Real Stored Student Evidence Card */}
        <Card data-testid="subscribe-conversion-card" className="p-5 sm:p-6 bg-card border-theme space-y-4 shadow-clay">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <span className="text-xs font-bold text-theme-text uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{isAr ? "حصيلة عملك الميداني حتى الآن" : "Votre bilan de travail actuel"}</span>
            </span>
            <Badge variant="outline" size="sm" className="text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success-soft)]">
              {isAr ? "بيانات حقيقية محفوظة" : "Données réelles sauvegardées"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-surface border border-theme">
              <span className="text-[11px] text-theme-muted block">{isAr ? "معدلك المستهدف" : "Objectif BAC"}</span>
              <span className="text-lg font-bold text-theme-text mt-0.5 block font-mono">
                {profile?.targetScore ? `${Number(profile.targetScore).toFixed(2)}/20` : "16.00/20"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface border border-theme">
              <span className="text-[11px] text-theme-muted block">{isAr ? "إشارة التشخيص" : "Signal diagnostic"}</span>
              <span className="text-lg font-bold text-[var(--color-accent)] mt-0.5 block font-mono">
                {diagnosticResult?.observedSignal
                  ? `${Math.round(diagnosticResult.observedSignal)}%`
                  : diagnosticResult?.observedDiagnosticScore
                  ? `${Math.round(diagnosticResult.observedDiagnosticScore)}%`
                  : isAr ? "قيد التدقيق" : "En cours"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface border border-theme">
              <span className="text-[11px] text-theme-muted block">{isAr ? "مهام منجزة" : "Missions finies"}</span>
              <span className="text-lg font-bold text-[var(--color-primary)] mt-0.5 block font-mono">
                {completedMissionsCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface border border-theme">
              <span className="text-[11px] text-theme-muted block">{isAr ? "مهارات مثبتة" : "Maîtrises validées"}</span>
              <span className="text-lg font-bold text-[var(--color-success)] mt-0.5 block font-mono">
                {masteryCount}
              </span>
            </div>
          </div>

          {diagnosticResult?.bottleneckSkillId && (
            <div className="p-3 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 text-xs text-[var(--color-accent)] flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <span>
                {isAr
                  ? `أكبر ثغرة تحتاج معالجة استباقية: ${diagnosticResult.bottleneckSkillId.replace(/_/g, " ")}`
                  : `Principal point d'effort identifié : ${diagnosticResult.bottleneckSkillId.replace(/_/g, " ")}`}
              </span>
            </div>
          )}
        </Card>

        {/* Subscription Plan Card */}
        {plan && (
          <Card className="p-6 sm:p-8 bg-card border-2 border-[var(--color-primary)] space-y-6 shadow-clay relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-5">
              <div>
                <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest block mb-1">
                  {isAr ? "العرض الكامل للتلميذ" : "Pass Pédagogique Intégral"}
                </span>
                <h2 className="text-xl font-bold text-theme-text">
                  {isAr ? plan.name_ar : plan.name_fr}
                </h2>
                <p className="text-xs text-theme-secondary mt-1 max-w-sm">
                  {isAr ? plan.description_ar : plan.description_fr}
                </p>
              </div>

              <div className="text-start sm:text-end shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-theme-text font-mono">{plan.priceDZD}</span>
                  <span className="text-xs font-semibold text-theme-muted">{isAr ? "دج / للموسم" : "DA / saison"}</span>
                </div>
                <span className="text-[11px] text-[var(--color-success)] font-medium block mt-0.5">
                  {isAr ? "حتى يوم امتحان البكالوريا" : "Accès garanti jusqu'au BAC"}
                </span>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2.5">
              {(isAr ? plan.features_ar : plan.features_fr).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-theme-secondary">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                data-testid="subscribe-primary-cta"
                size="lg"
                variant="primary"
                fullWidth
                onClick={handleStartCheckout}
                className="min-h-[50px] font-bold text-sm flex items-center justify-center gap-2 shadow-clay rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
              >
                <span>{isAr ? "كمّل BAC Mastery" : "Continuer avec BAC Mastery"}</span>
                <NextArrow className="w-4 h-4" />
              </Button>

              <Link href="/progress" className="w-full sm:w-auto">
                <Button
                  data-testid="subscribe-secondary-cta"
                  size="lg"
                  variant="outline"
                  fullWidth
                  className="min-h-[50px] text-xs font-medium text-theme-secondary rounded-full"
                >
                  <span>{isAr ? "شوف واش بنيت حتى الآن" : "Consulter mes acquis"}</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Commercial Transparency FAQ Section (5 Core Questions) */}
        <div data-testid="commercial-faq-section" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-theme pb-2">
            <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-theme-text">
              {isAr ? "كل ما تحتاج معرفته بكل وضوح وشفافية" : "Transparence & fonctionnement"}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Q1 */}
            <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono">1</span>
                <span>{isAr ? "واش راح نربح؟" : "Qu'est-ce que je gagne ?"}</span>
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                {isAr
                  ? "تتحصل على خريطة تعلم مخصصة مبنية على تشخيصك الحقيقي، معالجة استباقية لأكبر ثغرة تعيق معدلك، وتدريب دقيق على 31 مهارة أساسية في العلوم التجريبية لضمان عدم تكرار الأخطاء يوم الامتحان."
                  : "Une roadmap sur-mesure issue de votre diagnostic réel, la résolution de votre point de blocage principal, et la maîtrise des 31 compétences clés sans pièges le jour J."}
              </p>
            </Card>

            {/* Q2 */}
            <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono">2</span>
                <span>{isAr ? "واش راح نستعمل؟" : "Qu'est-ce que je vais utiliser ?"}</span>
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                {isAr
                  ? "حلقة تعلم متكاملة: مهام تكيفية، تدريب مصحوب، معمل أخطاء ذكي يحلل سبب الخطأ (مفاهيمي أو منهجي أو حسابي)، تمارين توأم لإعادة الاختبار، وتثبيت الإتقان خطوة بخطوة."
                  : "Une boucle complète : missions adaptatives, labo d'analyse des erreurs (conceptuelles, méthodologiques ou de calcul), retests jumeaux et validation de maîtrise."}
              </p>
            </Card>

            {/* Q3 */}
            <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono">3</span>
                <span>{isAr ? "بقداه؟" : "Combien ça coûte ?"}</span>
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                {isAr
                  ? "3,900 دج فقط للموسم الدراسي 2026 كاملاً حتى يوم امتحان البكالوريا. دفع لمرة واحدة دون أي رسوم إضافية، ودون أي تجديد تلقائي خفي."
                  : "3 900 DA pour toute la saison 2026 jusqu'au jour de l'épreuve du BAC. Paiement unique sans frais cachés ni abonnement récurrent."}
              </p>
            </Card>

            {/* Q4 */}
            <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono">4</span>
                <span>{isAr ? "كيفاش نخلص؟" : "Comment payer ?"}</span>
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                {isAr
                  ? "في المرحلة التجريبية المضبوطة الحالية، يتم الدفع يدوياً عبر تحويل بريدي موب (BaridiMob) أو حوالة بريدية (CCP). بمجرد طلب التفعيل، ستحصل على رمز مرجعي خاص بحسابك ترسل به الوصل للمشرف."
                  : "Durant cette phase pilote contrôlée, le règlement s'effectue manuellement par BaridiMob ou virement postal CCP avec votre code de référence élève unique."}
              </p>
            </Card>

            {/* Q5 */}
            <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono">5</span>
                <span>{isAr ? "واش يصرا من بعد؟" : "Que se passe-t-il après ?"}</span>
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                {isAr
                  ? "يتحقق المشرف من وصل التحويل ويقوم بتفعيل حسابك الكامل في النظام من الخادم. تواصل تدريبك مباشرة من النقطة التي توقفت عندها مع بقاء جميع بياناتك وتقدمك السابق محفوظاً بنسبة 100%."
                  : "Le superviseur vérifie votre justificatif et active votre accès complet depuis le serveur. Vous reprenez instantanément votre parcours là où vous vous étiez arrêté."}
              </p>
            </Card>
          </div>
        </div>

        {/* Modal: Honest Pilot Activation Placeholder */}
        {showCheckoutModal && checkoutData && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card data-testid="subscribe-modal" className="w-full max-w-md p-6 bg-card border-theme space-y-4 shadow-clay animate-scale-in">
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
                  <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{isAr ? "طلب تفعيل اشتراك تجريبي" : "Demande d'activation pilote"}</span>
                </div>
                <button
                  data-testid="subscribe-modal-close"
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-theme-muted hover:text-theme-text text-xs font-mono p-1"
                >
                  ✕
                </button>
              </div>

              {/* Payment state badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-secondary">{isAr ? "حالة الطلب:" : "Statut de la demande :"}</span>
                <Badge
                  data-testid="payment-status-badge"
                  variant={paymentState === "PAYMENT_PENDING_VERIFICATION" ? "warning" : "outline"}
                  size="sm"
                  className={paymentState === "PAYMENT_PENDING_VERIFICATION" ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/40" : "text-[var(--color-primary)] border-[var(--color-primary)]/40"}
                >
                  {paymentState === "PAYMENT_PENDING_VERIFICATION"
                    ? isAr ? "بانتظار تأكيد المشرف" : "En attente de vérification"
                    : isAr ? "تم تسجيل الطلب" : "Demande enregistrée"}
                </Badge>
              </div>

              {/* Reference ID display */}
              <div className="p-3.5 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 space-y-1 text-xs text-[var(--color-primary)]">
                <span className="text-[11px] font-mono text-[var(--color-primary)] uppercase block tracking-wider">
                  {isAr ? "الرمز المرجعي للطلب:" : "Référence élève :"}
                </span>
                <span className="font-mono font-bold text-theme-text text-sm block select-all">
                  {checkoutData.referenceId}
                </span>
              </div>

              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr ? checkoutData.instructions_ar : checkoutData.instructions_fr}
              </p>

              {/* Support contact section */}
              <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-2">
                <span className="text-[11px] font-semibold text-theme-text block">
                  {isAr ? "قناة التواصل لإرسال وصل التحويل:" : "Canal de transmission du justificatif :"}
                </span>
                {hasSupportContact ? (
                  <div className="space-y-1.5 text-xs">
                    {supportWhatsApp && (
                      <a
                        href={`https://wa.me/${supportWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`السلام عليكم، قمت بطلب تفعيل BAC Mastery بالرمز: ${checkoutData.referenceId}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[var(--color-success)] hover:underline transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span dir="ltr">{supportWhatsApp} (WhatsApp)</span>
                      </a>
                    )}
                    {supportEmail && (
                      <a
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent(`BAC Mastery Activation - ${checkoutData.referenceId}`)}`}
                        className="flex items-center gap-2 text-[var(--color-primary)] hover:underline transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{supportEmail}</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[var(--color-warning)] bg-[var(--color-warning-soft)] p-2 rounded-lg border border-[var(--color-warning)]/20">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[var(--color-warning)]" />
                    <span>
                      {isAr
                        ? "SUPPORT_CONTACT_REQUIRED: يرجى التواصل مع المشرف المباشر للدفعة التجريبية لتأكيد التحويل."
                        : "SUPPORT_CONTACT_REQUIRED: Veuillez contacter le superviseur du projet pilote."}
                    </span>
                  </div>
                )}
              </div>

              {/* Safe state progression */}
              {paymentState === "PAYMENT_REQUESTED" ? (
                <div className="space-y-2 pt-1">
                  <Button
                    data-testid="payment-notify-supervisor-btn"
                    size="md"
                    variant="primary"
                    fullWidth
                    onClick={handleNotifySupervisor}
                    className="text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full"
                  >
                    <span>{isAr ? "أرسلت التأكيد للمشرف (دفعت)" : "J'ai envoyé le justificatif"}</span>
                  </Button>
                  <span className="text-[10px] text-theme-muted block text-center">
                    {isAr
                      ? "الضغط هنا يسجل إشعارك فقط. التفعيل النهائي يتم حصراً من الخادم بعد التحقق."
                      : "Cette action enregistre votre notification. L'activation finale est strictement effectuée par le serveur."}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-success-soft)] border border-[var(--color-success)]/30 text-xs text-[var(--color-success)] text-center space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] mx-auto" />
                  <span className="font-semibold block">
                    {isAr ? "تم تسجيل إشعارك بنجاح" : "Notification enregistrée"}
                  </span>
                  <span className="text-[11px] text-theme-secondary block">
                    {isAr
                      ? "طلبك الآن قيد التحقق اليدوي من قبل المشرف. سيتم التفعيل تلقائياً بمجرد مطابقة الوصل."
                      : "Votre demande est en cours de vérification par le superviseur."}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-xs rounded-full"
                >
                  <span>{isAr ? "إغلاق" : "Fermer"}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
