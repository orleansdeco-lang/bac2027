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
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
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
  Zap,
  Clock,
  Heart,
  HelpCircle,
  ChevronDown,
  Compass,
  GraduationCap,
  Award,
  BookOpen,
  Sliders,
  Check,
  X,
  Stethoscope,
  Laptop,
  Flame,
  UserCheck,
  FileCheck,
  Lock,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// 1. TARGET SCORE SIMULATOR COMPONENT
// ============================================================================

interface SpecialtyTier {
  minScore: number;
  maxScore: number;
  titleAr: string;
  titleFr: string;
  facultiesAr: string[];
  facultiesFr: string[];
  color: string;
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
    color: "from-blue-600 to-cyan-500",
    badgeAr: "مستوى جيد جداً",
    badgeFr: "Très Bon Niveau",
    recommendedMinutes: 45,
    summaryAr: "تحتاج إلى تثبيت الأساسيات وسد الثغرات المنهجية لضمان مكانك دون مفاجآت.",
    summaryFr: "Consolidez vos bases et sécurisez votre mention sans stress.",
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
    color: "from-emerald-600 to-teal-500",
    badgeAr: "امتياز واعد",
    badgeFr: "Mention Bien+",
    recommendedMinutes: 50,
    summaryAr: "خطة مركزة تركز على رفع الدقة في سلم التنقيط الوزاري وتحويل نصف النقطة الضائعة إلى رصيد دائم.",
    summaryFr: "Chaque demi-point compte : perfectionnez la rigueur méthodologique officielle.",
  },
  {
    minScore: 16.0,
    maxScore: 17.19,
    titleAr: "عتبة كليات العلوم الطبية والمدارس العليا للأساتذة",
    titleFr: "Sciences Médicales & ENS",
    facultiesAr: [
      "المدارس العليا للأساتذة (ENS - أستاذ ثانوي / متوسط)",
      "كليات الصيدلة وطب الأسنان",
      "المدارس العليا للأقسام التحضيرية في العلوم والتقنيات",
      "المدارس الوطنية العليا للإلكترونيك والأوتوماتيك",
    ],
    facultiesFr: [
      "Écoles Normales Supérieures (ENS)",
      "Pharmacie & Chirurgie Dentaire",
      "Classes Préparatoires Grandes Écoles",
      "Génie Électrique & Automatique",
    ],
    color: "from-amber-500 to-orange-500",
    badgeAr: "مرتبة الشرف الأولى",
    badgeFr: "Mention Très Bien",
    recommendedMinutes: 60,
    summaryAr: "القضاء التام على أخطاء المنهجية وحل التمارين المركبة بسلاسة وسرعة تحت ضغط الوقت.",
    summaryFr: "Maîtrise absolue du barème et automatisation des réflexes d'examen.",
  },
  {
    minScore: 17.2,
    maxScore: 20.0,
    titleAr: "قمة النخبة الوطنية: كليات الطب والمدارس العليا للذكاء الاصطناعي",
    titleFr: "Élite Nationale : Médecine & ENSIA / ESI",
    facultiesAr: [
      "كليات الطب البشري (Faculté de Médecine)",
      "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA - القطب التكنولوجي بسيدي عبد الله)",
      "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
      "المدرسة الوطنية المتعددة التقنيات (Polytechnique ENP)",
    ],
    facultiesFr: [
      "Faculté de Médecine",
      "École Nationale Supérieure d'IA (ENSIA)",
      "École Supérieure d'Informatique (ESI)",
      "École Nationale Polytechnique (ENP)",
    ],
    color: "from-purple-600 via-pink-600 to-rose-500",
    badgeAr: "نخبة الجزائر 🇩🇿",
    badgeFr: "Élite Nationale 🇩🇿",
    recommendedMinutes: 65,
    summaryAr: "صفر أخطاء متكررة. إتقان معمل الأخطاء وحصد العلامات الكاملة في المواد الأساسية والفرعية.",
    summaryFr: "Précision chirurgicale. Remédiation systématique de la moindre faille.",
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
    <div className="rounded-[32px] border border-theme bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-clay">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? "محاكي المعدل والوجهة الجامعية" : "Simulateur d'Objectif & Orientation"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-theme-text font-sans">
            {isAr ? "حدّد معدل أحلامك.. واكتشف ماذا يتطلب منك يومياً" : "Définissez votre cible BAC"}
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            {isAr
              ? "حرك المؤشر لترى التخصصات المتاحة والخطة الزمنية اليومية المطلوبة لتحقيقها."
              : "Ajustez le curseur pour visualiser vos perspectives universitaires et l'effort quotidien requis."}
          </p>
        </div>

        {/* Score Display Card */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-surface border border-theme px-5 py-3 rounded-2xl shadow-sm">
          <div className="text-start">
            <span className="text-[10px] font-bold text-theme-muted uppercase block">
              {isAr ? "المعدل المستهدف" : "Moyenne Cible"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] font-mono">
                {score.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-theme-secondary">/20</span>
            </div>
          </div>
          <div className="h-10 w-px bg-theme-border mx-1" />
          <Badge
            variant="primary"
            size="md"
            className="font-bold whitespace-nowrap text-xs bg-gradient-to-r text-white shadow-sm border-0"
            style={{
              backgroundImage:
                score >= 17.2
                  ? "linear-gradient(135deg, #9333ea, #e11d48)"
                  : score >= 16.0
                  ? "linear-gradient(135deg, #d97706, #ea580c)"
                  : score >= 14.5
                  ? "linear-gradient(135deg, #059669, #0d9488)"
                  : "linear-gradient(135deg, #2563eb, #06b6d4)",
            }}
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
          <span className="text-purple-600 font-bold">18.50+ (امتياز مع مرتبة الشرف)</span>
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

          <p className="text-xs text-theme-secondary bg-card p-3 rounded-xl border border-theme/60 leading-relaxed">
            💡 {isAr ? activeTier.summaryAr : activeTier.summaryFr}
          </p>
        </div>

        {/* Right: Daily Effort Prescription */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-theme p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-theme-muted uppercase">
              {isAr ? "الوصفة اليومية المنهجية" : "Prescription Quotidienne"}
            </span>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "تركيز ذكي بدون إرهاق" : "Efficacité Garantie"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-3.5 rounded-xl border border-theme">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shrink-0 font-bold text-lg">
              {activeTier.recommendedMinutes}
            </div>
            <div>
              <span className="text-xs font-bold text-theme-text block">
                {isAr
                  ? `${activeTier.recommendedMinutes} دقيقة يومياً من التعلم الموجه`
                  : `${activeTier.recommendedMinutes} min d'entraînement ciblé`}
              </span>
              <span className="text-[11px] text-theme-secondary">
                {isAr
                  ? "بدل 7 ساعات من الحفظ العشوائي والتشتت المرهق!"
                  : "Au lieu d'heures de révision passive épuisante."}
              </span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-theme-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isAr ? "مهمة واحدة يومياً مقسمة إلى خطوات عملية" : "1 mission par jour en micro-étapes"}</span>
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{isAr ? "تحليل هفوتين في معمل الأخطاء (Error Lab)" : "Analyse de 2 erreurs dans le Lab"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{isAr ? "اختبار توأمي لتأكيد اكتساب المهارة" : "Validation par test jumeau"}</span>
            </li>
          </ul>

          <Link href="/auth/register" className="block pt-1">
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-xl font-bold shadow-clay flex items-center justify-center gap-2 py-3"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAr ? `ابدأ خريطتك لهذا الهدف (${score.toFixed(2)})` : "Démarrer pour cet objectif"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. BEFORE VS. AFTER COMPARISON GRID
// ============================================================================

export function MethodologyComparison({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-surface">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] font-mono">
            {isAr ? "المقارنة المصيرية" : "COMPARAISON DÉCISIVE"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "لماذا لا تنجح طريقة التمارين العشوائية؟" : "Pourquoi le bachotage aléatoire échoue ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "الفرق بين من يكدس التمارين ويرهق نفسه دون نتيجة، وبين من يمتلك منهجية واضحة تضمن له الامتياز."
              : "La différence cruciale entre accumuler passivement des exercices et cibler ses verrous méthodologiques."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Traditional Way */}
          <div className="rounded-3xl border border-red-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-theme-text text-base sm:text-lg">
                    {isAr ? "الطريقة التقليدية المرهقة" : "L'Approche Traditionnelle"}
                  </h3>
                  <span className="text-xs text-red-500 font-semibold">
                    {isAr ? "تعب ذهني وتشتت وضياع للنقاط" : "Épuisement et dispersion"}
                  </span>
                </div>
              </div>
              <Badge variant="outline" size="sm" className="border-red-500/30 text-red-500 text-[10px]">
                {isAr ? "عشوائية" : "Aléatoire"}
              </Badge>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-theme-secondary">
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>
                  {isAr
                    ? "حل عشرات التمارين وحفظ حلولها دون فهم سبب اختيار الفكرة أو صياغة الإجابة."
                    : "Résoudre des dizaines de sujets en mémorisant les corrigés sans comprendre la démarche."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>
                  {isAr
                    ? "تكرار نفس أخطاء المنهجية (الخلط بين التفسير والتحليل، ضياع الكلمات المفتاحية الوزارية)."
                    : "Répétition systématique des mêmes erreurs de rédaction et perte des points de barème."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>
                  {isAr
                    ? "تشتت التلميذ بين مئات ملفات PDF، مجموعات التيليغرام، وساعات الدروس الخصوصية المكتظة."
                    : "Dispersion entre centaines de PDF, chaînes Telegram et cours particuliers surchargés."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>
                  {isAr
                    ? "قلق مستمر وخوف الوالدين مع اقتراب موعد الامتحان بسبب عدم وضوح المستوى الحقيقي."
                    : "Angoisse parentale croissante sans aucune visibilité sur la progression réelle."}
                </span>
              </li>
            </ul>
          </div>

          {/* BAC Mastery Way */}
          <div className="rounded-3xl border border-emerald-500/40 bg-card p-6 sm:p-8 space-y-6 shadow-clay relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-theme-text text-base sm:text-lg">
                    {isAr ? "مع منصة امتياز البكالوريا" : "Avec BAC Mastery"}
                  </h3>
                  <span className="text-xs text-emerald-500 font-semibold">
                    {isAr ? "منهجية علمية دقيقة تضمن الامتياز" : "Méthodologie ciblée et rassurante"}
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="bg-emerald-600 text-white text-[10px] font-bold">
                {isAr ? "امتياز موجه" : "Excellence"}
              </Badge>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-theme-text">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                <span>
                  {isAr
                    ? "خريطة تفاعلية ذكية تحدد بدقة أين تضيع النصف نقطة، وتركز جهدك اليومي على معالجتها."
                    : "Feuille de route adaptative ciblant au millimètre près vos points de vulnérabilité."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                <span>
                  {isAr
                    ? "معمل الأخطاء (Error Lab): تحويل كل عثرة إلى مهارة مكتسبة دائمة في 10 دقائق فقط."
                    : "Lab d'erreurs : transformation immédiate de chaque fausse note en compétence durable."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                <span>
                  {isAr
                    ? "تدريب مكثف على الأفعال الأدائية وسلم التصحيح الوزاري المعتمد في البكالوريا الرسمية."
                    : "Maîtrise rigoureuse des verbes d'action et des grilles de notation officielles."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                <span>
                  {isAr
                    ? "هدوء نفسي وطمأنينة تامة للأسرة: متابعة يومية تظهر نسبة التمكن الحقيقية قبل دخول قاعة الامتحان."
                    : "Sérénité absolue pour la famille avec indicateurs objectifs de réussite."}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 3. PROPRIETARY 4 PILLARS
// ============================================================================

export function FourPillarsSection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-canvas">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] font-mono">
            {isAr ? "أركان منهجية الامتياز" : "LES 4 PILIERS DU SUCCÈS"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "منظومة تعليمية متكاملة تقودك نحو القمة" : "Un système éducatif complet vers l'excellence"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "لا نكتفي بإعطائك الدروس، بل نبني عقليتك ومهاراتك في إدارة الامتحان."
              : "Nous ne nous contentons pas de vous donner des cours : nous sculptons votre méthode."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <Card className="p-6 border-theme bg-card hover:border-[var(--color-primary)]/50 transition-all hover:shadow-clay space-y-4 rounded-3xl group">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase font-mono">
                01. ROADMAP
              </span>
              <h3 className="font-extrabold text-theme-text text-base">
                {isAr ? "الخريطة التعليمية المتكيفة" : "Feuille de Route Adaptative"}
              </h3>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "خارطة طريق حية ترشدك مهارة بمهارة. تحدد ما تدرسه اليوم بدقة بناءً على مستواك الحقيقي وشعبتك."
                : "Navigation précise compétence par compétence, adaptée à votre filière et votre niveau."}
            </p>
          </Card>

          {/* Pillar 2 */}
          <Card className="p-6 border-theme bg-card hover:border-[var(--color-accent)]/50 transition-all hover:shadow-clay space-y-4 rounded-3xl group">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase font-mono">
                02. ERROR LAB
              </span>
              <h3 className="font-extrabold text-theme-text text-base">
                {isAr ? "معمل ترميم الأخطاء" : "Laboratoire d'Erreurs"}
              </h3>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "«الغلط ماشي عيب.. الغلط معلومة». تشخيص أسباب الخطأ (فهم، حساب، صياغة، أو تسرع) وترميمه فوراً."
                : "Chaque faux pas devient un tremplin grâce au diagnostic précis de la source de l'erreur."}
            </p>
          </Card>

          {/* Pillar 3 */}
          <Card className="p-6 border-theme bg-card hover:border-[var(--color-warning)]/50 transition-all hover:shadow-clay space-y-4 rounded-3xl group">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/20 flex items-center justify-center text-[var(--color-warning)] group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-warning)] uppercase font-mono">
                03. BARÈME & KEYWORDS
              </span>
              <h3 className="font-extrabold text-theme-text text-base">
                {isAr ? "منهجية الحل وسلم التنقيط" : "Rigueur du Barème Officiel"}
              </h3>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "تدريب دقيق على الأفعال الأدائية والكلمات المفتاحية التي يبحث عنها المصحح الوزاري لانتزاع العلامة الكاملة."
                : "Entraînement chirurgical aux verbes d'action et mots-clés attendus par les correcteurs."}
            </p>
          </Card>

          {/* Pillar 4 */}
          <Card className="p-6 border-theme bg-card hover:border-[var(--color-success)]/50 transition-all hover:shadow-clay space-y-4 rounded-3xl group">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-success-soft)] border border-[var(--color-success)]/20 flex items-center justify-center text-[var(--color-success)] group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-success)] uppercase font-mono">
                04. D-DAY & RETEST
              </span>
              <h3 className="font-extrabold text-theme-text text-base">
                {isAr ? "الاختبارات التوأمية ومحاكي D-Day" : "Simulateur D-Day & Retest"}
              </h3>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "لا تغادر المهارة حتى تثبت تمكنك في تمرين توأمي مقارب، مع محاكي البكالوريا الحقيقي وقاعدة الـ 30 دقيقة."
                : "Validation définitive par sujet jumeau et simulation réelle sous contrainte chronométrée."}
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 4. HEARTFELT LETTER TO PARENTS
// ============================================================================

export function ParentsMessageSection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-gradient-to-b from-surface via-card to-surface">
      <Container size="lg">
        <div className="rounded-[36px] border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-emerald-500/5 p-6 sm:p-10 lg:p-14 shadow-clay relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Col: The Message */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? "رسالة صادقة من القلب إلى أولياء الأمور" : "Message aux Parents d'Élèves"}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans leading-tight">
                {isAr ? (
                  <>
                    إلى الأب الكريم.. إلى الأم الفاضلة.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600">
                      تعبكم ودعاؤكم أمانة في أعناقنا.
                    </span>
                  </>
                ) : (
                  <>
                    Chers parents.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600">
                      Votre investissement et votre sérénité sont notre priorité.
                    </span>
                  </>
                )}
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-theme-secondary leading-relaxed">
                <p>
                  {isAr
                    ? "نعلم جيداً أن عام البكالوريا ليس مجرد عام دراسي للتلميذ وحده، بل هو عام يحبس فيه البيت كله أنفاسه، وتُبذل فيه التضحيات المادية والمعنوية، طلباً لتلك اللحظة المباركة التي تزغرد فيها الأمهات ويذرف الآباء دموع الفخر والاعتزاز."
                    : "Nous savons que l'année du BAC mobilise toute la famille, entre sacrifices financiers et anxiété quotidienne dans l'attente du grand jour."}
                </p>
                <p>
                  {isAr
                    ? "النجاح بامتياز لا يتحقق بإجبار التلميذ على الجلوس 8 ساعات متواصلة أمام الأوراق وهو حائر بين التمارين، بل بتزويده بـ «بوصلة ذكية» تعرف مكامن ضعفه بدقة، وتوفر عليه الجهد والتشتت، وتعيد إليه الثقة بنفسه يوماً بعد يوم."
                    : "L'excellence ne s'obtient pas en forçant l'élève à travailler 8 heures dans la confusion, mais en lui offrant une boussole méthodique infaillible."}
                </p>
              </div>

              {/* 3 Pillars of Parent Assurance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>{isAr ? "متابعة دقيقة" : "Suivi Réel"}</span>
                  </div>
                  <p className="text-xs text-theme-secondary">
                    {isAr
                      ? "رؤية حقيقية لنسبة تمكن ابنك من المهارات بدلاً من الاعتماد على التخمين."
                      : "Visibilité concrète sur le niveau réel de préparation."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? "ترشيد المصاريف" : "Investissement Sûr"}</span>
                  </div>
                  <p className="text-xs text-theme-secondary">
                    {isAr
                      ? "توفير مئات آلاف الدنانير الضائعة في الدروس الخصوصية العشوائية المكتظة."
                      : "Fin des dépenses excessives en cours particuliers inefficaces."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                    <Heart className="w-4 h-4" />
                    <span>{isAr ? "راحة وطمأنينة" : "Sérénité Familiale"}</span>
                  </div>
                  <p className="text-xs text-theme-secondary">
                    {isAr
                      ? "تقليل ضغط التوتر والخوف، وبناء جو عائلي مشجع ومطمئن طيلة العام."
                      : "Climat familial apaisé grâce à une méthode structurée."}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-2xl font-bold shadow-clay px-8 py-5 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isAr ? "سجل ابنك الآن واستفد من 3 أيام مجاناً" : "Inscrire mon enfant (Essai 72h gratuit)"}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Col: Image of Mother and Son Rejoicing */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative rounded-[32px] overflow-hidden border-2 border-theme shadow-2xl group max-w-sm">
                <Image
                  src="/illustrations/bac-success-joy.jpg"
                  alt={isAr ? "فرحة الأم وابنها بنجاح البكالوريا بامتياز" : "Joie de la réussite au BAC"}
                  width={500}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                    {isAr ? "هذه اللحظة تستحق كل جهد" : "Cette fierté n'a pas de prix"}
                  </span>
                  <h4 className="text-base sm:text-lg font-black leading-tight">
                    {isAr ? "دموع الفرح وفخر العائلة بنيل شهادة البكالوريا" : "Larmes de joie et fierté partagée"}
                  </h4>
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
// 5. ROADMAP & ERROR LAB SHOWCASE (IMAGE + LIVE VISUALIZER)
// ============================================================================

export function RoadmapShowcaseSection({ isAr, locale }: { isAr: boolean; locale: "ar" | "fr" }) {
  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-canvas">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] font-mono">
            {isAr ? "من داخل المنصة" : "APERÇU DE LA PLATEFORME"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "كيف تبدو رحلتك اليومية نحو الامتياز؟" : "À quoi ressemble votre parcours quotidien ?"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "واجهة تفاعلية ذكية تجمع بين وضوح الخريطة وقوة معمل الأخطاء."
              : "Une interface claire alliant feuille de route vivante et laboratoire de remédiation."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Study Roadmap Image Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative rounded-[32px] overflow-hidden border border-theme shadow-clay max-w-md w-full group">
              <Image
                src="/illustrations/bac-study-roadmap.jpg"
                alt={isAr ? "التلميذ يدرس بتركيز وهدوء عبر خريطة البكالوريا التفاعلية" : "Étudiant révisant avec la feuille de route"}
                width={600}
                height={600}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {isAr ? "مسار حي يتكيف يومياً" : "Parcours Dynamique"}
                  </span>
                </div>
                <p className="text-sm font-bold leading-snug">
                  {isAr
                    ? "تركيز كامل، هدوء نفسي، وثقة تتصاعد مع كل خطأ يتم ترميمه."
                    : "Concentration maximale et confiance renforcée à chaque étape validée."}
                </p>
              </div>
            </div>
          </div>

          {/* Right: The Interactive Live RoadVisualizer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-[32px] border border-theme bg-card p-4 sm:p-6 backdrop-blur-sm shadow-clay">
              <div className="px-3 py-2 border-b border-theme flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-bold text-theme-text">
                    {isAr ? "محاكاة حية لخريطتك الدراسية" : "Simulation interactive de votre carte"}
                  </span>
                </div>
                <Badge variant="primary" size="sm" className="font-semibold text-[10px]">
                  {isAr ? "محدث لشعبتك" : "Filière adaptée"}
                </Badge>
              </div>

              <RoadVisualizer
                targetScore={16.8}
                currentBaselineText={isAr ? "المؤشر الحالي: 12.2/20" : "Niveau de départ : 12.2/20"}
                gapText={isAr ? "الفارق المستهدف: +4.6 نقاط" : "Écart à combler : +4.6 points"}
                activeMission={{
                  id: "pilot-math",
                  subjectId: "math",
                  skillTitle: isAr ? "دراسة اتجاه تغير الدوال الأسية وحساب النهايات" : "Fonctions exponentielles et limites",
                  estimatedMinutes: 20,
                  reasonText: isAr
                    ? "رصدنا ضياع نصف نقطة في صياغة التبرير الرياضي. نصلحوها في 15 دقيقة."
                    : "Signal de vulnérabilité repéré. Réparation ciblée en 15 min.",
                }}
                masteredCount={7}
                totalSkills={31}
                locale={locale}
              />
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-theme text-xs text-theme-secondary flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isAr
                  ? "كل مهارة تفتح مهمة مركزة تدوم بين 15 إلى 25 دقيقة فقط، تليها أسئلة دقيقة تكشف أي التباس قبل أن يظهر في امتحان البكالوريا."
                  : "Chaque compétence déclenche une micro-mission de 15 à 25 minutes avec vérification immédiate."}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 6. PRICING & FREE TRIAL CARDS
// ============================================================================

export function PricingSection({ isAr }: { isAr: boolean }) {
  return (
    <section id="pricing" className="py-14 sm:py-20 border-b border-theme bg-surface">
      <Container size="lg" className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-mono">
            {isAr ? "الشفافية والضمان" : "TARIFICATION TRANSPARENTE"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "ابدأ مجاناً.. واستثمر في مستقبلك براحة بال" : "Commencez gratuitement, investissez sereinement"}
          </h2>
          <p className="text-sm sm:text-base text-theme-secondary">
            {isAr
              ? "72 ساعة كاملة بدون أي التزام ولا دفع مسبق. جرّب الخريطة، عالج أخطاءك، ثم قرر."
              : "72 heures complètes sans engagement. Testez la méthode et décidez par vous-même."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* 1. Free Trial Card */}
          <div className="rounded-[32px] border-2 border-[var(--color-primary)]/40 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-clay relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm" className="font-bold text-xs px-3 py-1">
                  {isAr ? "تجربة استكشافية مجانية" : "Essai Gratuit 72h"}
                </Badge>
                <span className="text-xs text-theme-muted font-semibold">
                  {isAr ? "بدون بطاقة دفع" : "Sans carte bancaire"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-theme-text font-mono">0</span>
                  <span className="text-lg font-bold text-theme-secondary">{isAr ? "دج" : "DZD"}</span>
                </div>
                <span className="text-xs text-emerald-500 font-bold block mt-1">
                  {isAr ? "صلاحية 72 ساعة كاملة الميزات" : "Accès complet pendant 72 heures"}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-theme-secondary border-t border-theme pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "تشخيص كامل وتحديد نقاط الاختناق في شعبتك" : "Diagnostic initial et ciblage des verrous"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "فتح الخريطة التعليمية المتكيفة لجميع المواد" : "Accès à la feuille de route adaptative"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "تجربة معمل الأخطاء (Error Lab) وحل التمارين" : "Accès au laboratoire de remédiation"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "محاكي امتحان البكالوريا D-Day" : "Accès au simulateur D-Day"}</span>
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
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAr ? "ابدأ الـ 72 ساعة مجاناً الآن" : "Démarrer mes 72h gratuites"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Full Season Pass Card */}
          <div className="rounded-[32px] border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/5 via-card to-card p-6 sm:p-8 flex flex-col justify-between shadow-clay relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="warning" size="sm" className="font-bold text-xs px-3 py-1 bg-amber-500 text-white">
                  {isAr ? "اشتراك الموسم الكامل 2026/2027" : "Pass Saison Complète"}
                </Badge>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr ? "الأكثر طلباً" : "Recommandé"}</span>
                </div>
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "وصول غير محدود لجميع وحدات المنهاج حتى جوان 2027" : "Accès illimité à toutes les unités"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "ترميم غير محدود لجميع الأخطاء في معمل الأخطاء" : "Remédiation illimitée dans le Lab d'erreurs"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "جميع مواضيع محاكي D-Day بسلالم التنقيط الوزارية" : "Sujets de simulation D-Day corrigés"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "تفعيل فوري وآمن عبر بريدي موب (BaridiMob) أو CCP" : "Paiement sécurisé BaridiMob & CCP"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "مرافقة ودعم فني مخصص طيلة الموسم" : "Support technique et assistance continue"}</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <Link href="/subscribe" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-clay py-4 flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{isAr ? "الاشتراك في الموسم الكامل" : "S'abonner pour la saison"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
              <p className="text-[11px] text-center text-theme-muted">
                {isAr ? "تفعيل سريع في أقل من 15 دقيقة بعد إرسال الوصل" : "Activation rapide après validation du reçu"}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 7. FAQ ACCORDION
// ============================================================================

interface FAQItem {
  questionAr: string;
  questionFr: string;
  answerAr: string;
  answerFr: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    questionAr: "هل التجربة المجانية (72 ساعة) مجانية فعلاً ولا تتطلب أي بطاقة بنكية؟",
    questionFr: "L'essai gratuit de 72h est-il vraiment sans carte bancaire ?",
    answerAr: "نعم تماماً! بمجرد إدخال اسمك وشعبتك يبدأ حسابك في الاستفادة من 72 ساعة استكشافية مجانية كاملة الميزات دون الحاجة لأي بطاقة دفع أو أي التزام مسبق.",
    answerFr: "Absolument ! Dès votre inscription, vous profitez de 72 heures d'accès complet sans fournir aucune coordonnée bancaire.",
  },
  {
    questionAr: "هل المنصة تتوافق مع التعديلات الوزارية والمنهاج الجزائري الرسمي 2026/2027؟",
    questionFr: "La plateforme est-elle conforme au programme officiel algérien 2026/2027 ?",
    answerAr: "نعم 100%. تم بناء بنك المهارات والتمارين وسلالم التنقيط بدقة متناهية تحت إشراف أساتذة ومفتشين ذوي خبرة في تصحيح البكالوريا الرسمية، مع مراعاة أحدث التعديلات والمنهجية الجديدة المعتمدة في الأفعال الأدائية.",
    answerFr: "Oui, à 100%. Tout le contenu est strictement aligné avec les grilles officielles et le programme ministériel en vigueur.",
  },
  {
    questionAr: "ابني يعاني من تشتت وتأخر في بعض المواد، هل تنفعه الخريطة؟",
    questionFr: "Mon enfant a des lacunes accumulées, la plateforme peut-elle l'aider ?",
    answerAr: "هذا بالضبط الهدف الأساسي للمنصة! الخريطة تبدأ بفحص تشخيصي سريع يحدد مكامن الضعف ونقاط الاختناق بدقة، ليركز الطالب جهده على ما يضيع منه النقاط فعلاً بدلاً من تكرار ما يتقنه أو الغرق في التشتت.",
    answerFr: "C'est précisément sa vocation première : diagnostiquer les verrous cachés et combler les lacunes méthodologiques pas à pas.",
  },
  {
    questionAr: "ما هو معمل الأخطاء (Error Lab) وكيف يختلف عن الحل النموذجي؟",
    questionFr: "Qu'est-ce que le Laboratoire d'Erreurs et en quoi diffère-t-il d'un corrigé ?",
    answerAr: "الحل النموذجي يعطيك الإجابة الصحيحة فقط، أما معمل الأخطاء فيشرح لك «لماذا وقعت في الخطأ؟» هل هو خطأ في المنهجية؟ سوء قراءة للمعطيات؟ أو خطأ في الحساب؟ ثم يقدم لك تمريناً توأمياً مماثلاً لتثبت تمكنك نهائياً.",
    answerFr: "Au lieu d'afficher une simple réponse, le Lab analyse la cause de votre erreur et vous propose un exercice jumeau pour valider l'acquisition.",
  },
  {
    questionAr: "كيف يتم تسديد الاشتراك في حال رغبتنا في التمديد بعد الـ 72 ساعة؟",
    questionFr: "Comment s'effectue le paiement après les 72h gratuites ?",
    answerAr: "نوفر أسهل الطرق المعتمدة في الجزائر: تحويل فوري عبر تطبيق بريدي موب (BaridiMob) عبر رقم RIP، أو إيداع بريدي في مركز البريد (CCP). بعدها ترفع صورة الوصل ويتم تفعيل حسابك فوراً.",
    answerFr: "Via virement instantané BaridiMob (RIP) ou mandat CCP classique. Il suffit de téléverser le reçu pour une activation rapide.",
  },
  {
    questionAr: "هل يمكن استخدام المنصة عبر الهاتف والكمبيوتر في نفس الوقت؟",
    questionFr: "Peut-on utiliser la plateforme sur téléphone et ordinateur ?",
    answerAr: "نعم، المنصة متوافقة 100% مع جميع الهواتف الذكية (Android و iPhone) والأجهزة اللوحية وأجهزة الكمبيوتر، مع مزامنة فورية لمسار تقدمك أينما كنت.",
    answerFr: "Oui, la plateforme est parfaitement réactive et synchronisée sur smartphones, tablettes et ordinateurs.",
  },
];

export function LandingFAQ({ isAr }: { isAr: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-14 sm:py-20 border-b border-theme bg-canvas">
      <Container size="md" className="space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] font-mono">
            {isAr ? "إجابات واضحة" : "FOIRE AUX QUESTIONS"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "الأسئلة الشائعة من التلاميذ والأولياء" : "Questions Fréquentes"}
          </h2>
          <p className="text-sm text-theme-secondary">
            {isAr ? "كل ما تحتاج معرفته عن المنصة، التجربة المجانية، وطريقة العمل." : "Tout ce que vous devez savoir avant de commencer."}
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
// 8. FINAL EMOTIONAL CALL TO ACTION
// ============================================================================

export function FinalCTASection({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-surface to-canvas relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[350px] bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="md" className="relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isAr ? "بكالوريا 2026/2027 • فرصة العمر تبدأ بقرار اليوم" : "BAC 2026/2027 • Votre succès commence ici"}</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-theme-text font-sans leading-tight">
          {isAr ? (
            <>
              البكالوريا ماشي ضربة حظ.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
                البكالوريا خطة تبدأ اليوم وتنتهي بفرحة العمر.
              </span>
            </>
          ) : (
            <>
              Le BAC n'est pas une question de chance.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                C'est une méthode qui se construit dès aujourd'hui.
              </span>
            </>
          )}
        </h2>

        <p className="text-sm sm:text-base text-theme-secondary max-w-xl mx-auto leading-relaxed">
          {isAr
            ? "لا تترك نتيجتك ومستقبلك للمصادفة والتشتت. ابدأ تجربتك الاستكشافية المجانية الآن واكتشف خريطتك في 3 دقائق."
            : "Ne laissez pas votre avenir au hasard. Activez votre essai gratuit de 72h et découvrez votre plan d'action personnalisé."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto rounded-2xl font-bold shadow-clay px-10 py-6 min-h-[52px] flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{isAr ? "افتح حسابك واستفد من 3 أيام مجاناً" : "Commencer l'essai 72h gratuit"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>

          <Link href="/auth?mode=login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-2xl font-semibold px-8 py-6 min-h-[52px]"
            >
              <span>{isAr ? "تسجيل الدخول إلى حسابك" : "Se connecter"}</span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-theme-muted pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isAr ? "0 دج وبدون أي التزام مسبق" : "0 DZD sans engagement"}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{isAr ? "وصول فوري خلال 60 ثانية" : "Accès instantané en 60s"}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{isAr ? "متوافق مع أحدث المناهج الرسمية" : "Programme officiel garanti"}</span>
          </span>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 9. MASTER LANDING VIEW
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
    <AppShell showSidebar={false} noPadding={true}>
      {/* Smart Top Greeting Banner for Logged-In Students */}
      {user && (
        <div className="bg-gradient-to-r from-[var(--color-primary)] via-emerald-600 to-[var(--color-accent)] text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 shadow-sm relative z-20">
          <span>
            {isAr
              ? `مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية بانتظارك ومسار التقدم محفوظ.`
              : `Bienvenue à nouveau ${studentName ? studentName : ""} ! Votre feuille de route vous attend.`}
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
      {/* 1. HERO SECTION WITH AUTHENTIC EMOTIONAL HOOK                       */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-16 pb-14 sm:pb-24 border-b border-theme overflow-hidden bg-gradient-to-b from-canvas via-surface/40 to-surface">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-[var(--color-primary)]/15 via-[var(--color-accent)]/10 to-transparent pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Col: Headings, Value Prop & Emotional Promise */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              
              {/* Emotional Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                <span>{isAr ? "✨ بكالوريا 2026/2027 • لكل من يحلم بدموع الفرح في دارهم" : "✨ BAC 2026/2027 • Pour faire la fierté de vos proches"}</span>
              </div>

              {/* Grand Emotional Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text leading-[1.18] font-sans">
                {isAr ? (
                  <>
                    تخيّل لحظة إعلان نتائج البكالوريا.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-amber-500 to-[var(--color-accent)]">
                      الزغاريت، دموع والديك، وفرحة نيلك الامتياز.
                    </span>
                  </>
                ) : (
                  <>
                    Imaginez le jour des résultats du BAC.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                      Les larmes de joie, la fierté de vos parents et votre mention.
                    </span>
                  </>
                )}
              </h1>

              {/* Core Subtitle */}
              <p className="text-base sm:text-lg text-theme-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? "ماشي بكثرة السوايع العشوائية ولا تكديس التمارين بلا فهم. خريطة ذكية مخصصة لشعبتك، تكتشف أين تضيع منك النصف نقطة، تعالج أخطاءك في معمل الأخطاء، وترفع معدلك بثقة وهدوء."
                  : "Pas avec des heures de bachotage épuisant. Une feuille de route intelligente adaptée à votre filière qui cible chaque faille et sécurise votre mention sans stress."}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-bold shadow-clay px-8 py-6 rounded-2xl flex items-center justify-center gap-2.5 text-base"
                  >
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <span>{isAr ? "ابدأ تجربتك المجانية (72 ساعة) الآن" : "Démarrer l'essai 72h gratuit"}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-6 rounded-2xl font-semibold text-sm"
                  >
                    <span>{isAr ? "كيف تعمل المنهجية؟" : "Comment ça marche ?"}</span>
                  </Button>
                </Link>
              </div>

              {/* 72h Guarantee Pill */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary-soft)]/70 border border-[var(--color-primary)]/20 text-xs text-theme-secondary flex items-center gap-3 max-w-xl">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                <span className="leading-normal font-medium">
                  {isAr
                    ? "✨ 72 ساعة تجربة استكشافية مجانية كاملة الميزات (0 دج) دون الحاجة لبطاقة دفع — ابدأ الآن واكتشف خريطتك."
                    : "✨ 72 heures d'essai complet gratuit (0 DZD) sans carte bancaire — activez votre feuille de route dès aujourd'hui."}
                </span>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-theme-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{isAr ? "جميع شعب البكالوريا الجزائرية" : "Toutes les filières du BAC"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>{isAr ? "معمل الأخطاء الفوري" : "Laboratoire d'erreurs"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? "محاكي D-Day الرسمي" : "Simulateur officiel D-Day"}</span>
                </span>
              </div>
            </div>

            {/* Right Col: Joyful Celebration Card with Algerian BAC Student & Mother */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-[36px] overflow-hidden border-2 border-theme bg-card shadow-clay p-2 group max-w-md w-full">
                <div className="relative rounded-[30px] overflow-hidden aspect-[4/5] w-full">
                  <Image
                    src="/illustrations/bac-success-joy.jpg"
                    alt={isAr ? "فرحة النجاح والامتياز في البكالوريا مع الوالدين" : "Fierté et joie de la réussite au BAC"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold w-fit mb-2 backdrop-blur-md">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{isAr ? "معدل 17.80 — كلية الطب 🩺" : "Moyenne 17.80 — Faculté de Médecine"}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black leading-tight">
                      {isAr ? "لحظة تستحق كل ثانية من التخطيط والعمل الذكي" : "Un moment gravé à jamais dans la mémoire familiale"}
                    </h3>
                    <span className="text-xs text-amber-300 font-medium mt-1">
                      {isAr ? "«فرحة بابا وماما يوم الباك ما تتعوض بحتى حاجة»" : "« La fierté de mes parents n'a pas de prix »"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE TARGET SCORE SIMULATOR                                */}
      {/* =================================================================== */}
      <section id="simulator" className="py-14 sm:py-20 border-b border-theme bg-canvas">
        <Container size="lg">
          <TargetScoreSimulator isAr={isAr} />
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 3. BEFORE VS. AFTER COMPARISON GRID                                 */}
      {/* =================================================================== */}
      <MethodologyComparison isAr={isAr} />

      {/* =================================================================== */}
      {/* 4. PROPRIETARY 4 BALANCED PILLARS                                   */}
      {/* =================================================================== */}
      <div id="how-it-works">
        <FourPillarsSection isAr={isAr} />
      </div>

      {/* =================================================================== */}
      {/* 5. ROADMAP & ERROR LAB SHOWCASE                                     */}
      {/* =================================================================== */}
      <RoadmapShowcaseSection isAr={isAr} locale={locale === "fr" ? "fr" : "ar"} />

      {/* =================================================================== */}
      {/* 6. HEARTFELT LETTER TO PARENTS                                      */}
      {/* =================================================================== */}
      <div id="parents">
        <ParentsMessageSection isAr={isAr} />
      </div>

      {/* =================================================================== */}
      {/* 7. TRANSPARENT PRICING & PAYMENT                                    */}
      {/* =================================================================== */}
      <PricingSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 8. FAQ ACCORDION                                                    */}
      {/* =================================================================== */}
      <div id="faq">
        <LandingFAQ isAr={isAr} />
      </div>

      {/* =================================================================== */}
      {/* 9. FINAL EMOTIONAL CALL TO ACTION                                   */}
      {/* =================================================================== */}
      <FinalCTASection isAr={isAr} />

    </AppShell>
  );
}
