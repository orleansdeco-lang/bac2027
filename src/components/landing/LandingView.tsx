"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { Logo, ShaterIcon } from "@/components/ui/Logo";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { trackEvent } from "@/lib/analytics";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Target,
  Brain,
  RotateCcw,
  Clock,
  Heart,
  ChevronDown,
  Compass,
  GraduationCap,
  Award,
  Sliders,
  Check,
  X,
  UserCheck,
  Layers,
  ArrowUpRight,
  Activity,
  Lightbulb,
  Crosshair,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  MessageCircle,
  BookOpen,
} from "lucide-react";

// ============================================================================
// 1. TARGET SCORE SIMULATOR (Ground truth academic projection)
// ============================================================================

interface SpecialtyTier {
  minScore: number;
  maxScore: number;
  titleAr: string;
  titleFr: string;
  facultiesAr: string[];
  facultiesFr: string[];
  badgeAr: string;
  badgeFr: string;
  recommendedMinutes: number;
  summaryAr: string;
  summaryFr: string;
}

const SPECIALTY_TIERS: SpecialtyTier[] = [
  {
    minScore: 13.0,
    maxScore: 14.49,
    titleAr: "عتبة التخصصات الجامعية الواعدة",
    titleFr: "Filières Universitaires Porteuses",
    facultiesAr: [
      "المعاهد الوطنية للإلكترونيك والإعلام الآلي",
      "كليات العلوم الاقتصادية والتسيير التجاري",
      "العلوم البيولوجية والمخبرية",
      "اللغات الحية والترجمة",
    ],
    facultiesFr: [
      "Instituts Nationaux d'Informatique",
      "Sciences Économiques & Gestion",
      "Sciences Biologiques & Laboratoires",
      "Langues Étrangères & Traduction",
    ],
    badgeAr: "مستوى جيد",
    badgeFr: "Bon Niveau",
    recommendedMinutes: 45,
    summaryAr: "تثبيت الأساسيات وسد فجوات الفهم الأولي يضمن انتقالك بثقة نحو المعدلات العالية.",
    summaryFr: "Consolidez vos bases et sécurisez votre transition méthodique.",
  },
  {
    minScore: 14.5,
    maxScore: 15.99,
    titleAr: "عتبة المدارس العليا والهندسة",
    titleFr: "Grandes Écoles & Architecture",
    facultiesAr: [
      "الهندسة المعمارية والعمران (EPAU)",
      "المدارس الوطنية للبيوتكنولوجيا والزراعة",
      "المدارس العليا للتجارة والتسيير (HEC / ESC)",
      "علوم المادة وتقنيات الاتصال الحديثة",
    ],
    facultiesFr: [
      "Architecture & Urbanisme (EPAU)",
      "Écoles Nationales de Biotechnologie",
      "Hautes Études Commerciales (HEC/ESC)",
      "Télécommunications & Technologies",
    ],
    badgeAr: "امتياز واعد",
    badgeFr: "Mention Bien+",
    recommendedMinutes: 50,
    summaryAr: "خطة مهارية مركزة على رفع الدقة في سلم التنقيط الوزاري وترميم أخطاء الصياغة.",
    summaryFr: "Perfectionnez la rigueur méthodologique officielle sur chaque exercice.",
  },
  {
    minScore: 16.0,
    maxScore: 17.19,
    titleAr: "عتبة كليات العلوم الطبية والمدارس العليا للأساتذة",
    titleFr: "Sciences Médicales & ENS",
    facultiesAr: [
      "المدارس العليا للأساتذة (ENS)",
      "كليات الصيدلة وطب الأسنان",
      "الأقسام التحضيرية في العلوم والتقنيات",
      "المدارس العليا للإلكترونيك والأوتوماتيك",
    ],
    facultiesFr: [
      "Écoles Normales Supérieures (ENS)",
      "Pharmacie & Chirurgie Dentaire",
      "Classes Préparatoires Grandes Écoles",
      "Génie Électrique & Automatique",
    ],
    badgeAr: "مرتبة الشرف الأولى",
    badgeFr: "Mention Très Bien",
    recommendedMinutes: 60,
    summaryAr: "معالجة دقيقة للثغرات الخفية وحل التمارين المركبة تحت ضغط الوقت بسلاسة.",
    summaryFr: "Maîtrise du barème et automatisation des réflexes d'examen.",
  },
  {
    minScore: 17.2,
    maxScore: 20.0,
    titleAr: "قمة النخبة الوطنية: كليات الطب والذكاء الاصطناعي",
    titleFr: "Élite Nationale : Médecine & ENSIA / ESI",
    facultiesAr: [
      "كليات الطب البشري (Faculté de Médecine)",
      "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA بسيدي عبد الله)",
      "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
      "المدرسة الوطنية المتعددة التقنيات (Polytechnique ENP)",
    ],
    facultiesFr: [
      "Faculté de Médecine",
      "École Nationale Supérieure d'IA (ENSIA)",
      "École Supérieure d'Informatique (ESI)",
      "École Nationale Polytechnique (ENP)",
    ],
    badgeAr: "نخبة الجزائر 🇩🇿",
    badgeFr: "Élite Nationale 🇩🇿",
    recommendedMinutes: 65,
    summaryAr: "صفر أخطاء متكررة. إتقان معمل الأخطاء لترميم كل هفوة وحصد العلامات الكاملة في المواد الأساسية.",
    summaryFr: "Précision maximale. Remédiation systématique de chaque faille.",
  },
];

function getTierForScore(score: number): SpecialtyTier {
  const found = SPECIALTY_TIERS.find(
    (tier) => score >= tier.minScore && score <= tier.maxScore
  );
  return found || SPECIALTY_TIERS[SPECIALTY_TIERS.length - 1];
}

export function TargetScoreSimulator({ isAr }: { isAr: boolean }) {
  const [score, setScore] = useState<number>(16.5);
  const activeTier = getTierForScore(score);

  return (
    <div className="rounded-[32px] border border-theme bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-clay">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? "محاكي المعدل والجاهزية" : "Simulateur d'Objectif & Cible"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-theme-text font-sans">
            {isAr ? "حدّد معدل طموحك.. واكتشف متطلبات التدريب اليومي" : "Définissez votre cible BAC"}
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            {isAr
              ? "حرك المؤشر لترى كيف يحدد الشاطر حجم التدريب الموجه والمهارات المستهدفة."
              : "Ajustez le curseur pour visualiser le volume d'entraînement ciblé requis."}
          </p>
        </div>

        {/* Score Display Card */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-surface border border-theme px-5 py-3 rounded-2xl shadow-sm">
          <div className="text-start">
            <span className="text-[10px] font-bold text-theme-muted uppercase block">
              {isAr ? "المعدل المستهدف" : "Moyenne Cible"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-[var(--color-primary)] font-mono">
                {score.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-theme-secondary">/20</span>
            </div>
          </div>
          <div className="h-10 w-px bg-theme-border mx-1" />
          <Badge
            variant="primary"
            size="md"
            className="font-bold whitespace-nowrap text-xs bg-[var(--color-primary)] text-white shadow-sm border-0"
          >
            {isAr ? activeTier.badgeAr : activeTier.badgeFr}
          </Badge>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-theme-secondary">
          <span>13.00 (جيد)</span>
          <span className="text-[var(--color-primary)] font-bold">16.00 (جيد جداً)</span>
          <span className="text-[var(--color-primary-active)] font-bold">18.50+ (امتياز عالي)</span>
        </div>
        <input
          type="range"
          min="13.0"
          max="19.0"
          step="0.1"
          value={score}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          className="w-full h-3 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] border border-theme"
          aria-label={isAr ? "مؤشر المعدل المستهدف" : "Curseur de moyenne cible"}
        />
      </div>

      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Target Faculties */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--color-primary)]" />
            <h4 className="font-extrabold text-theme-text text-base sm:text-lg">
              {isAr ? activeTier.titleAr : activeTier.titleFr}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(isAr ? activeTier.facultiesAr : activeTier.facultiesFr).map((fac, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface border border-theme hover:border-[var(--color-primary)]/40 transition-colors"
              >
                <div className="p-1 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-theme-text leading-snug">{fac}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-theme-secondary bg-surface p-3 rounded-xl border border-theme leading-relaxed">
            💡 {isAr ? activeTier.summaryAr : activeTier.summaryFr}
          </p>
        </div>

        {/* Right: Daily Effort Prescription */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-theme p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-theme-muted uppercase">
              {isAr ? "الوصفة المنهجية للشاطر" : "Prescription Méthodique"}
            </span>
            <div className="flex items-center gap-1 text-[var(--color-primary)] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "تركيز ذكي بدون إرهاق" : "Efficacité Ciblée"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-3.5 rounded-xl border border-theme">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shrink-0 font-bold text-lg font-mono">
              {activeTier.recommendedMinutes}
            </div>
            <div>
              <span className="text-xs font-bold text-theme-text block">
                {isAr
                  ? `${activeTier.recommendedMinutes} دقيقة يومياً من التعلم والتدريب الموجه`
                  : `${activeTier.recommendedMinutes} min d'entraînement ciblé par jour`}
              </span>
              <span className="text-[11px] text-theme-secondary">
                {isAr
                  ? "بدل 7 ساعات من الحفظ العشوائي والتشتت المرهق."
                  : "Au lieu d'heures de révision passive épuisante."}
              </span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-theme-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isAr ? "تشخيص الفجوة في المهارة المحددة" : "Diagnostic de la compétence ciblée"}</span>
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <span>{isAr ? "تحليل وتصحيح سبب الخطأ في معمل الأخطاء" : "Analyse de la cause de l'erreur dans le Lab"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <span>{isAr ? "إعادة اختبار توأمي للتأكد من الإتقان" : "Test jumeau de validation d'acquisition"}</span>
            </li>
          </ul>

          <Link href="/auth/register" className="block pt-1">
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-xl font-bold shadow-clay flex items-center justify-center gap-2 py-3"
            >
              <span>{isAr ? `ابدأ مسارك لهذا الهدف (${score.toFixed(2)})` : "Démarrer pour cet objectif"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. STORYTELLING: FROM CONFUSION TO CLARITY (من الحيرة إلى الوضوح)
// ============================================================================

export function ClarityComparisonSection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-16 sm:py-24 border-b border-theme bg-surface">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? "من الحيرة إلى الوضوح" : "De la Confusion à la Clarté"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "كيف يتغير مسار الطالب مع الشاطر؟" : "Comment SHATER transforme votre préparation ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "الفرق الجوهري بين التشتت المرهق وبين امتلاك بوصلة دقيقة تعرف أين أنت وما هي خطوتك القادمة."
              : "La différence fondamentale entre la dispersion confuse et un cap clair vers la maîtrise."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Before: Traditional Confusion */}
          <div className="rounded-3xl border border-rose-300/40 bg-card p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-400 to-amber-400" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-theme-text text-base sm:text-lg">
                    {isAr ? "قبل الشاطر: الحيرة والتشتت" : "Avant SHATER : L'Incertitude"}
                  </h3>
                  <span className="text-xs text-rose-600 font-semibold">
                    {isAr ? "أسئلة مقلقة دون إجابات واضحة" : "Doutes incessants et dispersion"}
                  </span>
                </div>
              </div>
              <Badge variant="outline" size="sm" className="border-rose-400/30 text-rose-600 text-[10px]">
                {isAr ? "تشتت" : "Confusion"}
              </Badge>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-theme-secondary pt-2">
              <div className="p-3 rounded-xl bg-surface/70 border border-theme/60 flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">❓</span>
                <span className="font-medium text-theme-text">{isAr ? "واش نقرا اليوم؟ ومنين نبدأ؟" : "Que réviser aujourd'hui et par quoi commencer ?"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/70 border border-theme/60 flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">❓</span>
                <span className="font-medium text-theme-text">{isAr ? "علاش ديما نغلط في نفس التمارين رغم أني حفظت القوانين؟" : "Pourquoi les mêmes erreurs reviennent malgré l'apprentissage ?"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/70 border border-theme/60 flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">❓</span>
                <span className="font-medium text-theme-text">{isAr ? "هل نركز على هذا الدرس أو ذاك؟ هل يكفيني الوقت؟" : "Faut-il insister sur cette unité ou passer à la suivante ?"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/70 border border-theme/60 flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">❓</span>
                <span className="font-medium text-theme-text">{isAr ? "واش راني جاهز حقيقة للباك أم مجرد تخمين؟" : "Suis-je vraiment prêt pour l'examen ou est-ce une illusion ?"}</span>
              </div>
            </div>
          </div>

          {/* After: Clarity with SHATER */}
          <div className="rounded-3xl border border-[var(--color-primary)]/40 bg-card p-6 sm:p-8 space-y-6 shadow-clay relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-theme-text text-base sm:text-lg">
                    {isAr ? "مع الشاطر: الوضوح والجاهزية" : "Avec SHATER : Le Cap et la Maîtrise"}
                  </h3>
                  <span className="text-xs text-[var(--color-primary)] font-semibold">
                    {isAr ? "منظومة تقودك خطوة بخطوة" : "Un système qui vous guide pas à pas"}
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="bg-[var(--color-primary)] text-white text-[10px] font-bold">
                {isAr ? "وضوح تام" : "Clarté"}
              </Badge>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-theme-text pt-2">
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-start gap-3">
                <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">✓</span>
                <span className="font-medium">{isAr ? "نعرف مستواك الحقيقي: تشخيص دقيق دون افتراضات." : "Niveau initial diagnostiqué avec précision."}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-start gap-3">
                <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">✓</span>
                <span className="font-medium">{isAr ? "نحدد فجواتك: نعرف بالضبط ما ينقصك في كل مهارة." : "Identification claire de vos verrous méthodologiques."}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-start gap-3">
                <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">✓</span>
                <span className="font-medium">{isAr ? "نحدد خطوتك القادمة: مهمة محددة يومياً بين 20 إلى 40 دقيقة." : "Prochaine micro-mission quotidienne clairement définie."}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-theme flex items-start gap-3">
                <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">✓</span>
                <span className="font-medium">{isAr ? "نتابع تقدمك ونختبر جاهزيتك حتى تطمئن تماماً." : "Progression mesurée et confirmation de votre état de préparation."}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 3. HOW SHATER WORKS (The 8-Step Progressive Engine)
// ============================================================================

export function HowItWorksSection({ isAr }: { isAr: boolean }) {
  const steps = [
    {
      num: "01",
      titleAr: "التشخيص",
      titleFr: "Diagnostic",
      descAr: "نعرف مستواك الحقيقي في البداية.",
      descFr: "Évaluation initiale sans complaisance.",
      icon: Crosshair,
    },
    {
      num: "02",
      titleAr: "اكتشاف الفجوات",
      titleFr: "Détection des Failles",
      descAr: "نعرف ماذا ينقصك بدقة في كل وحدة.",
      descFr: "Repérage des points de vulnérabilité.",
      icon: Lightbulb,
    },
    {
      num: "03",
      titleAr: "التعلم الموجه",
      titleFr: "Apprentissage Ciblé",
      descAr: "تتعلم ما تحتاجه فعلًا بدون إطالة.",
      descFr: "Concepts essentiels sans dispersion.",
      icon: BookOpen,
    },
    {
      num: "04",
      titleAr: "التدريب",
      titleFr: "Entraînement Actif",
      descAr: "تطبق عمليًا وتختبر عمق فهمك.",
      descFr: "Application immédiate sur exercices types.",
      icon: Target,
    },
    {
      num: "05",
      titleAr: "تحليل الأخطاء",
      titleFr: "Analyse d'Erreurs",
      descAr: "نعرف لماذا أخطأت: حساب، فهم، أو صياغة.",
      descFr: "Compréhension de la cause exacte du faux pas.",
      icon: RotateCcw,
    },
    {
      num: "06",
      titleAr: "الإصلاح",
      titleFr: "Remédiation",
      descAr: "نعالج نقطة الضعف حتى تزول نهائيًا.",
      descFr: "Correction chirurgicale du blocage.",
      icon: ShieldCheck,
    },
    {
      num: "07",
      titleAr: "إعادة الاختبار",
      titleFr: "Retest Jumeau",
      descAr: "نتأكد عبر تمرين توأمي أنك تحسنت.",
      descFr: "Validation définitive par test miroir.",
      icon: CheckCircle,
    },
    {
      num: "08",
      titleAr: "الإتقان والجاهزية",
      titleFr: "Maîtrise & Prêt",
      descAr: "نبني جاهزيتك الحقيقية ليوم الامتحان.",
      descFr: "Confiance absolue pour le jour J.",
      icon: Award,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-b border-theme bg-canvas">
      <Container size="lg" className="space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? "منظومة العمل المتسلسلة" : "Moteur d'Apprentissage"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "كيف تعمل منظومة الشاطر؟" : "Comment fonctionne SHATER ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "مسار محكم مبني على العلم وليس العشوائية: ثماني محطات تحول كل صعوبة إلى مهارة مكتسبة."
              : "Huit étapes progressives pour transformer chaque lacune en compétence durable."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card
                key={idx}
                className="p-5 sm:p-6 border-theme bg-card hover:border-[var(--color-primary)]/50 transition-all hover:shadow-clay space-y-3 rounded-2xl group relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[var(--color-primary)] px-2 py-0.5 rounded-lg bg-[var(--color-primary-soft)]">
                    {step.num}
                  </span>
                  <div className="p-2 rounded-xl bg-surface border border-theme text-theme-secondary group-hover:text-[var(--color-primary)] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-theme-text text-base">
                    {isAr ? step.titleAr : step.titleFr}
                  </h3>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr ? step.descAr : step.descFr}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 4. WHY SHATER (لماذا الشاطر؟ — 6 Concise Value Cards)
// ============================================================================

export function WhyShaterSection({ isAr }: { isAr: boolean }) {
  const values = [
    {
      titleAr: "تشخيص حقيقي",
      titleFr: "Diagnostic Réel",
      descAr: "لا نفترض مستواك ولا نبدأ من الصفر إذا كنت متقدماً. نفحص أين أنت بالضبط.",
      descFr: "Nous ne présumons pas de votre niveau : évaluation concrète et objective.",
      icon: Crosshair,
    },
    {
      titleAr: "مسار مخصص",
      titleFr: "Parcours Personnalisé",
      descAr: "تتعلم بحسب احتياجاتك وشعبتك، دون إضاعة ساعات في ما تتقنه بالفعل.",
      descFr: "Apprentissage ajusté à vos besoins réels sans perte de temps.",
      icon: Compass,
    },
    {
      titleAr: "تعلم بالمهارات",
      titleFr: "Axé Compétences",
      descAr: "نركز على ما تستطيع فعله في ورقة الامتحان: التحليل، التفسير، والحساب الدقيق.",
      descFr: "Priorité à ce que vous savez produire sur votre copie d'examen.",
      icon: Target,
    },
    {
      titleAr: "تحليل الأخطاء",
      titleFr: "Analyse des Failles",
      descAr: "الخطأ ليس فشلاً، بل هو أهم معلومة تساعدنا على فهم سبب المشكلة ومعالجتها.",
      descFr: "Chaque erreur est une donnée précieuse pour comprendre et corriger.",
      icon: RotateCcw,
    },
    {
      titleAr: "تدريب وإصلاح",
      titleFr: "Remédiation Active",
      descAr: "لا نكتفي بإخبارك أنك أخطأت في السؤال؛ نصلح الفكرة وندربك عليها فوراً.",
      descFr: "Pas de simple corrigé passif : réparation ciblée et retest immédiat.",
      icon: ShieldCheck,
    },
    {
      titleAr: "متابعة الجاهزية",
      titleFr: "Mesure de Préparation",
      descAr: "تعرف دائمًا أين وصلت، ما المتبقي، وما هي خطوتك القادمة حتى يوم الامتحان.",
      descFr: "Visibilité totale sur votre degré d'avancement jusqu'au jour de l'épreuve.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="why-shater" className="py-16 sm:py-24 border-b border-theme bg-surface">
      <Container size="lg" className="space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? "الركائز الأساسية" : "Pourquoi SHATER"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "لماذا الشاطر؟" : "Pourquoi choisir SHATER ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "مبني على منهجية تربوية دقيقة تعيد الثقة للطالب وتوفر الجهد والوقت."
              : "Une méthode claire, honnête et exigeante au service de votre réussite."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-card border border-theme shadow-sm hover:border-[var(--color-primary)]/40 hover:shadow-clay transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-theme-text text-base sm:text-lg">
                  {isAr ? v.titleAr : v.titleFr}
                </h3>
                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                  {isAr ? v.descAr : v.descFr}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 5. SHATER BAC PRODUCT SECTION (أول منتج متخصص)
// ============================================================================

export function ShaterBacSection({ isAr }: { isAr: boolean }) {
  return (
    <section id="shater-bac" className="py-16 sm:py-24 border-b border-theme bg-canvas relative overflow-hidden">
      <Container size="lg">
        <div className="rounded-[36px] border border-theme bg-card p-6 sm:p-10 lg:p-12 shadow-clay space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
                <ShaterIcon size={18} />
                <span>{isAr ? "المنتج الأول للمنظومة" : "Premier Produit Spécialisé"}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-5xl font-black text-theme-text font-sans">
                    SHATER
                  </span>
                  <span className="text-3xl sm:text-5xl font-black text-[var(--color-primary)] font-mono">
                    BAC
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-theme-text">
                  {isAr
                    ? "نظام تعلم وتدريب ذكي لطلبة البكالوريا الجزائرية"
                    : "Système intelligent de préparation au Baccalauréat Algérien"}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
                {isAr
                  ? "لا يهدف SHATER BAC إلى إعطاء الطالب كميات أكبر من الأوراق أو مضاعفة ساعات الحفظ. هدفه هو مساعدتك على معرفة ما ينقصك بدقة، والتدرب الموجه على المهارات حتى الإتقان الكامل وسلم التصحيح الوزاري."
                  : "SHATER BAC ne cherche pas à empiler plus de cours passifs. Il cible précisément vos besoins réels pour transformer chaque point vulnérable en réussite assurée."}
              </p>

              {/* Streams & Subjects Scope */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-theme-muted uppercase font-mono">
                  {isAr ? "المرحلة الحالية والشعب الأساسية:" : "Filières et matières intégrées :"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text">
                    {isAr ? "3AS — علوم تجريبية" : "3AS Sciences Expérimentales"}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text">
                    {isAr ? "3AS — رياضيات" : "3AS Mathématiques"}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text">
                    {isAr ? "3AS — تقني رياضي" : "3AS Technique Math"}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text">
                    {isAr ? "3AS — تسيير واقتصاد" : "3AS Gestion & Économie"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 text-xs text-theme-secondary">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary-soft)]/50 text-[var(--color-primary)] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>الرياضيات</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary-soft)]/50 text-[var(--color-primary)] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>الفيزياء والكيمياء</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary-soft)]/50 text-[var(--color-primary)] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>العلوم الطبيعية</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary-soft)]/50 text-[var(--color-primary)] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>المواد المنهجية والأدبية</span>
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-2xl font-bold shadow-clay px-8 py-5 flex items-center gap-2"
                  >
                    <span>{isAr ? "اكتشف SHATER BAC الآن" : "Découvrir SHATER BAC"}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Authentic Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-3xl overflow-hidden border border-theme shadow-clay max-w-md w-full group">
                <Image
                  src="/illustrations/shater-bac-workspace.jpg"
                  alt={isAr ? "مكتب دراسة هادئ ومسار التعلم التشخيصي في SHATER BAC" : "Espace de travail et parcours diagnostique SHATER BAC"}
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                    {isAr ? "بيئة دراسة هادئة ومركزة" : "Environnement Calme et Structuré"}
                  </span>
                  <p className="text-xs font-semibold leading-snug text-white/90 mt-1">
                    {isAr
                      ? "مسار تشخيصي مباشر، دفتر مهارات، وتدريب موجه يرفع جاهزيتك بهدوء."
                      : "Parcours diagnostique direct, carnet d'exercices et préparation sereine."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 6. SUCCESS PHILOSOPHY SECTION (النجاح عند الشاطر)
// ============================================================================

export function SuccessPhilosophySection({ isAr }: { isAr: boolean }) {
  const steps = [
    { labelAr: "فهم", labelFr: "Comprendre", subAr: "استيعاب المنطق", subFr: "Concepts clairs" },
    { labelAr: "تطبيق", labelFr: "Appliquer", subAr: "ممارسة منهجية", subFr: "Pratique guidée" },
    { labelAr: "إتقان", labelFr: "Maîtriser", subAr: "ترميم الأخطاء", subFr: "Zéro faille" },
    { labelAr: "جاهزية", labelFr: "Être Prêt", subAr: "ثقة يوم الامتحان", subFr: "Sérénité d'examen" },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-theme bg-surface">
      <Container size="md" className="text-center space-y-10">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "فلسفة النجاح" : "Philosophie du Succès"}</span>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans leading-snug">
            {isAr ? (
              <>
                النجاح ليس أن تدرس أكثر.. <br />
                <span className="text-[var(--color-primary)]">
                  النجاح أن تصبح قادرًا أكثر.
                </span>
              </>
            ) : (
              <>
                La réussite n'est pas d'étudier plus.. <br />
                <span className="text-[var(--color-primary)]">
                  Mais de devenir plus capable.
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
            {isAr
              ? "مقياس التفوق ليس ساعات الإرهاق أمام الكتب، بل المهارات التي تتقنها فعليًا وقدرتك على استرجاعها وحلها بدقة تحت ضغط الامتحان."
              : "Le véritable indicateur n'est pas le nombre d'heures passées devant les fiches, mais la solidité de vos réflexes le jour J."}
          </p>
        </div>

        {/* Visual Progression: فهم → تطبيق → إتقان → جاهزية */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-4">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card border border-theme shadow-sm flex flex-col items-center justify-center space-y-1 relative"
            >
              <span className="text-[10px] font-mono text-theme-muted font-bold">
                0{i + 1}
              </span>
              <span className="text-base sm:text-lg font-black text-theme-text">
                {isAr ? st.labelAr : st.labelFr}
              </span>
              <span className="text-[11px] text-[var(--color-primary)] font-medium">
                {isAr ? st.subAr : st.subFr}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 7. ROADMAP & ERROR LAB SHOWCASE (LIVE VISUALIZER)
// ============================================================================

export function RoadmapShowcaseSection({ isAr, locale }: { isAr: boolean; locale: "ar" | "fr" }) {
  return (
    <section className="py-16 sm:py-24 border-b border-theme bg-canvas">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>{isAr ? "من داخل المنظومة" : "Aperçu de la Plateforme"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "كيف تبدو خريطتك التعليمية اليومية؟" : "À quoi ressemble votre feuille de route ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "واجهة تفاعلية واضحة تحدد مكانك الحالي والمهارة التالية دون أي تشتت."
              : "Une interface épurée qui vous indique en permanence où vous en êtes et la prochaine étape."}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-[32px] border border-theme bg-card p-4 sm:p-6 shadow-clay">
            <div className="px-3 py-2 border-b border-theme flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-bold text-theme-text">
                  {isAr ? "محاكاة حية لخريطة التعلم والمهارات" : "Simulation interactive de votre carte"}
                </span>
              </div>
              <Badge variant="primary" size="sm" className="font-semibold text-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                {isAr ? "محدث لشعبتك" : "Filière adaptée"}
              </Badge>
            </div>

            <RoadVisualizer
              targetScore={16.5}
              currentBaselineText={isAr ? "المؤشر الحالي: 12.2/20" : "Niveau de départ : 12.2/20"}
              gapText={isAr ? "الفارق المستهدف: +4.3 نقاط" : "Écart à combler : +4.3 points"}
              activeMission={{
                id: "pilot-math",
                subjectId: "math",
                skillTitle: isAr ? "دراسة اتجاه تغير الدوال الأسية وحساب النهايات بدقة" : "Fonctions exponentielles et limites",
                estimatedMinutes: 20,
                reasonText: isAr
                  ? "رصدنا ثغرة في صياغة التبرير الرياضي. نصلحها في تمرين موجه مدته 15 دقيقة."
                  : "Point de vulnérabilité identifié. Réparation ciblée en 15 min.",
              }}
              masteredCount={8}
              totalSkills={28}
              locale={locale}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 8. WHAT WE STAND FOR (HONEST TRUST — NO INVENTED NUMBERS)
// ============================================================================

export function TrustAndCommitmentSection({ isAr }: { isAr: boolean }) {
  const commitments = [
    {
      titleAr: "مبني حول التشخيص",
      titleFr: "Fondé sur le Diagnostic",
      descAr: "لا نبدأ بالافتراضات. كل طالب يبدأ بفحص يحدد مكامن القوة ونقاط الضعف.",
      descFr: "Aucune supposition : évaluation initiale rigoureuse de vos points d'ancrage.",
    },
    {
      titleAr: "التركيز على المهارات",
      titleFr: "Focus Compétences",
      descAr: "نهتم بما يطلبه سلم التصحيح الوزاري الجزائري: دقة الأفعال الأدائية والمصطلحات.",
      descFr: "Alignement strict avec les exigences des grilles ministérielles algériennes.",
    },
    {
      titleAr: "تدرج حقيقي في الإتقان",
      titleFr: "Progression Réelle",
      descAr: "لا ننتقل من مهارة حتى يثبت الطالب قدرته على حل تمرين توأمي بدون مساعدة.",
      descFr: "Validation indispensable par exercice jumeau avant tout passage à la suite.",
    },
    {
      titleAr: "تجربة إنسانية مريحة",
      titleFr: "Sérénité et Équilibre",
      descAr: "نهتم بتهدئة قلق الطالب والأسرة عبر وضوح الخطوات وتوفير ساعات الإرهاق.",
      descFr: "Apaisement du stress grâce à la clarté des micro-objectifs quotidiens.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-theme bg-surface">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? "التزامنا التربوي" : "Nos Engagements"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "ما نعمل عليه ونلتزم به معك" : "Ce sur quoi nous nous engageons"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "لا نطلق وعوداً خيالية أو نسب نجاح وهمية. نلتزم بنظام علمي واضح يضعك في المسار الصحيح."
              : "Pas de promesses irréalistes : un système méthodique exigeant et bienveillant."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {commitments.map((c, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-2 hover:border-[var(--color-primary)]/40 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                0{i + 1}
              </div>
              <h3 className="font-extrabold text-theme-text text-sm sm:text-base">
                {isAr ? c.titleAr : c.titleFr}
              </h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr ? c.descAr : c.descFr}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 9. TRANSPARENT PRICING & FREE TRIAL
// ============================================================================

export function PricingSection({ isAr }: { isAr: boolean }) {
  return (
    <section id="pricing" className="py-16 sm:py-24 border-b border-theme bg-canvas">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "الشفافية الكاملة" : "Tarification Transparente"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "ابدأ مجاناً.. ثم قرر براحة بال" : "Commencez gratuitement, décidez sereinement"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "72 ساعة تجربة استكشافية مجانية كاملة الميزات بدون بطاقة بنكية وبدون أي التزام مسبق."
              : "72 heures d'accès complet sans engagement pour tester la méthode."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* 1. Free Discovery Trial */}
          <div className="rounded-[32px] border-2 border-[var(--color-primary)]/40 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-clay relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm" className="font-bold text-xs px-3 py-1 bg-[var(--color-primary)] text-white">
                  {isAr ? "تجربة استكشافية مجانية" : "Essai Gratuit 72h"}
                </Badge>
                <span className="text-xs text-theme-muted font-semibold">
                  {isAr ? "بدون بطاقة بنكية" : "Sans carte bancaire"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-theme-text font-mono">0</span>
                  <span className="text-lg font-bold text-theme-secondary">{isAr ? "دج" : "DZD"}</span>
                </div>
                <span className="text-xs text-[var(--color-primary)] font-bold block mt-1">
                  {isAr ? "صلاحية 72 ساعة كاملة لجميع الميزات" : "Accès complet pendant 72 heures"}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-theme-secondary border-t border-theme pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>{isAr ? "فحص تشخيصي كامل وتحديد الفجوات في شعبتك" : "Diagnostic initial et repérage des verrous"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>{isAr ? "فتح الخريطة التعليمية المتكيفة لجميع المواد" : "Accès à la feuille de route adaptative"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>{isAr ? "تجربة معمل الأخطاء لترميم نقاط الضعف" : "Accès au laboratoire d'erreurs"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>{isAr ? "محاكاة التمارين التوأمية وسلالم التنقيط" : "Simulation d'exercices jumeaux"}</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link href="/auth/register" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-2xl font-bold shadow-clay py-4 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? "ابدأ الـ 72 ساعة مجاناً الآن" : "Démarrer mes 72h gratuites"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Full Season Pass */}
          <div className="rounded-[32px] border-2 border-[var(--color-border-hover)] bg-card p-6 sm:p-8 flex flex-col justify-between shadow-clay relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm" className="font-bold text-xs px-3 py-1 border-[var(--color-primary)] text-[var(--color-primary)]">
                  {isAr ? "اشتراك الموسم الدراسي 2026/2027" : "Pass Saison Complète"}
                </Badge>
                <span className="text-[11px] font-bold text-theme-muted">
                  {isAr ? "دفعة واحدة" : "Paiement unique"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-theme-text font-mono">4,900</span>
                  <span className="text-lg font-bold text-theme-secondary">{isAr ? "دج / الموسم كاملاً" : "DZD / an"}</span>
                </div>
                <span className="text-xs text-theme-muted block mt-1">
                  {isAr ? "دفعة واحدة فقط حتى آخر يوم في امتحان البكالوريا" : "Paiement unique jusqu'aux épreuves du BAC"}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-theme-text border-t border-theme pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "وصول غير محدود لجميع وحدات المنهاج حتى نهاية الموسم" : "Accès complet jusqu'à la fin de la session"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "ترميم غير محدود لجميع الأخطاء في معمل الأخطاء" : "Remédiation illimitée dans le Lab d'erreurs"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "محاكي امتحان البكالوريا الرسمي بسلالم التصحيح" : "Sujets types avec barèmes officiels"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تفعيل فوري وآمن عبر بريدي موب (BaridiMob) أو CCP" : "Paiement BaridiMob ou mandat CCP"}</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <Link href="/subscribe" className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl font-bold py-4 flex items-center justify-center gap-2 hover:bg-[var(--color-primary-soft)]"
                >
                  <Award className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{isAr ? "تفاصيل الاشتراك بالموسم" : "Détails de l'abonnement"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
              <p className="text-[11px] text-center text-theme-muted">
                {isAr ? "تفعيل فوري بعد إرسال صورة الوصل" : "Activation après validation du reçu"}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 10. EXPANDABLE MASTER BRAND VISION (البداية BAC والرؤية أكبر)
// ============================================================================

export function MasterBrandVisionSection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-surface">
      <Container size="md" className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
          <ShaterIcon size={16} />
          <span>{isAr ? "رؤية الشاطر" : "Vision SHATER"}</span>
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-3xl font-black text-theme-text font-sans">
            {isAr ? "البداية: البكالوريا.. لكن الرؤية أكبر." : "Le point de départ : Le BAC. Mais la vision est plus vaste."}
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
            {isAr
              ? "اليوم نساعدك على معرفة مستواك والنجاح بامتياز في البكالوريا مع SHATER BAC. غدًا، صُممت منظومة الشاطر لمرافقتك في بناء وإتقان مهارات أخرى في مسارك الأكاديمي والمهني."
              : "Aujourd'hui, nous vous accompagnons vers l'excellence au Baccalauréat avec SHATER BAC. Demain, l'écosystème SHATER s'étendra à d'autres compétences éducatives et professionnelles."}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-theme-muted">
          <span>SHATER CORE</span>
          <span>→</span>
          <span className="text-[var(--color-primary)] font-bold">SHATER BAC</span>
          <span>→</span>
          <span>Future Skills & Domains</span>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 11. FAQ ACCORDION
// ============================================================================

interface FAQItem {
  questionAr: string;
  questionFr: string;
  answerAr: string;
  answerFr: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    questionAr: "ما هو الشاطر وكيف يختلف عن المنصات التعليمية التقليدية؟",
    questionFr: "Qu'est-ce que SHATER et en quoi diffère-t-il des plateformes classiques ?",
    answerAr: "الشاطر ليس منصة تكديس فيديوهات أو ملفات PDF. الشاطر منظومة ذكية للتعلم والتدريب وبناء الكفاءة؛ تبدأ بتشخيص مستواك، تحدد فجواتك، تدربك على المهارات التي تنقصك، تحلل أخطاءك، وتعيد اختبارك حتى تصل إلى الإتقان والجاهزية التامة.",
    answerFr: "SHATER n'est pas un catalogue passif de vidéos ou de PDF. C'est un écosystème intelligent axé sur le diagnostic, la remédiation méthodique et l'entraînement actif jusqu'à la maîtrise.",
  },
  {
    questionAr: "هل التجربة المجانية (72 ساعة) تتطلب بطاقة دفع أو أي التزام مسبق؟",
    questionFr: "L'essai gratuit de 72h nécessite-t-il une carte bancaire ?",
    answerAr: "لا، إطلاقاً. يمكنك التسجيل والبدء فوراً في الاستفادة من 72 ساعة استكشافية مجانية كاملة الميزات دون إدخال أي معلومات بنكية وبدون أي التزام.",
    answerFr: "Absolument aucun. Vous commencez immédiatement vos 72 heures d'essai sans renseigner de carte ni prendre aucun engagement.",
  },
  {
    questionAr: "كيف يعمل معمل الأخطاء (Error Lab) في إصلاح نقاط الضعف؟",
    questionFr: "Comment fonctionne le Lab d'erreurs pour combler les failles ?",
    answerAr: "عندما تخطئ في تمرين، لا نكتفي بإظهار الحل النموذجي. يحلل النظام سبب الخطأ (هل هو سوء فهم، خطأ حساب، أم خلل صياغة)، يعيد شرح الفكرة باختصار، ثم يقدم لك تمريناً توأمياً مماثلاً للتأكد من أنك تغلبت على نقطة الضعف نهائياً.",
    answerFr: "Le système diagnostique la source de l'erreur (incompréhension, calcul, rédaction), apporte un éclairage ciblé et vous propose un exercice miroir pour valider l'acquisition.",
  },
  {
    questionAr: "هل محتوى SHATER BAC متوافق مع المنهاج الجزائري الرسمي وسلالم التنقيط الوزارية؟",
    questionFr: "Le contenu est-il aligné avec le programme officiel algérien ?",
    answerAr: "نعم، 100%. تم بناء بنك المهارات والأسئلة والتمارين وسلالم التنقيط وفق معايير وزارة التربية الوطنية للبكالوريا الجزائرية، مع تركيز خاص على الأفعال الأدائية الدقيقة والكلمات المفتاحية المطلوبة في التصحيح الرسمي.",
    answerFr: "Oui, à 100%. Tous les exercices et grilles respectent strictement le référentiel officiel du Baccalauréat algérien.",
  },
  {
    questionAr: "كيف يتم تفعيل الاشتراك بعد انتهاء الـ 72 ساعة المجانية؟",
    questionFr: "Comment activer l'abonnement après les 72h gratuites ?",
    answerAr: "بكل بساطة عبر وسائل الدفع الوطنية المتاحة: تحويل بريدي موب (BaridiMob) أو إيداع CCP. ترفع صورة الوصل ويتم تفعيل حسابك فوراً للموسم الدراسي بأكمله.",
    answerFr: "Via BaridiMob ou mandat CCP classique. Il suffit de téléverser le reçu pour activer votre accès saisonnier.",
  },
  {
    questionAr: "هل يمكنني استخدام الشاطر من الهاتف والكمبيوتر في نفس الوقت؟",
    questionFr: "Peut-on utiliser la plateforme sur mobile et ordinateur ?",
    answerAr: "نعم، الشاطر مصمم ليعمل بسلاسة كاملة وسرعة فائقة على جميع الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر مع مزامنة فورية لمسار تقدمك.",
    answerFr: "Oui, l'interface est conçue pour être fluide et synchronisée sur smartphones, tablettes et ordinateurs.",
  },
];

export function LandingFAQ({ isAr }: { isAr: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-theme bg-canvas">
      <Container size="md" className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isAr ? "إجابات واضحة" : "Foire Aux Questions"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "الأسئلة الشائعة" : "Questions Fréquentes"}
          </h2>
          <p className="text-sm text-theme-secondary">
            {isAr ? "كل ما تحتاج معرفته عن منظومة الشاطر وطريقة العمل والتجربة المجانية." : "Tout ce que vous devez savoir avant de commencer."}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-theme bg-card transition-all overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-start gap-4 cursor-pointer hover:bg-surface/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-theme-text">
                    {isAr ? item.questionAr : item.questionFr}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-theme-secondary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[var(--color-primary)]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-theme-secondary leading-relaxed border-t border-theme/40 bg-surface/30 animate-in fade-in-50 duration-200">
                    {isAr ? item.answerAr : item.answerFr}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 12. FINAL CALL TO ACTION
// ============================================================================

export function FinalCTASection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-surface to-canvas relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[320px] bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="md" className="relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-4 py-1.5 text-xs font-bold text-[var(--color-primary)]">
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? "الشاطر • خطوتك الأولى تبدأ اليوم" : "SHATER • Votre premier pas commence aujourd'hui"}</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-theme-text font-sans leading-tight">
          {isAr ? (
            <>
              اعرف أين أنت.. وماذا ينقصك.. <br />
              <span className="text-[var(--color-primary)]">
                واصل للباك جاهزاً ومطمئناً.
              </span>
            </>
          ) : (
            <>
              Sachez où vous en êtes.. <br />
              <span className="text-[var(--color-primary)]">
                Et préparez votre examen en toute sérénité.
              </span>
            </>
          )}
        </h2>

        <p className="text-sm sm:text-base text-theme-secondary max-w-xl mx-auto leading-relaxed">
          {isAr
            ? "لا تترك نتيجتك ومستقبلك للتشتت. ابدأ تجربتك الاستكشافية المجانية لمدة 72 ساعة الآن واكتشف خريطتك في دقائق."
            : "Activez votre essai gratuit de 72h et découvrez votre plan d'action personnalisé dès aujourd'hui."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto rounded-2xl font-bold shadow-clay px-10 py-6 min-h-[52px] flex items-center justify-center gap-2 text-base"
            >
              <span>{isAr ? "ابدأ رحلتك الآن (72 ساعة مجاناً)" : "Commencer l'essai 72h gratuit"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>

          <Link href="/auth" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-2xl font-semibold px-8 py-6 min-h-[52px]"
            >
              <span>{isAr ? "تسجيل الدخول" : "Se connecter"}</span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-theme-muted pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "0 دج وبدون بطاقة دفع" : "0 DZD sans engagement"}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{isAr ? "وصول فوري خلال 60 ثانية" : "Accès instantané en 60s"}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[var(--color-accent)]" />
            <span>{isAr ? "متوافق مع المنهاج الرسمي" : "Programme officiel garanti"}</span>
          </span>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 13. COMPREHENSIVE SHATER FOOTER
// ============================================================================

export function ShaterFooter({ isAr }: { isAr: boolean }) {
  return (
    <footer className="border-t border-theme bg-surface py-12 sm:py-16 text-xs text-theme-secondary transition-colors">
      <Container size="lg" className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <Logo size="md" showTagline={false} />
            <p className="text-xs text-theme-secondary max-w-sm leading-relaxed">
              {isAr
                ? "منظومة ذكية للتعلم والتدريب وبناء الكفاءة. تبدأ مع SHATER BAC للبكالوريا الجزائرية."
                : "Système intelligent d'apprentissage et de préparation au Baccalauréat Algérien."}
            </p>
            <div className="text-[11px] font-medium text-theme-muted pt-1">
              « {isAr ? "ماشي واش تقرا. كيفاش توصل." : "Ce n'est pas seulement ce que vous apprenez. C'est comment vous y parvenez."} »
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
                {isAr ? "المنظومة" : "Écosystème"}
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "الرئيسية" : "Accueil"}
                  </Link>
                </li>
                <li>
                  <Link href="#shater-bac" className="hover:text-[var(--color-primary)] transition-colors">
                    SHATER BAC
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "كيف تعمل؟" : "Comment ça marche ?"}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "الأسعار والتجربة" : "Tarifs"}
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "الأسئلة الشائعة" : "FAQ"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
                {isAr ? "الدخول والتسجيل" : "Accès"}
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/auth" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "تسجيل الدخول" : "Connexion"}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "فتح حساب جديد (72 سا مجاناً)" : "Créer un compte (72h gratuit)"}
                  </Link>
                </li>
                <li>
                  <Link href="/subscribe" className="hover:text-[var(--color-primary)] transition-colors">
                    {isAr ? "تفعيل الاشتراك" : "Abonnement"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
              {isAr ? "المساعدة والتواصل" : "Support"}
            </span>
            <p className="text-xs text-theme-secondary">
              {isAr ? "فريق الدعم الفني متواجد لمرافقتك والإجابة عن استفساراتك." : "Notre équipe d'assistance est à votre écoute."}
            </p>
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى مساعدة واستفسار حول منظومة الشاطر.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold text-xs hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +213 550 85 32 34</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="border-t border-theme/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-theme-muted">
          <span>
            الشاطر | SHATER © {new Date().getFullYear()} — {isAr ? "جميع الحقوق محفوظة." : "Tous droits réservés."}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-theme-secondary">
              {isAr ? "منظومة ذكية للتعلم وبناء الكفاءة" : "Écosystème d'apprentissage intelligent"}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ============================================================================
// 14. MASTER LANDING VIEW
// ============================================================================

export function LandingView() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    trackEvent("landing_view", { isLoggedIn: Boolean(user) });
    if (user?.id) {
      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    }
  }, [user]);

  const studentName = studentProfile?.firstName || null;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      {/* Smart Top Greeting Banner for Logged-In Students */}
      {user && (
        <div className="bg-[var(--color-primary)] text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 shadow-sm relative z-20">
          <span>
            {isAr
              ? `مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية في الشاطر بانتظارك ومسارك محفوظ.`
              : `Bienvenue à nouveau ${studentName ? studentName : ""} ! Votre parcours SHATER vous attend.`}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0"
          >
            <span>{isAr ? "الانتقال إلى لوحة التلميذ" : "Aller au tableau de bord"}</span>
            <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HERO SECTION: BRAND, CONTEXT, CALM CONFIDENCE                   */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-theme overflow-hidden bg-gradient-to-b from-canvas via-surface/50 to-surface">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-[var(--color-primary)]/10 pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Col: Headings & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              
              {/* Context Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                <ShaterIcon size={16} />
                <span>
                  {isAr
                    ? "منظومة ذكية تساعدك على النجاح في البكالوريا"
                    : "Système intelligent pour réussir votre Baccalauréat"}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text leading-[1.2] font-sans">
                {isAr ? (
                  <>
                    اعرف مستواك. أصلح نقاط ضعفك. <br />
                    <span className="text-[var(--color-primary)]">
                      واصل للباك جاهز.
                    </span>
                  </>
                ) : (
                  <>
                    Mesurez votre niveau. Réparez vos failles. <br />
                    <span className="text-[var(--color-primary)]">
                      Arrivez prêt au BAC.
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Explanation */}
              <p className="text-base sm:text-lg text-theme-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? "الشاطر لا يعطيك نفس الدروس التي يأخذها الجميع فقط. يبدأ من مستواك الحقيقي، يحدد ما ينقصك بدقة، يدربك عمليًا، يحلل أخطاءك، ويتابع تقدمك خطوة بخطوة حتى الجاهزية التامة."
                  : "SHATER ne vous donne pas simplement des cours génériques. Il part de votre niveau réel, cible vos manques, analyse vos erreurs et vous entraîne jusqu'à la pleine maîtrise."}
              </p>

              {/* Brand Philosophy Tag */}
              <div className="inline-block p-2.5 px-4 rounded-xl bg-surface border border-theme text-xs font-semibold text-theme-muted">
                « {isAr ? "ماشي واش تقرا. كيفاش توصل." : "Ce n'est pas seulement ce que vous apprenez. C'est comment vous y parvenez."} »
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-bold shadow-clay px-8 py-6 rounded-2xl flex items-center justify-center gap-2.5 text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>{isAr ? "ابدأ رحلتك الآن" : "Commencer maintenant"}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-6 rounded-2xl font-semibold text-sm hover:bg-card"
                  >
                    <span>{isAr ? "كيف تعمل الشاطر؟" : "Comment ça marche ?"}</span>
                  </Button>
                </Link>
              </div>

              {/* 72h Guarantee Pill */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary-soft)]/60 border border-[var(--color-primary)]/20 text-xs text-theme-secondary flex items-center gap-3 max-w-xl">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                <span className="leading-normal font-medium">
                  {isAr
                    ? "✨ 72 ساعة تجربة استكشافية مجانية كاملة الميزات (0 دج) دون الحاجة لبطاقة بنكية — ابدأ واكتشف خريطتك الآن."
                    : "✨ 72 heures d'essai complet gratuit (0 DZD) sans carte bancaire — activez votre feuille de route dès aujourd'hui."}
                </span>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-theme-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "تشخيص فوري دقيق" : "Diagnostic initial"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{isAr ? "معمل ترميم الأخطاء" : "Lab d'erreurs"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[var(--color-accent)]" />
                  <span>{isAr ? "سلالم التصحيح الوزارية" : "Barèmes officiels"}</span>
                </span>
              </div>
            </div>

            {/* Right Col: Authentic Algerian Student Hero Asset */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-[36px] overflow-hidden border border-theme bg-card shadow-clay p-2 group max-w-md w-full">
                <div className="relative rounded-[30px] overflow-hidden aspect-[4/5] w-full">
                  <Image
                    src="/illustrations/shater-hero.jpg"
                    alt={isAr ? "طالبة بكالوريا جزائرية تدرس بثقة وهدوء عبر منظومة الشاطر" : "Étudiante algérienne préparant le BAC avec sérénité"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)]/90 text-white text-[11px] font-bold w-fit mb-2 backdrop-blur-md">
                      <Target className="w-3.5 h-3.5" />
                      <span>{isAr ? "المستوى الحالي ← التقدم ← الجاهزية" : "Niveau → Progrès → Prêt"}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      {isAr ? "ثقة وهدوء ووضوح في كل خطوة" : "Confiance, calme et clarté à chaque étape"}
                    </h3>
                    <span className="text-xs text-white/80 font-medium mt-1">
                      {isAr ? "«التدريب الموجه يغنيك عن ساعات التشتت المرهقة»" : "« L'entraînement ciblé remplace les heures de dispersion »"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 2. FROM CONFUSION TO CLARITY (STORYTELLING)                         */}
      {/* =================================================================== */}
      <ClarityComparisonSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 3. HOW SHATER WORKS (THE 8-STEP ENGINE)                             */}
      {/* =================================================================== */}
      <HowItWorksSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 4. WHY SHATER (6 CORE VALUE CARDS)                                  */}
      {/* =================================================================== */}
      <WhyShaterSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 5. SHATER BAC (THE SPECIALIZED FIRST PRODUCT)                       */}
      {/* =================================================================== */}
      <ShaterBacSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 6. SUCCESS PHILOSOPHY (النجاح ليس أن تدرس أكثر)                     */}
      {/* =================================================================== */}
      <SuccessPhilosophySection isAr={isAr} />

      {/* =================================================================== */}
      {/* 7. TARGET SIMULATOR & INTERACTIVE ROADMAP                           */}
      {/* =================================================================== */}
      <section id="simulator" className="py-16 sm:py-24 border-b border-theme bg-surface">
        <Container size="lg">
          <TargetScoreSimulator isAr={isAr} />
        </Container>
      </section>

      <RoadmapShowcaseSection isAr={isAr} locale={locale === "fr" ? "fr" : "ar"} />

      {/* =================================================================== */}
      {/* 8. WHAT WE STAND FOR (HONEST COMMITMENTS)                           */}
      {/* =================================================================== */}
      <TrustAndCommitmentSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 9. TRANSPARENT PRICING & 72H FREE TRIAL                             */}
      {/* =================================================================== */}
      <PricingSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 10. FAQ ACCORDION                                                   */}
      {/* =================================================================== */}
      <LandingFAQ isAr={isAr} />

      {/* =================================================================== */}
      {/* 11. EXPANDABLE MASTER BRAND VISION                                  */}
      {/* =================================================================== */}
      <MasterBrandVisionSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 12. FINAL CALL TO ACTION                                            */}
      {/* =================================================================== */}
      <FinalCTASection isAr={isAr} />

      {/* =================================================================== */}
      {/* 13. COMPREHENSIVE SHATER FOOTER                                     */}
      {/* =================================================================== */}
      <ShaterFooter isAr={isAr} />

    </AppShell>
  );
}
