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
import { getPaymentProvider, PaymentPlan, CheckoutResult } from "@/lib/payment";
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
    setShowCheckoutModal(true);
  };

  const access = getStudentAccess(profile);
  const isExpired = access.status === "TRIAL_EXPIRED";

  return (
    <AppShell activeNav="home">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <Badge variant="primary" size="md" className="mx-auto flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? "مواصلة الرحلة نحو البكالوريا" : "Continuer vers le BAC"}</span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            {isExpired
              ? isAr
                ? "تجربتك المجانية سالت."
                : "Votre essai gratuit est terminé."
              : isAr
              ? "استعد للبكالوريا بثقة وإتقان حقيقي"
              : "Préparez votre BAC avec une méthode rigoureuse"}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "48 ساعة كانت باش تشوف واش يقدر BAC Mastery يدير معاك. الخريطة تاعك والتقدم تاعك ما راحوش."
              : "48 heures pour découvrir l'efficacité de la méthode. Votre roadmap et votre progression restent intégralement sauvegardées."}
          </p>
        </div>

        {/* Real Stored Student Evidence Card */}
        <Card data-testid="subscribe-conversion-card" className="p-5 sm:p-6 bg-[#111827] border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span>{isAr ? "حصيلة عملك الميداني حتى الآن" : "Votre bilan de travail actuel"}</span>
            </span>
            <Badge variant="outline" size="sm" className="text-emerald-400 border-emerald-500/30">
              {isAr ? "بيانات حقيقية محفوظة" : "Données réelles sauvegardées"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#162032] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">{isAr ? "معدلك المستهدف" : "Objectif BAC"}</span>
              <span className="text-lg font-bold text-white mt-0.5 block font-mono">
                {profile?.targetScore ? `${Number(profile.targetScore).toFixed(2)}/20` : "16.00/20"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#162032] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">{isAr ? "إشارة التشخيص" : "Signal diagnostic"}</span>
              <span className="text-lg font-bold text-amber-300 mt-0.5 block font-mono">
                {diagnosticResult?.observedSignal
                  ? `${Math.round(diagnosticResult.observedSignal)}%`
                  : diagnosticResult?.observedDiagnosticScore
                  ? `${Math.round(diagnosticResult.observedDiagnosticScore)}%`
                  : isAr ? "قيد التدقيق" : "En cours"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#162032] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">{isAr ? "مهام منجزة" : "Missions finies"}</span>
              <span className="text-lg font-bold text-blue-400 mt-0.5 block font-mono">
                {completedMissionsCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#162032] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">{isAr ? "مهارات مثبتة" : "Maîtrises validées"}</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block font-mono">
                {masteryCount}
              </span>
            </div>
          </div>

          {diagnosticResult?.bottleneckSkillId && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
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
          <Card className="p-6 sm:p-8 bg-gradient-to-b from-[#162032] to-[#0F172A] border-blue-500/40 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
                  {isAr ? "العرض الكامل للتلميذ" : "Pass Pédagogique Intégral"}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {isAr ? plan.name_ar : plan.name_fr}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {isAr ? plan.description_ar : plan.description_fr}
                </p>
              </div>

              <div className="text-start sm:text-end shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">{plan.priceDZD}</span>
                  <span className="text-xs font-semibold text-slate-400">{isAr ? "دج / للموسم" : "DA / saison"}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
                  {isAr ? "حتى يوم امتحان البكالوريا" : "Accès garanti jusqu'au BAC"}
                </span>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2.5">
              {(isAr ? plan.features_ar : plan.features_fr).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                className="min-h-[50px] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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
                  className="min-h-[50px] text-xs font-medium text-slate-300"
                >
                  <span>{isAr ? "شوف واش بنيت حتى الآن" : "Consulter mes acquis"}</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Modal: Honest Pilot Activation Placeholder */}
        {showCheckoutModal && checkoutData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card data-testid="subscribe-modal" className="w-full max-w-md p-6 bg-[#111827] border-slate-800 space-y-4 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? "التفعيل متاح حالياً بشكل تجريبي" : "Activation en phase pilote"}</span>
                </div>
                <button
                  data-testid="subscribe-modal-close"
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1 text-xs text-blue-200">
                <span className="text-[11px] font-mono text-blue-300 uppercase block tracking-wider">
                  {isAr ? "الرمز المرجعي للتلميذ:" : "Référence élève :"}
                </span>
                <span className="font-mono font-bold text-white text-sm block select-all">
                  {checkoutData.referenceId}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? checkoutData.instructions_ar : checkoutData.instructions_fr}
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">
                  {isAr ? "حالة الدفع الإلكتروني:" : "Statut de paiement :"}
                </span>
                <span>
                  {isAr
                    ? "بوابة الدفع الإلكتروني المباشر قيد الربط والتدقيق التقني. لا يتم خصم أو احتساب أي اشتراك تلقائي دون تأكيد يدوي موثق."
                    : "L'intégration de la passerelle de paiement est en cours de validation technique. Aucun prélèvement automatique sans confirmation vérifiée."}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-xs"
                >
                  <span>{isAr ? "فهمت" : "Compris"}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
