"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import {
  AcademicProfileData,
  StudyMethodType,
  CurrentSelfAssessmentType,
} from "@/types/registration";
import { StudentService } from "@/lib/services";
import {
  getAcademicProfileDraft,
  saveAcademicProfileDraft,
} from "@/lib/onboarding/profile";
import {
  Target,
  GraduationCap,
  Compass,
  BookOpen,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sliders,
  HelpCircle,
} from "lucide-react";

export default function AcademicProfilePage() {
  const router = useRouter();
  const { direction, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading } = useAuth();

  // Enforce auth & registration prerequisite
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth?mode=signup");
      return;
    }
    if (!isLoading && user) {
      StudentService.getProfile(user.id).then((p) => {
        if (!p || (!p.registrationCompletedAt && !(p.firstName && p.streamId))) {
          router.replace("/auth/register");
        }
      });
    }
  }, [user, isLoading, router]);

  // Form State
  const [targetScore, setTargetScore] = useState<number>(16.0);

  const [avg1, setAvg1] = useState<string>("");
  const [dontRemember1, setDontRemember1] = useState<boolean>(false);

  const [avg2, setAvg2] = useState<string>("");
  const [dontRemember2, setDontRemember2] = useState<boolean>(false);

  const [hasTargetSpecialty, setHasTargetSpecialty] = useState<"yes" | "no" | "undecided">("undecided");
  const [targetSpecialty, setTargetSpecialty] = useState<string>("");

  const [selectedMethods, setSelectedMethods] = useState<StudyMethodType[]>(["alone", "videos_youtube"]);
  const [currentSituation, setCurrentSituation] = useState<CurrentSelfAssessmentType>("average");

  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore draft on mount
  useEffect(() => {
    const draft = getAcademicProfileDraft();
    if (draft) {
      if (draft.targetScore) setTargetScore(draft.targetScore);
      if (draft.annualAverageYear1 !== undefined && draft.annualAverageYear1 !== null) {
        setAvg1(String(draft.annualAverageYear1));
        setDontRemember1(false);
      } else if (draft.annualAverageYear1Remembered === false) {
        setDontRemember1(true);
      }
      if (draft.annualAverageYear2 !== undefined && draft.annualAverageYear2 !== null) {
        setAvg2(String(draft.annualAverageYear2));
        setDontRemember2(false);
      } else if (draft.annualAverageYear2Remembered === false) {
        setDontRemember2(true);
      }
      if (draft.hasTargetSpecialty === true) {
        setHasTargetSpecialty("yes");
        setTargetSpecialty(draft.targetSpecialty || "");
      } else if (draft.hasTargetSpecialty === false) {
        setHasTargetSpecialty("no");
      } else {
        setHasTargetSpecialty("undecided");
      }
      if (Array.isArray(draft.studyMethods) && draft.studyMethods.length > 0) {
        setSelectedMethods(draft.studyMethods);
      }
      if (draft.currentSelfAssessment) {
        setCurrentSituation(draft.currentSelfAssessment);
      }
    }
  }, []);

  // Toggle study method
  const toggleMethod = (method: StudyMethodType) => {
    if (selectedMethods.includes(method)) {
      if (selectedMethods.length > 1) {
        setSelectedMethods(selectedMethods.filter((m) => m !== method));
      }
    } else {
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  // Validate and show confirmation
  const handleProceedToSummary = () => {
    setErrorMsg(null);

    // Validate averages if entered
    if (!dontRemember1 && avg1.trim() !== "") {
      const val = parseFloat(avg1);
      if (isNaN(val) || val < 0 || val > 20) {
        setErrorMsg(isAr ? "معدل السنة 1 ثانوي يجب أن يكون بين 0 و 20." : "La moyenne de 1AS doit être entre 0 et 20.");
        return;
      }
    }

    if (!dontRemember2 && avg2.trim() !== "") {
      const val = parseFloat(avg2);
      if (isNaN(val) || val < 0 || val > 20) {
        setErrorMsg(isAr ? "معدل السنة 2 ثانوي يجب أن يكون بين 0 و 20." : "La moyenne de 2AS doit être entre 0 et 20.");
        return;
      }
    }

    if (hasTargetSpecialty === "yes" && !targetSpecialty.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة التخصص الذي ترغب في الوصول إليه." : "Veuillez préciser la spécialité visée.");
      return;
    }

    // Auto-save draft
    const academicDraft: AcademicProfileData = {
      targetScore,
      annualAverageYear1: dontRemember1 || !avg1 ? null : parseFloat(avg1),
      annualAverageYear1Remembered: !dontRemember1,
      annualAverageYear2: dontRemember2 || !avg2 ? null : parseFloat(avg2),
      annualAverageYear2Remembered: !dontRemember2,
      hasTargetSpecialty: hasTargetSpecialty === "yes" ? true : hasTargetSpecialty === "no" ? false : null,
      targetSpecialty: hasTargetSpecialty === "yes" ? targetSpecialty.trim() : null,
      studyMethods: selectedMethods,
      currentSelfAssessment: currentSituation,
      academicProfileCompletedAt: new Date().toISOString(),
    };
    saveAcademicProfileDraft(academicDraft);

    setShowSummary(true);
  };

  // Final confirmation: save & transition to Diagnostic
  const handleStartDiagnostic = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const academicData: AcademicProfileData = {
        targetScore,
        annualAverageYear1: dontRemember1 || !avg1 ? null : parseFloat(avg1),
        annualAverageYear1Remembered: !dontRemember1,
        annualAverageYear2: dontRemember2 || !avg2 ? null : parseFloat(avg2),
        annualAverageYear2Remembered: !dontRemember2,
        hasTargetSpecialty: hasTargetSpecialty === "yes" ? true : hasTargetSpecialty === "no" ? false : null,
        targetSpecialty: hasTargetSpecialty === "yes" ? targetSpecialty.trim() : null,
        studyMethods: selectedMethods,
        currentSelfAssessment: currentSituation,
        academicProfileCompletedAt: new Date().toISOString(),
      };

      await StudentService.saveAcademicProfile(academicData, user?.id);

      // Start existing diagnostic flow
      router.push("/diagnostic");
    } catch (err) {
      console.error("Failed to save academic profile:", err);
      setErrorMsg(isAr ? "حدث خطأ أثناء حفظ الملف. يرجى المحاولة." : "Erreur lors de l'enregistrement.");
      setSubmitting(false);
    }
  };

  const getSituationLabel = (key: CurrentSelfAssessmentType) => {
    switch (key) {
      case "good":
        return isAr ? "🟢 مليح (واثق من روحي)" : "🟢 Bon";
      case "average":
        return isAr ? "🟡 متوسط (كاين نقائص)" : "🟡 Moyen";
      case "weak":
        return isAr ? "🔴 ضعيف (عندي تأخر)" : "🔴 Faible";
      case "lost":
        return isAr ? "😕 ضايع ومحتاج توجيه" : "😕 Perdu";
    }
  };

  const getMethodsDisplay = () => {
    const labels: Record<StudyMethodType, string> = {
      alone: isAr ? "وحدي" : "Seul",
      with_teacher: isAr ? "مع أستاذ" : "Avec enseignant",
      private_lessons: isAr ? "دروس خصوصية" : "Cours particuliers",
      with_friends: isAr ? "مع صحابي" : "Avec amis",
      videos_youtube: isAr ? "فيديوهات / YouTube" : "Vidéos YouTube",
      mixed: isAr ? "خليط من طرق" : "Mixte",
    };
    return selectedMethods.map((m) => labels[m]).join(" + ");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-theme-base flex flex-col justify-between" dir={direction}>
      {/* Header */}
      <header className="border-b border-theme-border/60 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <Container size="md" className="py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>
          <Badge variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-500/30">
            {isAr ? "الملف الأكاديمي" : "Profil Académique"}
          </Badge>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-12">
        <Container size="sm">
          {!showSummary ? (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-2xl rounded-2xl animate-fadeIn">
              {/* Heading */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-electric/15 text-electric flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "باش نفهمو وين راك" : "Faisons le point ensemble"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "جاوب بصراحة. ماكان حتى جواب غلط."
                    : "Répondez en toute sincérité. Il n'y a pas de mauvaise réponse."}
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-8">
                {/* ========================================================= */}
                {/* A. TARGET SCORE                                           */}
                {/* ========================================================= */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-theme-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-electric" />
                      <span>{isAr ? "وش هو الهدف تاعك في الباك؟" : "Quel est votre objectif au Bac ?"}</span>
                    </label>
                    <span className="text-xl font-extrabold text-electric font-mono">
                      {targetScore.toFixed(0)} / 20
                    </span>
                  </div>

                  {/* Score Slider */}
                  <div className="px-2">
                    <input
                      type="range"
                      min={10}
                      max={20}
                      step={1}
                      value={targetScore}
                      onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                      className="w-full h-2.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-electric"
                    />
                    <div className="flex justify-between text-[11px] text-theme-muted font-mono mt-1.5">
                      <span>10</span>
                      <span>12</span>
                      <span>14</span>
                      <span>16</span>
                      <span>18</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* Distinction Tag */}
                  <div className="mt-3 text-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-canvas border border-theme-border font-medium text-theme-muted">
                      {targetScore >= 18
                        ? isAr ? "✨ ممتاز (Mention Très Bien avec Félicitations)" : "Excellent"
                        : targetScore >= 16
                        ? isAr ? "🎖️ جيد جداً (Mention Très Bien)" : "Très Bien"
                        : targetScore >= 14
                        ? isAr ? "🎯 جيد (Mention Bien)" : "Bien"
                        : targetScore >= 12
                        ? isAr ? "👍 قريب من الجيد (Mention Assez Bien)" : "Assez Bien"
                        : isAr ? "🎓 مقبول (Passable)" : "Passable"}
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* B. PREVIOUS SCHOOL PERFORMANCE                            */}
                {/* ========================================================= */}
                <div className="pt-4 border-t border-theme-border/60">
                  <h3 className="text-sm font-bold text-theme-base mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? "معدلاتك السنوية السابقة (اختياري)" : "Vos moyennes précédentes (optionnel)"}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1AS */}
                    <div className="p-4 rounded-xl bg-canvas/60 border border-theme-border/70">
                      <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                        {isAr ? "معدلك السنوي في 1 ثانوي" : "Moyenne 1AS"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        disabled={dontRemember1}
                        value={avg1}
                        onChange={(e) => setAvg1(e.target.value)}
                        placeholder="0.00 – 20.00"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-theme-border focus:border-electric outline-none text-sm font-mono disabled:opacity-40"
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dontRemember1}
                          onChange={(e) => {
                            setDontRemember1(e.target.checked);
                            if (e.target.checked) setAvg1("");
                          }}
                          className="rounded border-theme-border text-electric focus:ring-0"
                        />
                        <span className="text-xs text-theme-muted">{isAr ? "ما نتفكرش" : "Je ne m'en rappelle pas"}</span>
                      </label>
                    </div>

                    {/* 2AS */}
                    <div className="p-4 rounded-xl bg-canvas/60 border border-theme-border/70">
                      <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                        {isAr ? "معدلك السنوي في 2 ثانوي" : "Moyenne 2AS"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        disabled={dontRemember2}
                        value={avg2}
                        onChange={(e) => setAvg2(e.target.value)}
                        placeholder="0.00 – 20.00"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-theme-border focus:border-electric outline-none text-sm font-mono disabled:opacity-40"
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dontRemember2}
                          onChange={(e) => {
                            setDontRemember2(e.target.checked);
                            if (e.target.checked) setAvg2("");
                          }}
                          className="rounded border-theme-border text-electric focus:ring-0"
                        />
                        <span className="text-xs text-theme-muted">{isAr ? "ما نتفكرش" : "Je ne m'en rappelle pas"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* C. FUTURE GOAL                                            */}
                {/* ========================================================= */}
                <div className="pt-4 border-t border-theme-border/60">
                  <h3 className="text-sm font-bold text-theme-base mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? "عندك تخصص معين حاب توصل له؟" : "Avez-vous une spécialité visée ?"}</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setHasTargetSpecialty("yes")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                        hasTargetSpecialty === "yes"
                          ? "bg-electric/20 border-electric text-electric ring-1 ring-electric"
                          : "bg-canvas border-theme-border text-theme-muted hover:bg-canvas/80"
                      }`}
                    >
                      {isAr ? "نعم" : "Oui"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasTargetSpecialty("no");
                        setTargetSpecialty("");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                        hasTargetSpecialty === "no"
                          ? "bg-electric/20 border-electric text-electric ring-1 ring-electric"
                          : "bg-canvas border-theme-border text-theme-muted hover:bg-canvas/80"
                      }`}
                    >
                      {isAr ? "لا" : "Non"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasTargetSpecialty("undecided");
                        setTargetSpecialty("");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                        hasTargetSpecialty === "undecided"
                          ? "bg-electric/20 border-electric text-electric ring-1 ring-electric"
                          : "bg-canvas border-theme-border text-theme-muted hover:bg-canvas/80"
                      }`}
                    >
                      {isAr ? "مازال ما قررتش" : "Pas encore"}
                    </button>
                  </div>

                  {hasTargetSpecialty === "yes" && (
                    <div className="mt-3 p-3.5 rounded-xl bg-canvas border border-electric/40 animate-fadeIn">
                      <label className="block text-xs font-semibold text-cyan-400 mb-1.5">
                        {isAr ? "وش هو التخصص؟ *" : "Précisez la spécialité visée *"}
                      </label>
                      <input
                        type="text"
                        value={targetSpecialty}
                        onChange={(e) => setTargetSpecialty(e.target.value)}
                        placeholder={isAr ? "مثال: طب، إعلام آلي، صيدلة، هندسة معمارية..." : "Ex: Médecine, Informatique..."}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-theme-border focus:border-electric outline-none text-sm font-medium"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* D. STUDY METHOD                                           */}
                {/* ========================================================= */}
                <div className="pt-4 border-t border-theme-border/60">
                  <h3 className="text-sm font-bold text-theme-base mb-1.5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? "كيفاش تقرا غالباً؟" : "Comment étudiez-vous habituellement ?"}</span>
                  </h3>
                  <p className="text-xs text-theme-muted mb-3">
                    {isAr ? "تقدر تختار أكثر من خيار واحد." : "Vous pouvez choisir plusieurs options."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "alone", label_ar: "وحدي", label_fr: "Seul", icon: "👤" },
                      { id: "with_teacher", label_ar: "مع أستاذ", label_fr: "Avec enseignant", icon: "👨‍🏫" },
                      { id: "private_lessons", label_ar: "دروس خصوصية", label_fr: "Cours particuliers", icon: "📚" },
                      { id: "with_friends", label_ar: "مع صحابي", label_fr: "Avec amis", icon: "👥" },
                      { id: "videos_youtube", label_ar: "فيديوهات / YouTube", label_fr: "YouTube / Vidéos", icon: "💻" },
                      { id: "mixed", label_ar: "خليط من عدة طرق", label_fr: "Mixte", icon: "🔄" },
                    ].map((item) => {
                      const isSelected = selectedMethods.includes(item.id as StudyMethodType);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleMethod(item.id as StudyMethodType)}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                            isSelected
                              ? "bg-electric/15 border-electric text-electric shadow-sm"
                              : "bg-canvas border-theme-border text-theme-muted hover:border-theme-border/80"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{item.icon}</span>
                            <span>{isAr ? item.label_ar : item.label_fr}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* E. CURRENT SITUATION (PERCEPTION SIGNAL)                 */}
                {/* ========================================================= */}
                <div className="pt-4 border-t border-theme-border/60">
                  <h3 className="text-sm font-bold text-theme-base mb-1.5 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "كيفاش تشوف وضعك الحالي؟" : "Comment percevez-vous votre niveau actuel ?"}</span>
                  </h3>
                  <p className="text-xs text-theme-muted mb-3">
                    {isAr
                      ? "هذا مجرد انطباع أولي، التشخيص الحقيقي رايح يديره المحرك بعد قليل."
                      : "Simple signal de perception initiale avant le diagnostic."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "good", label_ar: "🟢 مليح", desc_ar: "واثق من روحي وقاعد نراجع بانتظام", desc_fr: "Confiant et régulier" },
                      { id: "average", label_ar: "🟡 متوسط", desc_ar: "كاين نقائص حاب نسقمها", desc_fr: "Moyen, avec quelques lacunes" },
                      { id: "weak", label_ar: "🔴 ضعيف", desc_ar: "عندي تأخر وتراكم كبير في الدروس", desc_fr: "En retard sur le programme" },
                      { id: "lost", label_ar: "😕 ضايع ومحتاج توجيه", desc_ar: "ما نعرفش من وين نبدا ومحتاج خطة", desc_fr: "Perdu, besoin d'un plan clair" },
                    ].map((sit) => {
                      const isSitSelected = currentSituation === sit.id;
                      return (
                        <button
                          key={sit.id}
                          type="button"
                          onClick={() => setCurrentSituation(sit.id as CurrentSelfAssessmentType)}
                          className={`p-3.5 rounded-xl border text-right rtl:text-right ltr:text-left transition ${
                            isSitSelected
                              ? "bg-electric/15 border-electric text-theme-base ring-1 ring-electric shadow-sm"
                              : "bg-canvas border-theme-border text-theme-muted hover:bg-canvas/80"
                          }`}
                        >
                          <p className="font-bold text-xs text-theme-base mb-0.5">{sit.label_ar}</p>
                          <p className="text-[11px] text-theme-muted">{sit.desc_ar}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <Button
                  onClick={handleProceedToSummary}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-base font-bold shadow-xl shadow-electric/25 bg-electric hover:bg-electric-hover text-white"
                >
                  <span>{isAr ? "متابعة" : "Continuer"}</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          ) : (
            /* ============================================================= */
            /* FINAL CONFIRMATION & DIAGNOSTIC HANDOFF                       */
            /* ============================================================= */
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-2xl rounded-2xl animate-fadeIn text-center">
              <div className="w-16 h-16 rounded-3xl bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                {isAr ? "مليح. فهمنا عليك." : "Parfait, nous avons bien cerné votre profil."}
              </h1>
              <p className="text-theme-muted text-sm max-w-md mx-auto mb-6">
                {isAr
                  ? "ملفك الأكاديمي جاهز. الخطوة القادمة هي اكتشاف نقاط قوتك ونقاط التحسين بدقة."
                  : "Votre profil académique est prêt. Passons au diagnostic ciblé."}
              </p>

              {/* Summary Pill Details */}
              <div className="rounded-xl bg-canvas/80 border border-theme-border p-4 text-xs space-y-2.5 mb-8 text-right rtl:text-right ltr:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "الهدف في الباك:" : "Objectif:"}</span>
                  <span className="font-bold text-electric font-mono">{targetScore} / 20</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "1 ثانوي:" : "1AS:"}</span>
                  <span className="font-mono text-theme-base">
                    {dontRemember1 || !avg1 ? (isAr ? "غير محدد" : "Non spécifié") : `${avg1} / 20`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "2 ثانوي:" : "2AS:"}</span>
                  <span className="font-mono text-theme-base">
                    {dontRemember2 || !avg2 ? (isAr ? "غير محدد" : "Non spécifié") : `${avg2} / 20`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "التخصص المستهدف:" : "Spécialité:"}</span>
                  <span className="font-bold text-cyan-400">
                    {hasTargetSpecialty === "yes" && targetSpecialty
                      ? targetSpecialty
                      : isAr ? "غير محدد بعد" : "Non déterminé"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "طريقة الدراسة:" : "Méthode:"}</span>
                  <span className="text-theme-base">{getMethodsDisplay()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-theme-muted">{isAr ? "الوضع الحالي:" : "Situation:"}</span>
                  <span>{getSituationLabel(currentSituation)}</span>
                </div>
              </div>

              {/* CTA Handoff to Diagnostic */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowSummary(false)}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-5 border-theme-border"
                >
                  <span>{isAr ? "تعديل" : "Modifier"}</span>
                </Button>
                <Button
                  onClick={handleStartDiagnostic}
                  disabled={submitting}
                  variant="primary"
                  size="lg"
                  className="w-full sm:flex-1 justify-center text-base font-bold shadow-xl shadow-electric/25 bg-electric hover:bg-electric-hover text-white"
                >
                  {submitting ? (
                    <span>{isAr ? "جاري البدء..." : "Démarrage..."}</span>
                  ) : (
                    <>
                      <span>{isAr ? "نكتاشفو مستوايا" : "Découvrir mon niveau"}</span>
                      <ArrowLeft className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-theme-border/40 text-center text-xs text-theme-muted">
        BAC Mastery &copy; {new Date().getFullYear()} — {isAr ? "الملف الأكاديمي للتحضير الذكي" : "Profil Académique"}
      </footer>
    </div>
  );
}
