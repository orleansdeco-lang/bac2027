"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import {
  AvailableTimeRange,
  FutureObjectivePreset,
  ObstacleId,
  OnboardingDraft,
  OnboardingStep,
  SelfRatedLevel,
  StudyEnergyState,
} from "@/types/onboarding";
import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import {
  ALGERIAN_BAC_STREAMS,
  ALL_SUBJECTS,
  getStreamSubjects,
  TECHNIQUE_MATH_SPECIALTIES,
} from "@/lib/constants/streams";
import { validateOnboardingStep } from "@/lib/onboarding/validation";
import {
  buildStrategicProfile,
  getOnboardingDraft,
  saveOnboardingDraft,
  saveStrategicProfile,
} from "@/lib/onboarding/profile";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Check,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Target,
  Clock,
  Heart,
  ChevronRight,
} from "lucide-react";

const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "education_level",
  "stream",
  "target_score",
  "level_estimation",
  "available_time",
  "future_objective",
  "obstacles",
  "study_state",
  "summary",
];

const INITIAL_DRAFT: OnboardingDraft = {
  currentStep: "welcome",
  educationLevel: "secondary",
  examType: "BAC",
  streamId: undefined,
  techniqueMathSpecialty: undefined,
  targetScore: 16.0,
  subjectEstimates: {} as Record<SubjectId, SelfRatedLevel>,
  availableTime: "12_to_18",
  futureObjectivePreset: "higher_school_ens_esi",
  futureObjectiveCustom: "",
  obstacles: ["understand_but_fail_exercises"],
  studyEnergy: "normal",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const isRtl = direction === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;

  const { user } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_DRAFT);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Restore saved draft on mount
  useEffect(() => {
    trackEvent("onboarding_started");
    const saved = getOnboardingDraft(user?.id);
    if (saved) {
      setDraft(saved);
    }
    setIsClientLoaded(true);
  }, [user]);

  // Autosave draft on change
  const updateDraft = (updates: Partial<OnboardingDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      saveOnboardingDraft(next, user?.id);
      return next;
    });
    setErrorMessage(null);
  };

  const currentStepIndex = ONBOARDING_STEPS.indexOf(draft.currentStep);
  const progressPercentage = Math.round((currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100);

  const goToStep = (step: OnboardingStep) => {
    updateDraft({ currentStep: step });
  };

  const handleNext = () => {
    const validation = validateOnboardingStep(draft.currentStep, draft);
    if (!validation.isValid && validation.errorKey) {
      const parts = validation.errorKey.split(".");
      let errText = isAr ? "يرجى إكمال هذا الحقل للمتابعة." : "Veuillez compléter ce champ pour continuer.";
      if (parts[0] === "onboarding" && parts[1] === "errors") {
        const key = parts[2] as keyof typeof t.onboarding.errors;
        errText = t.onboarding.errors[key] || errText;
      }
      setErrorMessage(errText);
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      goToStep(ONBOARDING_STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(ONBOARDING_STEPS[prevIndex]);
    }
  };

  const handleFinish = async () => {
    try {
      const profile = buildStrategicProfile(draft, user?.id);
      saveStrategicProfile(profile, user?.id);
      trackEvent("onboarding_completed", {
        streamId: profile.streamId,
        targetScore: profile.targetScore,
      });
      if (user) {
        await StudentService.saveProfile(profile, user.id);
        router.push("/dashboard");
      } else {
        router.push("/auth?from=onboarding");
      }
    } catch (err) {
      setErrorMessage(isAr ? "يرجى التحقق من ملء جميع الحقول المطلوبة." : "Veuillez vérifier que tous les champs obligatoires sont remplis.");
    }
  };

  if (!isClientLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse text-sm text-[var(--color-primary)] font-medium">SHATER...</div>
      </div>
    );
  }

  // Current stream subjects for level estimation
  const currentStreamSubjects = draft.streamId
    ? getStreamSubjects(draft.streamId, draft.techniqueMathSpecialty)
    : [];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-canvas text-theme-text selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)] transition-colors duration-200">
      {/* 1. Onboarding Top Bar */}
      <header className="sticky top-0 z-30 border-b border-theme bg-surface/95 backdrop-blur-md">
        <Container size="md" className="flex h-14 items-center justify-between">
          <Logo size="sm" showTagline={false} />

          <div className="flex items-center gap-2">
            {draft.currentStep !== "welcome" && (
              <span className="text-[11px] font-mono text-theme-muted me-1">
                {currentStepIndex}/{ONBOARDING_STEPS.length - 1}
              </span>
            )}
            <ThemeSelector variant="compact" />
            <LanguageSwitcher />
          </div>
        </Container>

        {/* Subtle Top Progress Bar */}
        {draft.currentStep !== "welcome" && (
          <div className="w-full h-0.5 bg-card-muted overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </header>

      {/* 2. Step Content Viewport */}
      <div className="flex-1 flex items-center py-6 sm:py-10">
        <Container size="sm" className="w-full max-w-lg">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {draft.currentStep === "welcome" && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>{isAr ? "الاستبيان الاستراتيجي المخصص" : "Questionnaire Stratégique"}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-snug font-sans">
                {isAr ? "ماشي واش تقرا. كيفاش توصل." : "Pas seulement quoi étudier. Comment réussir."}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-md mx-auto">
                {isAr
                  ? "في دقيقتين فقط، نحددو هدفك في البكالوريا، وضعك الحالي، وأهم نقطة اختناق باش نبنيو خريطتك المخصصة."
                  : "En 2 minutes, définissons votre cible, votre situation actuelle et vos priorités pour tracer votre route."}
              </p>

              <div className="pt-4">
                <Button variant="primary" size="lg" fullWidth onClick={handleNext} className="font-bold shadow-lg shadow-blue-600/25">
                  <span>{isAr ? "ابدأ الاستبيان الآن" : "Commencer le questionnaire"}</span>
                  <NextArrow className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION LEVEL */}
          {draft.currentStep === "education_level" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "وين حاب توصل؟" : t.onboarding.educationLevel.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "حدد المستوى الدراسي لضبط مسار التعلم والمناهج." : t.onboarding.educationLevel.subtitle}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateDraft({ educationLevel: "secondary", examType: "BAC" })}
                  className="w-full p-4 rounded-2xl border-2 border-blue-500 bg-[#162238] text-start flex items-center justify-between transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-100 text-sm sm:text-base">
                      {t.onboarding.educationLevel.bacOption}
                    </div>
                    <div className="text-xs text-blue-400 font-medium">
                      {isAr ? "التعليم الثانوي — السنة الثالثة ثانوي (3AS)" : "Enseignement secondaire (3AS)"}
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </button>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-[#111827]/80 text-slate-400 text-xs flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>{t.onboarding.educationLevel.bemNotice}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STREAM & SPECIALTY */}
          {draft.currentStep === "stream" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "واش هي شعبتك في البكالوريا؟" : t.onboarding.stream.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "لكل شعبة معاملات ومواد محددة تبنى عليها الخطة." : t.onboarding.stream.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {(
                  [
                    "sciences_exp",
                    "math",
                    "technique_math",
                    "gestion_eco",
                    "lettres_philo",
                    "langues_etrangeres",
                  ] as StreamId[]
                ).map((streamId) => {
                  const isSelected = draft.streamId === streamId;
                  return (
                    <button
                      key={streamId}
                      type="button"
                      onClick={() => updateDraft({ streamId })}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700 hover:bg-[#162032]"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-200">
                        {t.streams.items[streamId]}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Sub-step: Technique Math Specialty */}
              {draft.streamId === "technique_math" && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-200">
                      {t.onboarding.stream.specialtyQuestion}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t.onboarding.stream.specialtySubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "civil_eng",
                        "mechanical_eng",
                        "electrical_eng",
                        "process_eng",
                      ] as TechniqueMathSpecialty[]
                    ).map((specId) => {
                      const isSpecSelected = draft.techniqueMathSpecialty === specId;
                      return (
                        <button
                          key={specId}
                          type="button"
                          onClick={() => updateDraft({ techniqueMathSpecialty: specId })}
                          className={`p-3 rounded-xl border text-xs font-semibold text-start transition-all cursor-pointer min-h-[44px] ${
                            isSpecSelected
                              ? "border-blue-500 bg-[#162238] text-blue-300 font-bold ring-1 ring-blue-500"
                              : "border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          {t.onboarding.stream.specialties[specId]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: TARGET SCORE */}
          {draft.currentStep === "target_score" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "شحال حاب تجيب في الباك؟" : t.onboarding.targetScore.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "حدد معدلك المستهدف بدقة دون تردد. الهدف يبدأ بنية واضحة." : t.onboarding.targetScore.subtitle}
                </p>
              </div>

              {/* Target score presets */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { range: "r10_11", val: 10.5, label: t.onboarding.targetScore.ranges.r10_11 },
                  { range: "r12_13", val: 12.5, label: t.onboarding.targetScore.ranges.r12_13 },
                  { range: "r14_15", val: 14.5, label: t.onboarding.targetScore.ranges.r14_15 },
                  { range: "r16_17", val: 16.5, label: t.onboarding.targetScore.ranges.r16_17 },
                  { range: "r18_20", val: 18.5, label: t.onboarding.targetScore.ranges.r18_20 },
                ].map((item) => {
                  const isSelected =
                    draft.targetScore !== undefined &&
                    Math.abs(draft.targetScore - item.val) < 1.0;
                  return (
                    <button
                      key={item.range}
                      type="button"
                      onClick={() => updateDraft({ targetScore: item.val })}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {item.label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Exact score input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.onboarding.targetScore.exactLabel}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.25"
                    min="10.0"
                    max="20.0"
                    value={draft.targetScore || 16.0}
                    onChange={(e) => updateDraft({ targetScore: parseFloat(e.target.value) || 10 })}
                    className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#111827] text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-400">/ 20.00</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                <span>{t.onboarding.targetScore.encouragement}</span>
              </div>
            </div>
          )}

          {/* STEP 5: LEVEL ESTIMATION */}
          {draft.currentStep === "level_estimation" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "وين تشوف روحك اليوم؟" : t.onboarding.levelEstimation.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "تقييم أولي ذاتي للمواد الأساسية للمساعدة في توجيه نقطة الانطلاق." : t.onboarding.levelEstimation.subtitle}
                </p>
              </div>

              {/* Disclaimer: Not a real diagnostic */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t.onboarding.levelEstimation.disclaimer}</span>
              </div>

              {/* Subjects rating list */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pe-1">
                {currentStreamSubjects.map((rule) => {
                  const subjectMeta = ALL_SUBJECTS[rule.subjectId];
                  const currentRating = draft.subjectEstimates[rule.subjectId] || 3;

                  return (
                    <div
                      key={rule.subjectId}
                      className="p-3.5 rounded-xl border border-slate-800 bg-[#111827] space-y-2.5 shadow-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-200">
                            {subjectMeta ? (isAr ? subjectMeta.name_ar : subjectMeta.name_fr) : rule.subjectId}
                          </span>
                          {rule.isCoreSubject && (
                            <Badge variant="primary" size="sm">
                              {t.onboarding.levelEstimation.coreBadge}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {isAr ? `المعامل ${rule.coefficient}` : `Coef ${rule.coefficient}`}
                        </span>
                      </div>

                      {/* 1 to 5 scale selector */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {([1, 2, 3, 4, 5] as SelfRatedLevel[]).map((level) => {
                          const isLevelSelected = currentRating === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                const newEstimates = { ...draft.subjectEstimates, [rule.subjectId]: level };
                                updateDraft({ subjectEstimates: newEstimates });
                              }}
                              className={`py-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer min-h-[40px] ${
                                isLevelSelected
                                  ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 font-bold"
                                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                        <span>{t.onboarding.levelEstimation.scale.l1}</span>
                        <span>{t.onboarding.levelEstimation.scale.l5}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: AVAILABLE TIME */}
          {draft.currentStep === "available_time" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "قداش تقدر تقرا بواقعية؟" : t.onboarding.availableTime.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "عدد ساعات الدراسة الفردية الأسبوعية خارج أوقات الثانوية." : t.onboarding.availableTime.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    "less_than_5",
                    "5_to_8",
                    "8_to_12",
                    "12_to_18",
                    "18_to_25",
                    "25_plus",
                    "not_sure",
                  ] as AvailableTimeRange[]
                ).map((rangeKey) => {
                  const isSelected = draft.availableTime === rangeKey;
                  const dictKey = rangeKey === "5_to_8" ? "h5_to_8" : rangeKey === "8_to_12" ? "h8_to_12" : rangeKey === "12_to_18" ? "h12_to_18" : rangeKey === "18_to_25" ? "h18_to_25" : rangeKey;
                  const label = t.onboarding.availableTime.options[dictKey as keyof typeof t.onboarding.availableTime.options];

                  return (
                    <button
                      key={rangeKey}
                      type="button"
                      onClick={() => updateDraft({ availableTime: rangeKey })}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: FUTURE OBJECTIVE */}
          {draft.currentStep === "future_objective" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "وش حاب تدير بعد الباك؟" : t.onboarding.futureObjective.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "ربط دراستك بطموحك الجامعي يعطيك دافعاً حقيقياً." : t.onboarding.futureObjective.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    "specific_university_field",
                    "higher_school_ens_esi",
                    "specific_profession",
                    "open_more_doors",
                    "prove_to_myself",
                    "not_decided_yet",
                  ] as FutureObjectivePreset[]
                ).map((preset) => {
                  const isSelected = draft.futureObjectivePreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateDraft({ futureObjectivePreset: preset })}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {t.onboarding.futureObjective.options[preset]}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Free text input */}
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={draft.futureObjectiveCustom || ""}
                  onChange={(e) => updateDraft({ futureObjectiveCustom: e.target.value })}
                  placeholder={t.onboarding.futureObjective.customPlaceholder}
                  className="w-full p-3.5 rounded-xl border border-slate-700 bg-[#111827] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 8: BIGGEST OBSTACLES (MULTI-SELECT) */}
          {draft.currentStep === "obstacles" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "واش أكثر حاجة توقفك؟" : t.onboarding.obstacles.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "اختر العوائق اللي تحسها تعيق تقدمك عشان نعالجوها خطوة بخطوة." : t.onboarding.obstacles.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pe-1">
                {(
                  [
                    "dont_know_where_to_start",
                    "start_and_stop",
                    "time_management",
                    "understand_but_fail_exercises",
                    "memorize_and_forget",
                    "waste_time",
                    "fear_of_bac",
                    "big_backlog",
                    "lack_of_confidence",
                    "other",
                  ] as ObstacleId[]
                ).map((obsId) => {
                  const isChecked = draft.obstacles.includes(obsId);
                  return (
                    <button
                      key={obsId}
                      type="button"
                      onClick={() => {
                        const newObstacles = isChecked
                          ? draft.obstacles.filter((o) => o !== obsId)
                          : [...draft.obstacles, obsId];
                        updateDraft({ obstacles: newObstacles });
                      }}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isChecked
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {t.onboarding.obstacles.options[obsId]}
                      </span>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 9: STUDY STATE / ENERGY */}
          {draft.currentStep === "study_state" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "كيف راه طاقتك هاذ الأيام؟" : t.onboarding.studyState.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "الراحة والوضوح النفسي جزء من النجاح، الخطة تتكيف مع طاقتك." : t.onboarding.studyState.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {(["good", "normal", "tired", "stressed"] as StudyEnergyState[]).map((stateKey) => {
                  const isSelected = draft.studyEnergy === stateKey;
                  return (
                    <button
                      key={stateKey}
                      type="button"
                      onClick={() => updateDraft({ studyEnergy: stateKey })}
                      className={`p-3.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? "border-blue-500 bg-[#162238] ring-1 ring-blue-500"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {t.onboarding.studyState.options[stateKey]}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 10: SUMMARY */}
          {draft.currentStep === "summary" && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                  {isAr ? "ملخص ملفك الاستراتيجي" : t.onboarding.summary.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isAr ? "راجع خياراتك قبل بناء خريطتك الدراسية المخصصة." : t.onboarding.summary.subtitle}
                </p>
              </div>

              <Card className="space-y-3 p-4 bg-[#111827] border-slate-800 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{t.onboarding.summary.streamLabel}</span>
                  <span className="font-bold text-slate-100">
                    {draft.streamId ? t.streams.items[draft.streamId] : "-"}
                  </span>
                </div>

                {draft.streamId === "technique_math" && draft.techniqueMathSpecialty && (
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">{t.onboarding.summary.specialtyLabel}</span>
                    <span className="font-bold text-blue-400">
                      {t.onboarding.stream.specialties[draft.techniqueMathSpecialty]}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{t.onboarding.summary.targetLabel}</span>
                  <span className="font-bold text-amber-300 text-sm font-mono">
                    {draft.targetScore?.toFixed(2)} / 20.00
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{t.onboarding.summary.timeLabel}</span>
                  <span className="font-semibold text-slate-200">
                    {draft.availableTime
                      ? t.onboarding.availableTime.options[
                          (draft.availableTime === "5_to_8"
                            ? "h5_to_8"
                            : draft.availableTime === "8_to_12"
                            ? "h8_to_12"
                            : draft.availableTime === "12_to_18"
                            ? "h12_to_18"
                            : draft.availableTime === "18_to_25"
                            ? "h18_to_25"
                            : draft.availableTime) as keyof typeof t.onboarding.availableTime.options
                        ]
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{t.onboarding.summary.futureLabel}</span>
                  <span className="font-semibold text-slate-200 text-end max-w-[200px] truncate">
                    {draft.futureObjectiveCustom ||
                      (draft.futureObjectivePreset
                        ? t.onboarding.futureObjective.options[draft.futureObjectivePreset]
                        : "-")}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{t.onboarding.summary.obstaclesLabel}</span>
                  <span className="font-semibold text-slate-200">
                    {draft.obstacles.length} {isAr ? "عوائق محددة" : "obstacles"}
                  </span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">{t.onboarding.summary.energyLabel}</span>
                  <span className="font-semibold text-slate-200">
                    {draft.studyEnergy ? t.onboarding.studyState.options[draft.studyEnergy] : "-"}
                  </span>
                </div>
              </Card>

              <div className="space-y-2.5 pt-2">
                <Button variant="primary" size="lg" fullWidth onClick={handleFinish} className="font-bold shadow-lg shadow-blue-600/30">
                  <span>{t.onboarding.summary.buildButton}</span>
                  <NextArrow className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => goToStep("stream")}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <span>{t.onboarding.summary.editButton}</span>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* 3. Bottom Step Navigation */}
      {draft.currentStep !== "welcome" && draft.currentStep !== "summary" && (
        <footer className="sticky bottom-0 z-30 border-t border-theme bg-surface/95 backdrop-blur-md py-3.5 transition-colors duration-200">
          <Container size="sm" className="flex items-center justify-between gap-3 max-w-lg">
            <Button variant="outline" size="md" onClick={handleBack}>
              <BackArrow className="h-4 w-4" />
              <span>{t.onboarding.nav.back}</span>
            </Button>

            <Button variant="primary" size="md" onClick={handleNext} className="font-bold">
              <span>{t.onboarding.nav.next}</span>
              <NextArrow className="h-4 w-4" />
            </Button>
          </Container>
        </footer>
      )}
    </main>
  );
}
