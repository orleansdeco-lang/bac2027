"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLearningAccessGate } from "@/lib/hooks";
import { WellbeingService } from "@/lib/services/wellbeing-service";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { StudyEnergyState } from "@/types/onboarding";
import {
  Zap,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Smile,
  AlertCircle,
  Moon,
  Coffee,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Lock,
} from "lucide-react";

export default function MindPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const gate = useLearningAccessGate();

  const [selectedEnergy, setSelectedEnergy] = useState<StudyEnergyState>(
    (gate.profile?.studyEnergy as StudyEnergyState) || "normal"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  if (gate.isLoading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
              {isAr ? "جاري تحميل إعدادات الطاقة والتركيز..." : "Chargement..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized || !gate.profile) {
    return null;
  }

  if (!gate.hasPremiumAccess) {
    return (
      <AppShell activeNav="home">
        <Container size="sm" className="py-12 sm:py-16 text-center space-y-6" dir="rtl">
          <div data-testid="mind-trial-expired-gate" className="p-6 sm:p-8 rounded-3xl bg-card border border-theme space-y-5 shadow-clay animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-text font-sans">
                مسارك مازال محفوظ. فعّل اشتراكك باش تكمل
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto font-sans">
                انتهت فترة التجربة المجانية (7 أيام). سجلات استقرارك الذهني وطاقتك الدراسية محفوظة بدقة. فعّل اشتراكك الآن لتعديل حمولة الدراسة اليومية حسب طاقتك.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/subscribe" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" fullWidth className="font-bold text-sm shadow-clay">
                  <span>كمّل مع الشاطر</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" fullWidth className="text-xs">
                  <span>العودة للوحة التحكم</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </AppShell>
    );
  }

  const profile = gate.profile;
  const loadAdjustment = WellbeingService.getLoadAdjustment(selectedEnergy as any);
  const restRecommendation = WellbeingService.getRestRecommendation(selectedEnergy as any, 60);

  const handleUpdateEnergy = async (energy: StudyEnergyState) => {
    setSelectedEnergy(energy);
    setIsSaving(true);
    try {
      await StudentRepository.saveProfile({
        ...profile,
        studyEnergy: energy,
      } as any);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update study energy:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const energyOptions: {
    id: StudyEnergyState;
    label_ar: string;
    label_fr: string;
    description_ar: string;
    description_fr: string;
    icon: typeof Zap;
    color: string;
  }[] = [
    {
      id: "good",
      label_ar: "طاقة عالية وتركيز ممتاز",
      label_fr: "Haute Énergie",
      description_ar: "مستعد لإنجاز 3 مهمات متتابعة والتقدم في المادة العائق.",
      description_fr: "Prêt pour une session intensive de 60 minutes.",
      icon: Zap,
      color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400",
    },
    {
      id: "normal",
      label_ar: "طاقة طبيعية متوازنة",
      label_fr: "Énergie Normale",
      description_ar: "وتيرة قياسية (مهمتان، 45 دقيقة) تحقق التوازن بين المراجعة والتطبيق.",
      description_fr: "Rythme standard de 45 minutes selon votre feuille de route.",
      icon: Smile,
      color: "border-blue-500/40 bg-blue-950/20 text-blue-400",
    },
    {
      id: "tired",
      label_ar: "إرهاق وتعب جسدي",
      label_fr: "Fatigue / Épuisement",
      description_ar: "تقليص العبء إلى تدريب خفيف (20 دقيقة) لتثبيت مهارة سابقة دون إرهاق الدماغ.",
      description_fr: "Charge allégée à 20 minutes ciblées sans surcharge cognitive.",
      icon: Moon,
      color: "border-amber-500/40 bg-amber-950/20 text-amber-400",
    },
    {
      id: "stressed",
      label_ar: "ضغط نفسي وتوتر",
      label_fr: "Stress d'Examen",
      description_ar: "جلسة تذكير قصيرة (15 دقيقة) لاستعادة الثقة بخطوات سهلة ومضمونة.",
      description_fr: "Session de 15 minutes pour reprendre confiance pas à pas.",
      icon: Heart,
      color: "border-rose-500/40 bg-rose-950/20 text-rose-400",
    },
  ];

  return (
    <AppShell activeNav="account">
      <Container size="md" className="py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" className="font-bold">
                {isAr ? "الحالة الذهنية وتكييف العبء" : "Bien-être & Charge Adaptative"}
              </Badge>
              <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400">
                {isAr ? "نظام بيداغوجي غير طبي" : "Pédagogie non médicale"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight font-sans">
              {isAr ? "كيف هي طاقتك وتركيزك اليوم؟" : "Votre Énergie d'Étude"}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary max-w-xl leading-relaxed">
              {isAr
                ? "في BAC Mastery لا نطلب منك المستحيل عندما تكون متعباً. المنظومة تكيف طول وصعوبة المهمات حسب طاقتك الحقيقية."
                : "La plateforme adapte la charge de travail à votre niveau d'énergie pour préserver votre constance."}
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <BackArrow className="h-4 w-4" />
              <span>{isAr ? "لوحة التحكم" : "Tableau de bord"}</span>
            </Button>
          </Link>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              {isAr
                ? "تم تحديث خطتك اليومية بنجاح! تم ضبط وقت وأولويات المهام وفق طاقتك."
                : "Plan du jour mis à jour selon votre niveau d'énergie !"}
            </span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. ENERGY LEVEL SELECTOR                                          */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-theme-text uppercase tracking-wider">
            {isAr ? "اختر حالتك الحالية لضبط المهام:" : "Sélectionnez votre état actuel :"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {energyOptions.map((opt) => {
              const isSelected = selectedEnergy === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleUpdateEnergy(opt.id)}
                  className={`p-5 rounded-2xl border-2 text-start transition-all space-y-3 cursor-pointer ${
                    isSelected
                      ? `${opt.color} ring-2 ring-[var(--color-primary)] shadow-lg`
                      : "border-theme bg-card hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-bold text-theme-text font-sans">
                        {isAr ? opt.label_ar : opt.label_fr}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>

                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr ? opt.description_ar : opt.description_fr}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. ADAPTIVE LOAD CALCULATION PREVIEW                              */}
        {/* ================================================================= */}
        <Card className="p-6 sm:p-7 space-y-4 border-[var(--color-primary)]/30 bg-card">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>{isAr ? "نتيجة التكييف البيداغوجي اليوم:" : "Conséquences Pédagogiques"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-[10px] text-theme-muted block">{isAr ? "الوقت الموصى به" : "Temps recommandé"}</span>
              <span className="text-xl font-bold font-mono text-[var(--color-primary)]">
                {loadAdjustment.recommendedDailyMinutes} {isAr ? "دقيقة" : "min"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-[10px] text-theme-muted block">{isAr ? "الحد الأقصى للمهام" : "Missions max"}</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {loadAdjustment.maxMissionsPerDay} {isAr ? "مهمة" : "missions"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-[10px] text-theme-muted block">{isAr ? "التركيز البيداغوجي" : "Priorité"}</span>
              <span className="text-xs font-bold text-amber-400">
                {loadAdjustment.priorityFocus === "repair_only"
                  ? (isAr ? "إصلاح الأخطاء فقط" : "Réparation")
                  : loadAdjustment.priorityFocus === "light_practice"
                  ? (isAr ? "تطبيق خفيف ومريح" : "Rappel léger")
                  : (isAr ? "تقدم قياسي" : "Progression")}
              </span>
            </div>
          </div>

          <p className="text-xs text-theme-secondary leading-relaxed pt-2 border-t border-theme">
            {isAr ? loadAdjustment.rationale_ar : loadAdjustment.rationale_fr}
          </p>
        </Card>

        {/* ================================================================= */}
        {/* 3. "نرجعو من هنا" RECOVERY MODE (GUILT-FREE RESTART)             */}
        {/* ================================================================= */}
        <Card className="p-6 sm:p-7 space-y-4 border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <RotateCcw className="h-4 w-4" />
            <span>{isAr ? "نرجعو من هنا (Guilt-Free Recovery)" : "Reprendre Sereinement"}</span>
          </div>

          <h3 className="text-base font-bold text-white">
            {isAr ? "انقطعت بضعة أيام؟ لا داعي للقلق أو الشعور بالذنب" : "Une pause involontaire ?"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? "الانقطاع المؤقت جزء طبيعي من مسار أي تلميذ مقبل على البكالوريا. أكبر خطأ هو محاولة تعويض أسبوع كامل في جلسة واحدة وإرهاق نفسك. خطة الاسترجاع في BAC Mastery تعيد ترتيب أولوياتك لتبدأ بمهمة واحدة أساسية."
              : "Inutile d'essayer de tout rattraper d'un coup. Nous réordonnons vos priorités pour reprendre par une seule mission clé."}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary" size="md" className="bg-amber-600 hover:bg-amber-500 font-bold">
                <span>{isAr ? "نبدأ بمهمة اليوم الأساسية" : "Reprendre ma mission clé"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* ================================================================= */}
        {/* 4. SCIENTIFIC REST RECOMMENDATIONS                                */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
              <Coffee className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "استراحات الـ 5-15 دقيقة" : "Micro-Pauses"}</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "بعد كل 45 دقيقة من العمل، ابتعد عن الشاشة لمدة 5 دقائق. هذا الوقت هو الذي ينقل فيه الدماغ المعلومات من الذاكرة اللحظية إلى الذاكرة طويلة المدى."
                : "5 minutes de pause toutes les 45 minutes permettent la consolidation mnésique."}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span>{isAr ? "أهمية 8 ساعات نوم لتلاميذ البكالوريا" : "Sommeil Réparateur"}</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "الدراسة لساعات متأخرة من الليل تقلل من قدرة استرجاع القوانين الرياضية بنسبة 30%. النوم الجيد جزء أساسي من خطة العمل وليس ترفاً."
                : "Le sommeil est la phase active de structuration des concepts scientifiques."}
            </p>
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
