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
  StudentStatus,
  StudentRegistrationData,
} from "@/types/registration";
import { StreamId, TechniqueMathSpecialty } from "@/types/education";
import { STREAM_REGISTRY, SPECIALTY_REGISTRY } from "@/domain/curriculum/streams";
import {
  getAlgerianWilayas,
  getCommunesByWilayaCode,
  Wilaya,
  Commune,
} from "@/domain/administrative/algeria-administrative";
import {
  validateAlgerianPhone,
  normalizeAlgerianPhone,
} from "@/domain/administrative/phone-validation";
import { StudentService } from "@/lib/services";
import { StudentRepository } from "@/lib/repositories/student-repository";
import {
  getRegistrationDraft,
  saveRegistrationDraft,
} from "@/lib/onboarding/profile";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  School,
  GraduationCap,
  MapPin,
  Phone,
  User,
  FlaskConical,
  Compass,
  Cog,
  Briefcase,
  BookOpen,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STREAM_ICONS: Record<StreamId, any> = {
  sciences_exp: FlaskConical,
  math: Compass,
  technique_math: Cog,
  gestion_eco: Briefcase,
  lettres_philo: BookOpen,
  langues_etrangeres: Globe,
};

export default function StudentRegistrationPage() {
  const router = useRouter();
  const { direction, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading } = useAuth();

  // Enforce auth requirement: cannot access registration without an account
  useEffect(() => {
    if (!isLoading && !user) {
      let hasLocalUser = false;
      try {
        if (typeof window !== "undefined" && localStorage.getItem("bac_auth_user")) {
          hasLocalUser = true;
        }
      } catch {}
      if (!hasLocalUser) {
        router.replace("/auth?mode=signup");
        return;
      }
    }
    if (!isLoading) {
      const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id : undefined);
      const isEditMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "true";
      if (effectiveUserId && !isEditMode) {
        StudentService.getProfile(effectiveUserId).then((p) => {
          const regDraft = getRegistrationDraft(effectiveUserId);
          // If registration is already done for THIS user, forward to dashboard
          const isRegistered = Boolean(
            p?.registrationCompletedAt ||
            (p as any)?.registration_completed_at ||
            (p?.firstName && p?.streamId) ||
            ((p as any)?.first_name && (p as any)?.stream_id) ||
            (regDraft?.registrationCompletedAt && (regDraft?.firstName || regDraft?.streamId))
          );
          if (isRegistered) {
            // Ensure local repository has the profile cached before navigating to dashboard
            if (!p && regDraft) {
              StudentRepository.getProfile(effectiveUserId);
            }
            // Loop guard: prevent rapid ping-pong bounce
            if (typeof window !== "undefined") {
              const lastBounce = sessionStorage.getItem("bac_reg_bounce_time");
              const now = Date.now();
              if (lastBounce && now - parseInt(lastBounce, 10) < 3000) {
                console.warn("Rapid redirect loop prevented in register page");
                return;
              }
              sessionStorage.setItem("bac_reg_bounce_time", String(now));
            }
            router.replace("/dashboard");
          }
        });
      }
    }
  }, [user, isLoading, router]);

  // Progress state: step index 1 to 6 (or 1 to 5 for free candidates)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [characterId, setCharacterId] = useState<"boy" | "girl" | "scholar">("scholar");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [studentPhone, setStudentPhone] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");

  const [studentStatus, setStudentStatus] = useState<StudentStatus>("schooled");
  const [streamId, setStreamId] = useState<StreamId>("sciences_exp");
  const [techniqueMathSpecialty, setTechniqueMathSpecialty] = useState<TechniqueMathSpecialty>("civil_eng");

  const [wilayaCode, setWilayaCode] = useState<string>("");
  const [wilayaName, setWilayaName] = useState<string>("");
  const [communeCode, setCommuneCode] = useState<string>("");
  const [communeName, setCommuneName] = useState<string>("");

  const [schoolName, setSchoolName] = useState<string>("");

  // Cached Wilayas & Dynamic Communes
  const wilayas: Wilaya[] = getAlgerianWilayas();
  const [availableCommunes, setAvailableCommunes] = useState<Commune[]>([]);

  // Load saved draft or current profile on mount (scoped strictly to active user)
  useEffect(() => {
    const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id : undefined);
    if (!effectiveUserId) return;
    const draft = getRegistrationDraft(effectiveUserId);
    StudentService.getProfile(effectiveUserId).then((p: any) => {
      const char = draft?.characterId || p?.characterId || (p as any)?.character_id;
      if (char) setCharacterId(char);
      const fn = draft?.firstName || p?.firstName || (p as any)?.first_name;
      if (fn) setFirstName(fn);
      const ln = draft?.lastName || p?.lastName || (p as any)?.last_name;
      if (ln) setLastName(ln);
      const sp = draft?.studentPhone || p?.studentPhone || (p as any)?.student_phone;
      if (sp) setStudentPhone(sp);
      const pp = draft?.parentPhone || p?.parentPhone || (p as any)?.parent_phone;
      if (pp) setParentPhone(pp);
      const st = draft?.studentStatus || p?.studentStatus || (p as any)?.student_status;
      if (st) setStudentStatus(st);
      const sm = draft?.streamId || p?.streamId || (p as any)?.stream_id;
      if (sm) setStreamId(sm);
      const tms = draft?.techniqueMathSpecialty || p?.techniqueMathSpecialty || (p as any)?.specialty_id;
      if (tms) setTechniqueMathSpecialty(tms);
      const wc = draft?.wilayaCode || p?.wilayaCode || (p as any)?.wilaya_code;
      if (wc) {
        setWilayaCode(wc);
        const wn = draft?.wilayaName || p?.wilayaName || (p as any)?.wilaya_name || "";
        setWilayaName(wn);
        const communes = getCommunesByWilayaCode(wc);
        setAvailableCommunes(communes);
        const cc = draft?.communeCode || p?.communeCode || (p as any)?.commune_code;
        if (cc) {
          setCommuneCode(cc);
          const cn = draft?.communeName || p?.communeName || (p as any)?.commune_name || "";
          setCommuneName(cn);
        }
      }
      const sn = draft?.schoolName || p?.schoolName || (p as any)?.school_name;
      if (sn) setSchoolName(sn);
    });
  }, [user]);

  // Update dynamic communes when wilaya changes
  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommuneCode("");
    setCommuneName("");
    const selected = wilayas.find((w) => w.code === code);
    if (selected) {
      setWilayaName(isAr ? selected.name_ar : selected.name_fr);
      const communes = getCommunesByWilayaCode(code);
      setAvailableCommunes(communes);
    } else {
      setWilayaName("");
      setAvailableCommunes([]);
    }
  };

  const handleCommuneChange = (code: string) => {
    setCommuneCode(code);
    const selected = availableCommunes.find((c) => c.code === code);
    if (selected) {
      setCommuneName(isAr ? selected.name_ar : selected.name_fr);
    } else {
      setCommuneName("");
    }
  };

  // Save current draft to localStorage between steps (scoped to active user)
  const persistCurrentDraft = (overrides: Partial<StudentRegistrationData> = {}) => {
    let effectiveUserId = user?.id;
    if (!effectiveUserId && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("bac_auth_user");
        if (stored) effectiveUserId = JSON.parse(stored)?.id;
      } catch {}
    }
    const draftPayload: StudentRegistrationData = {
      characterId: overrides.characterId !== undefined ? overrides.characterId : characterId,
      firstName: overrides.firstName !== undefined ? overrides.firstName : firstName,
      lastName: overrides.lastName !== undefined ? overrides.lastName : lastName,
      studentPhone: overrides.studentPhone !== undefined ? overrides.studentPhone : studentPhone,
      parentPhone: overrides.parentPhone !== undefined ? overrides.parentPhone : parentPhone,
      studentStatus: overrides.studentStatus !== undefined ? overrides.studentStatus : studentStatus,
      streamId: overrides.streamId !== undefined ? overrides.streamId : streamId,
      techniqueMathSpecialty: streamId === "technique_math" ? techniqueMathSpecialty : undefined,
      wilayaCode: overrides.wilayaCode !== undefined ? overrides.wilayaCode : wilayaCode,
      wilayaName: overrides.wilayaName !== undefined ? overrides.wilayaName : wilayaName,
      communeCode: overrides.communeCode !== undefined ? overrides.communeCode : communeCode,
      communeName: overrides.communeName !== undefined ? overrides.communeName : communeName,
      schoolName: studentStatus === "free" ? null : (overrides.schoolName !== undefined ? overrides.schoolName : schoolName),
    };
    saveRegistrationDraft(draftPayload, effectiveUserId);
  };

  // Step 1: Validation
  const validateStep1 = (): boolean => {
    setErrorMsg(null);
    if (!firstName.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة الاسم الشخصي." : "Veuillez saisir votre prénom.");
      return false;
    }
    if (!lastName.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة اللقب." : "Veuillez saisir votre nom de famille.");
      return false;
    }
    const studentPhoneCheck = validateAlgerianPhone(studentPhone, {
      fieldName_ar: "رقم هاتفك",
      fieldName_fr: "votre numéro de téléphone",
    });
    if (!studentPhoneCheck.isValid) {
      setErrorMsg(isAr ? studentPhoneCheck.error_ar! : studentPhoneCheck.error_fr!);
      return false;
    }
    if (parentPhone && parentPhone.trim() !== "") {
      const parentPhoneCheck = validateAlgerianPhone(parentPhone, {
        isOptional: true,
        fieldName_ar: "رقم ولي الأمر",
        fieldName_fr: "le numéro du tuteur",
      });
      if (!parentPhoneCheck.isValid) {
        setErrorMsg(isAr ? parentPhoneCheck.error_ar! : parentPhoneCheck.error_fr!);
        return false;
      }
    }
    return true;
  };

  // Step 4: Validation (Location)
  const validateStep4 = (): boolean => {
    setErrorMsg(null);
    if (!wilayaCode) {
      setErrorMsg(isAr ? "يرجى اختيار ولايتك." : "Veuillez sélectionner votre wilaya.");
      return false;
    }
    if (!communeCode) {
      setErrorMsg(isAr ? "يرجى اختيار بلديتك." : "Veuillez sélectionner votre commune.");
      return false;
    }
    return true;
  };

  // Step 5: Validation (School - only for schooled)
  const validateStep5 = (): boolean => {
    setErrorMsg(null);
    if (studentStatus === "schooled" && !schoolName.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة اسم ثانويتك." : "Veuillez saisir le nom de votre lycée.");
      return false;
    }
    return true;
  };

  // Next Step Action
  const handleNext = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!validateStep1()) return;
      persistCurrentDraft();
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      persistCurrentDraft();
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      persistCurrentDraft();
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!validateStep4()) return;
      persistCurrentDraft();
      // If free candidate, skip step 5 (school) straight to confirmation!
      if (studentStatus === "free") {
        setSchoolName("");
        setCurrentStep(6);
      } else {
        setCurrentStep(5);
      }
      return;
    }

    if (currentStep === 5) {
      if (!validateStep5()) return;
      persistCurrentDraft();
      setCurrentStep(6);
      return;
    }
  };

  // Previous Step Action
  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep === 6) {
      // If free candidate, going back from confirmation returns to step 4 (location)
      if (studentStatus === "free") {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final Submission (Step 6)
  const handleFinalSubmit = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const finalPayload: StudentRegistrationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentPhone: normalizeAlgerianPhone(studentPhone),
        parentPhone: parentPhone ? normalizeAlgerianPhone(parentPhone) : undefined,
        studentStatus,
        streamId,
        techniqueMathSpecialty: streamId === "technique_math" ? techniqueMathSpecialty : undefined,
        wilayaCode,
        wilayaName,
        communeCode,
        communeName,
        schoolName: studentStatus === "free" ? null : schoolName.trim(),
        registrationCompletedAt: new Date().toISOString(),
      };

      // 1. Resolve effective user ID
      let effectiveUserId = user?.id;
      if (!effectiveUserId && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("bac_auth_user");
          if (stored) effectiveUserId = JSON.parse(stored)?.id;
        } catch {}
      }

      // 2. Immediately save to scoped localStorage draft so it exists synchronously before navigation
      saveRegistrationDraft(finalPayload, effectiveUserId);

      // 3. Persist to service (LocalStorage + Supabase if auth user exists)
      await StudentService.saveRegistration(finalPayload, effectiveUserId);

      // 4. Transition immediately
      const isEditMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "true";
      if (isEditMode) {
        router.push("/account");
      } else {
        router.push("/profile/academic");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMsg(
        isAr
          ? "حدث خطأ أثناء حفظ المعلومات. يرجى المحاولة مرة أخرى."
          : "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
      setSubmitting(false);
    }
  };

  // Progress computation (5 steps for free candidates, 6 steps for schooled)
  const totalSteps = studentStatus === "free" ? 5 : 6;
  const displayStepNumber = studentStatus === "free" && currentStep === 6 ? 5 : currentStep;

  const isRTL = direction === "rtl" || isAr;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
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
          <div className="flex items-center gap-3">
            {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "true" && (
              <Link
                href="/account"
                className="text-xs font-bold text-theme-muted hover:text-theme-text px-3 py-1.5 rounded-xl border border-theme hover:bg-surface transition-all"
              >
                {isAr ? "الرجوع للحساب" : "Retour au compte"}
              </Link>
            )}
            <Badge variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-500/30">
              {isAr ? `الخطوة ${displayStepNumber} من ${totalSteps}` : `Étape ${displayStepNumber} sur ${totalSteps}`}
            </Badge>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 md:py-12 flex items-center">
        <Container size="sm" className="w-full">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const stepIndex = i + 1;
              const isActive = stepIndex === displayStepNumber;
              const isDone = stepIndex < displayStepNumber;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-electric"
                      : isDone
                      ? "w-2 bg-success"
                      : "w-2 bg-theme-border"
                  }`}
                />
              );
            })}
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 1: WELCOME & IDENTITY                                      */}
          {/* =============================================================== */}
          {currentStep === 1 && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-electric/10 text-electric flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "نبدأو بحاجة بسيطة" : "Commençons simplement"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "معلوماتك الأساسية باش نعرفو مع مين رانا نقراو."
                    : "Vos informations de base pour faire connaissance."}
                </p>
              </div>

              {/* Study Character Avatar Selection */}
              <div className="mb-6 p-4 rounded-2xl bg-canvas/60 border border-theme-border">
                <label className="block text-xs font-bold text-theme-base mb-3 text-center">
                  {isAr ? "اختر شخصيتك المرافقة في رحلة البكالوريا" : "Choisissez votre avatar d'étude"}
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  {[
                    { id: "boy", nameAr: "الفتى الطموح", nameFr: "L'Ambitieux", img: "/illustrations/characters/boy.jpg" },
                    { id: "girl", nameAr: "الفتاة المتفوقة", nameFr: "L'Étoile", img: "/illustrations/characters/girl.jpg" },
                    { id: "scholar", nameAr: "الباحث المركز", nameFr: "Le Méthodique", img: "/illustrations/characters/scholar.jpg" },
                  ].map((c) => {
                    const isSelected = characterId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCharacterId(c.id as any)}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40 shadow-sm"
                            : "bg-surface border-theme hover:border-[var(--color-border-hover)]"
                        }`}
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                          <img src={c.img} alt={c.nameAr} className="w-full h-full object-cover object-top" />
                        </div>
                        <span className={`text-[11px] sm:text-xs font-bold ${isSelected ? "text-[var(--color-primary)]" : "text-theme-muted"}`}>
                          {isAr ? c.nameAr : c.nameFr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                      {isAr ? "الاسم الشخصي *" : "Prénom *"}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={isAr ? "مثال: أمين" : "Ex: Amine"}
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                      {isAr ? "اللقب *" : "Nom de famille *"}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={isAr ? "مثال: بن علي" : "Ex: Benali"}
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    {isAr ? "رقم هاتفك *" : "Votre numéro de téléphone *"}
                  </label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="05 / 06 / 07..."
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-mono"
                  />
                  <p className="text-[11px] text-theme-muted/80 mt-1">
                    {isAr
                      ? "رقم هاتفك محمي ولن يظهر لأي مستخدم آخر."
                      : "Votre numéro est strictement privé."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-theme-muted" />
                    {isAr ? "رقم ولي الأمر (اختياري)" : "Numéro du tuteur (optionnel)"}
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="05 / 06 / 07..."
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-mono"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-base font-bold shadow-lg shadow-electric/20"
                >
                  <span>{isAr ? "نكمل" : "Continuer"}</span>
                  <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          )}

          {/* =============================================================== */}
          {/* STEP 2: STUDENT STATUS                                          */}
          {/* =============================================================== */}
          {currentStep === 2 && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "أنت متمدرس ولا مترشح حر؟" : "Êtes-vous scolarisé ou candidat libre ?"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "باش نوجهو المحتوى والخطة حسب وضعيتك."
                    : "Pour adapter le planning selon votre situation."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {/* Option 1: Schooled */}
                <button
                  type="button"
                  onClick={() => setStudentStatus("schooled")}
                  className={`p-6 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all duration-200 flex flex-col justify-between ${
                    studentStatus === "schooled"
                      ? "bg-electric/10 border-electric shadow-lg shadow-electric/10 text-theme-base ring-1 ring-electric"
                      : "bg-canvas/60 border-theme-border text-theme-muted hover:border-theme-border/80 hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-10 h-10 rounded-xl bg-electric/20 text-electric flex items-center justify-center">
                      <School className="w-5 h-5" />
                    </div>
                    {studentStatus === "schooled" && (
                      <div className="w-6 h-6 rounded-full bg-electric text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-base mb-1">
                      {isAr ? "متمدرس" : "Scolarisé"}
                    </h3>
                    <p className="text-xs text-theme-muted">
                      {isAr
                        ? "تقرا في ثانوية عمومية أو خاصة هذا العام."
                        : "Inscrit dans un lycée public ou privé."}
                    </p>
                  </div>
                </button>

                {/* Option 2: Free Candidate */}
                <button
                  type="button"
                  onClick={() => setStudentStatus("free")}
                  className={`p-6 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all duration-200 flex flex-col justify-between ${
                    studentStatus === "free"
                      ? "bg-electric/10 border-electric shadow-lg shadow-electric/10 text-theme-base ring-1 ring-electric"
                      : "bg-canvas/60 border-theme-border text-theme-muted hover:border-theme-border/80 hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {studentStatus === "free" && (
                      <div className="w-6 h-6 rounded-full bg-electric text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-base mb-1">
                      {isAr ? "مترشح حر" : "Candidat libre"}
                    </h3>
                    <p className="text-xs text-theme-muted">
                      {isAr
                        ? "رايح تعقب الباك وحدك بلا حضور يومي في الثانوية."
                        : "Préparation autonome sans obligation scolaire."}
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-5 border-theme-border"
                >
                  <BackIcon className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isAr ? "رجوع" : "Retour"}</span>
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="flex-1 justify-center text-base font-bold shadow-lg shadow-electric/20"
                >
                  <span>{isAr ? "نكمل" : "Continuer"}</span>
                  <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          )}

          {/* =============================================================== */}
          {/* STEP 3: BAC STREAM                                              */}
          {/* =============================================================== */}
          {currentStep === 3 && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "وش هي شعبتك؟" : "Quelle est votre filière ?"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "اختر شعبتك الرسمية في البكالوريا."
                    : "Sélectionnez votre série officielle du Baccalauréat."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                {(Object.keys(STREAM_REGISTRY) as StreamId[]).map((sId) => {
                  const s = STREAM_REGISTRY[sId];
                  const Icon = STREAM_ICONS[sId] || Compass;
                  const isSelected = streamId === sId;

                  return (
                    <button
                      key={sId}
                      type="button"
                      onClick={() => setStreamId(sId)}
                      className={`p-4 rounded-xl border text-right rtl:text-right ltr:text-left transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? "bg-electric/15 border-electric text-theme-base shadow-sm ring-1 ring-electric"
                          : "bg-canvas/50 border-theme-border/70 text-theme-muted hover:border-theme-border hover:bg-canvas"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-electric text-white" : "bg-theme-border/40 text-theme-muted"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-theme-base">
                            {isAr ? s.name_ar : s.name_fr}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-electric" />}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Specialty selector if Technique Math is selected */}
              {streamId === "technique_math" && (
                <div className="mt-4 p-4 rounded-xl bg-canvas border border-electric/40 animate-fadeIn">
                  <label className="block text-xs font-bold text-cyan-400 mb-2">
                    {isAr ? "اختر التخصص الهندسي (تقني رياضي) *" : "Branche de Génie (Technique Math) *"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(SPECIALTY_REGISTRY) as TechniqueMathSpecialty[]).map((spId) => {
                      const sp = SPECIALTY_REGISTRY[spId];
                      const isSpSelected = techniqueMathSpecialty === spId;
                      return (
                        <button
                          key={spId}
                          type="button"
                          onClick={() => setTechniqueMathSpecialty(spId)}
                          className={`p-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                            isSpSelected
                              ? "bg-electric/20 border-electric text-electric"
                              : "bg-surface border-theme-border text-theme-muted hover:bg-surface/80"
                          }`}
                        >
                          <span>{isAr ? sp.name_ar : sp.name_fr}</span>
                          {isSpSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-5 border-theme-border"
                >
                  <BackIcon className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isAr ? "رجوع" : "Retour"}</span>
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="flex-1 justify-center text-base font-bold shadow-lg shadow-electric/20"
                >
                  <span>{isAr ? "نكمل" : "Continuer"}</span>
                  <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          )}

          {/* =============================================================== */}
          {/* STEP 4: LOCATION (WILAYA & COMMUNE)                             */}
          {/* =============================================================== */}
          {currentStep === 4 && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "وين تقرا؟" : "Où étudiez-vous ?"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "حدد ولايتك وبلديتك."
                    : "Indiquez votre wilaya et votre commune."}
                </p>
              </div>

              <div className="space-y-4 my-6">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                    {isAr ? "الولاية *" : "Wilaya *"}
                  </label>
                  <select
                    value={wilayaCode}
                    onChange={(e) => handleWilayaChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base"
                  >
                    <option value="">{isAr ? "— اختر الولاية —" : "— Sélectionner la wilaya —"}</option>
                    {wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {isAr ? w.name_ar : w.name_fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                    {isAr ? "البلدية *" : "Commune *"}
                  </label>
                  <select
                    value={communeCode}
                    onChange={(e) => handleCommuneChange(e.target.value)}
                    disabled={!wilayaCode || availableCommunes.length === 0}
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!wilayaCode
                        ? isAr ? "— اختر الولاية أولاً —" : "— Choisissez la wilaya d'abord —"
                        : isAr ? "— اختر البلدية —" : "— Sélectionner la commune —"}
                    </option>
                    {availableCommunes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {isAr ? c.name_ar : c.name_fr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-5 border-theme-border"
                >
                  <BackIcon className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isAr ? "رجوع" : "Retour"}</span>
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="flex-1 justify-center text-base font-bold shadow-lg shadow-electric/20"
                >
                  <span>{isAr ? "نكمل" : "Continuer"}</span>
                  <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          )}

          {/* =============================================================== */}
          {/* STEP 5: SCHOOL NAME (SCHOOLED ONLY)                             */}
          {/* =============================================================== */}
          {currentStep === 5 && studentStatus === "schooled" && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-electric/10 text-electric flex items-center justify-center mx-auto mb-3">
                  <School className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "وين تقرا؟" : "Quel est votre lycée ?"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "اكتب اسم ثانويتك الرسمية."
                    : "Saisissez le nom officiel de votre lycée."}
                </p>
              </div>

              <div className="space-y-4 my-6">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5">
                    {isAr ? "اسم الثانوية *" : "Nom du lycée *"}
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder={isAr ? "مثال: ثانوية العقيد لطفي" : "Ex: Lycée Colonel Lotfi"}
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-5 border-theme-border"
                >
                  <BackIcon className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isAr ? "رجوع" : "Retour"}</span>
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="flex-1 justify-center text-base font-bold shadow-lg shadow-electric/20"
                >
                  <span>{isAr ? "نكمل" : "Continuer"}</span>
                  <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </Card>
          )}

          {/* =============================================================== */}
          {/* STEP 6: CONFIRMATION SUMMARY                                   */}
          {/* =============================================================== */}
          {currentStep === 6 && (
            <Card className="p-6 md:p-8 bg-surface border-theme-border shadow-xl rounded-2xl animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-theme-base mb-2">
                  {isAr ? "نظرة أخيرة قبل ما نكملو" : "Vérification de vos informations"}
                </h1>
                <p className="text-theme-muted text-sm">
                  {isAr
                    ? "تأكد من صحة معلوماتك. تقدر تعدلها في أي وقت."
                    : "Assurez-vous de l'exactitude de votre profil."}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="rounded-xl bg-canvas/80 border border-theme-border/80 divide-y divide-theme-border/60 text-sm my-6 overflow-hidden">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-theme-muted text-xs">{isAr ? "الاسم واللقب" : "Nom & Prénom"}</span>
                  <span className="font-bold text-theme-base">{firstName} {lastName}</span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-theme-muted text-xs">{isAr ? "الحالة" : "Statut"}</span>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {studentStatus === "schooled"
                      ? isAr ? "متمدرس" : "Scolarisé"
                      : isAr ? "مترشح حر" : "Candidat libre"}
                  </Badge>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-theme-muted text-xs">{isAr ? "الشعبة" : "Série"}</span>
                  <span className="font-bold text-cyan-400">
                    {isAr ? STREAM_REGISTRY[streamId]?.name_ar : STREAM_REGISTRY[streamId]?.name_fr}
                    {streamId === "technique_math" && ` (${isAr ? SPECIALTY_REGISTRY[techniqueMathSpecialty]?.name_ar : SPECIALTY_REGISTRY[techniqueMathSpecialty]?.name_fr})`}
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-theme-muted text-xs">{isAr ? "الموقع" : "Localisation"}</span>
                  <span className="font-medium text-theme-base">{wilayaName} — {communeName}</span>
                </div>

                {studentStatus === "schooled" && schoolName && (
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-theme-muted text-xs">{isAr ? "الثانوية" : "Lycée"}</span>
                    <span className="font-medium text-theme-base">{schoolName}</span>
                  </div>
                )}

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-theme-muted text-xs">{isAr ? "رقم هاتفك" : "Téléphone"}</span>
                  <span className="font-mono text-theme-base" dir="ltr">{studentPhone}</span>
                </div>

                {parentPhone && parentPhone.trim() !== "" && (
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-theme-muted text-xs">{isAr ? "رقم ولي الأمر" : "Téléphone tuteur"}</span>
                    <span className="font-mono text-theme-muted" dir="ltr">{parentPhone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-5 border-theme-border"
                >
                  <BackIcon className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                  <span>{isAr ? "نرجع نعدل" : "Modifier"}</span>
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  variant="primary"
                  size="lg"
                  className="w-full sm:flex-1 justify-center text-base font-bold shadow-xl shadow-electric/25 bg-electric hover:bg-electric-hover text-white"
                >
                  {submitting ? (
                    <span>{isAr ? "جاري الحفظ..." : "Enregistrement..."}</span>
                  ) : (
                    <>
                      <span>
                        {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "true"
                          ? (isAr ? "حفظ وتحديث البيانات والعودة للحساب" : "Enregistrer et retourner au compte")
                          : (isAr ? "كلش صحيح — نكمل" : "Tout est correct — Continuer")}
                      </span>
                      <NextIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
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
        BAC Mastery &copy; {new Date().getFullYear()} — {isAr ? "منصة التحضير الذكي للبكالوريا الجزائرية" : "Plateforme de préparation intelligente au Baccalauréat"}
      </footer>
    </div>
  );
}
