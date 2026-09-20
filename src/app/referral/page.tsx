"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { ReferralSummary } from "@/lib/referral/types";

export default function ReferralPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/referral", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      } else {
        // Fallback for guest or new user
        const storedUser = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")
          : null;
        const uid = user?.id || storedUser?.id || "guest";
        const fallbackRes = await fetch(`/api/referral?userId=${encodeURIComponent(uid)}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && fallbackData.summary) {
          setSummary(fallbackData.summary);
        }
      }
    } catch (err: any) {
      console.error("Error loading referral data:", err);
      setError(isAr ? "تعذر تحميل بيانات الإحالة، يرجى إعادة المحاولة" : "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const copyCodeToClipboard = () => {
    if (!summary?.referralCode) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(summary.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const copyLinkToClipboard = () => {
    if (!summary?.shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(summary.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappUrl = summary?.whatsappMessage
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(summary.whatsappMessage)}`
    : "#";

  return (
    <AppShell activeNav="referral">
      <div className="py-6 sm:py-10 bg-background min-h-screen">
        <Container size="md" className="space-y-6 sm:space-y-8">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              <span>{isAr ? "العودة إلى لوحة التلميذ" : "Retour au tableau de bord"}</span>
            </Link>
            <Badge
              variant="outline"
              size="sm"
              className="bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]/20 font-bold"
            >
              {isAr ? "برنامج إحالة الأصدقاء الرسمي ⭐" : "Programme de parrainage officiel"}
            </Badge>
          </div>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-indigo-700 to-purple-800 text-white p-6 sm:p-10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAr ? "مكافأة تخفيض 10%" : "10% de réduction par ami"}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                  {isAr ? "ادعُ زملاءك في البكالوريا، واربحوا في زوج!" : "Parrainez vos camarades du BAC !"}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {isAr
                    ? "صاحبك يستفاد من 7 أيام تجربة مجانية كاملة ومفتوحة 100%. وكي يسجل بكودك يستفاد من تخفيض 10% وأنت تستفاد من تخفيض 10%!"
                    : "Votre ami profite de 7 jours d'essai gratuit. Dès qu'il s'inscrit avec votre code, vous recevez tous les deux 10% de réduction !"}
                </p>
              </div>

              {/* Balance Card Highlight */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center shrink-0 min-w-[180px]">
                <span className="text-[11px] text-white/80 block font-medium">
                  {isAr ? "رصيدك الحالي من شاطر" : "Votre solde de crédit"}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono block mt-1">
                  {summary ? summary.creditBalanceDzd.toLocaleString() : "0"}
                </span>
                <span className="text-xs text-white/90 font-bold block mt-0.5">
                  {isAr ? "دينار جزائري (دج)" : "DZD"}
                </span>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Quick Sharing & Referral Code Section */}
          <Card className="p-6 sm:p-8 bg-card border-theme rounded-3xl space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{isAr ? "كود ورابط الدعوة الخاص بك" : "Votre code et lien de parrainage"}</span>
              </h2>
              <p className="text-xs text-theme-muted">
                {isAr
                  ? "شارك هذا الكود مع زملائك ليسجلوا به، أو أرسل لهم الرابط مباشرة عبر واتساب."
                  : "Partagez ce code ou envoyez directement le lien à vos amis."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code Box */}
              <div className="p-4 rounded-2xl bg-surface border border-theme space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-theme-muted block font-medium">
                    {isAr ? "رمز الإحالة الخاص بك (Referral Code):" : "Code de parrainage :"}
                  </span>
                  <span className="text-2xl font-black tracking-widest font-mono text-[var(--color-primary)] select-all block mt-1">
                    {summary?.referralCode || "..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyCodeToClipboard}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-card border border-theme hover:bg-surface text-xs font-bold text-theme-text flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">{isAr ? "تم نسخ الكود!" : "Code copié !"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isAr ? "نسخ كود الإحالة" : "Copier le code"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Link Box */}
              <div className="p-4 rounded-2xl bg-surface border border-theme space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-theme-muted block font-medium">
                    {isAr ? "رابط التسجيل المباشر:" : "Lien d'inscription direct :"}
                  </span>
                  <span className="text-xs font-mono text-theme-secondary block mt-1 truncate select-all">
                    {summary?.shareUrl || "..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyLinkToClipboard}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-card border border-theme hover:bg-surface text-xs font-bold text-theme-text flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">{isAr ? "تم نسخ الرابط!" : "Lien copié !"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isAr ? "نسخ رابط الدعوة" : "Copier le lien"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Viral Action */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[54px] rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>{isAr ? "مشاركة الدعوة فوراً عبر واتساب 🚀" : "Partager sur WhatsApp"}</span>
                <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
              </a>
            </div>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-card border-theme rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[11px] text-theme-muted block">
                {isAr ? "الأصدقاء المسجلين" : "Amis inscrits"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-theme-text font-mono block">
                {summary?.totalReferrals ?? 0}
              </span>
              <span className="text-[10px] text-theme-secondary block">
                {isAr ? "طالب عبر كودك" : "inscrits"}
              </span>
            </Card>

            <Card className="p-4 bg-card border-theme rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[11px] text-theme-muted block">
                {isAr ? "مشتركون مؤكدون" : "Abonnés confirmés"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block">
                {summary?.subscribedCount ?? 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {isAr ? "حققت المكافأة ✓" : "Validés"}
              </span>
            </Card>

            <Card className="p-4 bg-card border-theme rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[11px] text-theme-muted block">
                {isAr ? "في فترة التجربة" : "En essai gratuit"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono block">
                {summary?.pendingCount ?? 0}
              </span>
              <span className="text-[10px] text-amber-600 font-medium block">
                {isAr ? "بانتظار الاشتراك" : "En cours"}
              </span>
            </Card>

            <Card className="p-4 bg-card border-theme rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[11px] text-theme-muted block">
                {isAr ? "مكافآت محققة" : "Crédits gagnés"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[var(--color-primary)] font-mono block">
                {summary ? summary.confirmedRewardsDzd.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] text-[var(--color-primary)] font-bold block">
                {isAr ? "دج رصيد" : "DA"}
              </span>
            </Card>
          </div>

          {/* Invited Friends List */}
          <Card className="p-6 bg-card border-theme rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{isAr ? "قائمة الزملاء المدعوين" : "Amis parrainés"}</span>
              </h3>
              <Badge variant="outline" size="sm" className="text-theme-muted">
                {summary?.friends?.length || 0} {isAr ? "زميل" : "amis"}
              </Badge>
            </div>

            {loading ? (
              <div className="py-8 text-center text-theme-muted flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-xs">{isAr ? "جاري تحميل البيانات..." : "Chargement..."}</span>
              </div>
            ) : !summary?.friends || summary.friends.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-theme text-theme-muted flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-theme-text">
                    {isAr ? "لم تقم بدعوة أي زميل بعد" : "Aucun ami parrainé pour le moment"}
                  </p>
                  <p className="text-xs text-theme-muted mt-1 max-w-sm mx-auto">
                    {isAr
                      ? "شارك كودك مع أصحابك في الليسي أو عبر الواتساب، وأول ما يسجلوا ويشتركوا تظهر نتائجهم هنا وتكسب تخفيض 10%!"
                      : "Partagez votre lien pour commencer à obtenir 10% de réduction !"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-theme">
                {summary.friends.map((friend) => (
                  <div key={friend.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                        {friend.friendName.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-theme-text block">
                          {friend.friendName}
                        </span>
                        <span className="text-[10px] text-theme-muted block font-mono">
                          {new Date(friend.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-end">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          friend.status === "subscribed"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : friend.status === "rejected"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        {friend.statusLabelAr}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Rules and Explanation Section */}
          <Card className="p-6 bg-card border-theme rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>{isAr ? "كيف يعمل برنامج الإحالة؟ (قواعد واضحة وشفافة)" : "Règles du programme"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-theme-secondary leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-surface border border-theme space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold flex items-center justify-center font-mono text-xs">
                  1
                </span>
                <h4 className="font-bold text-theme-text">{isAr ? "شارك الرابط أو الكود" : "1. Partagez"}</h4>
                <p>
                  {isAr
                    ? "أرسل كودك لزملائك في القسم أو شارك المنشور في مجموعات البكالوريا."
                    : "Envoyez votre code à vos amis et camarades de classe."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold flex items-center justify-center font-mono text-xs">
                  2
                </span>
                <h4 className="font-bold text-theme-text">{isAr ? "صاحبك يجرب 7 أيام باطل" : "2. Essai gratuit"}</h4>
                <p>
                  {isAr
                    ? "زميلك يدخل مباشرة في تجربة مجانية كاملة لمدة 168 ساعة بدون أي قيود على المواد."
                    : "Votre ami bénéficie de 7 jours d'essai complets sans aucune restriction."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold flex items-center justify-center font-mono text-xs">
                  3
                </span>
                <h4 className="font-bold text-theme-text">{isAr ? "تربح تخفيض 10%" : "3. 10% de réduction"}</h4>
                <p>
                  {isAr
                    ? "بمجرد اشتراك زميلك بكودك، يستفيد هو من تخفيض 10% وتستفيد أنت من تخفيض 10%."
                    : "Dès que votre ami utilise votre code, vous bénéficiez tous les deux de 10% de réduction."}
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    </AppShell>
  );
}
