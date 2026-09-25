"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BacExperience, ExperienceCategory } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ShareExperienceModal } from "@/components/experiences/ShareExperienceModal";
import { StudentChallenge, ChallengeInput } from "@/types/challenge";
import { ChallengeService } from "@/lib/services/challenge-service";
import { StudentChallengeCard } from "@/components/experiences/StudentChallengeCard";
import { ShareChallengeModal } from "@/components/experiences/ShareChallengeModal";
import { ChallengeDetailsModal } from "@/components/experiences/ChallengeDetailsModal";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StudentService } from "@/lib/services";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { AppShell } from "@/components/ui/AppShell";
import {
  Sparkles,
  Search,
  PlusCircle,
  Trophy,
  TrendingUp,
  Flame,
  Target,
  GraduationCap,
  MessageSquareQuote,
  CheckCircle2,
  BookOpen,
  Filter,
  MapPin,
  Layers,
  HelpCircle,
  Check,
} from "lucide-react";

const STREAMS = [
  { id: "all", label: "جميع الشعب" },
  { id: "sciences", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "gestion_economie", label: "تسيير واقتصاد" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "langues_etrangeres", label: "لغات أجنبية" },
];

const CATEGORIES: { id: ExperienceCategory; label: string; icon: any }[] = [
  { id: "all", label: "جميع التجارب", icon: MessageSquareQuote },
  { id: "top_achievers", label: "المتفوقون (16+)", icon: Trophy },
  { id: "repeater_success", label: "قصص نجاح المعيدين", icon: TrendingUp },
  { id: "current_students", label: "مقبلون على الباك 2027", icon: Target },
  { id: "top_upvoted", label: "الأعلى تقييماً", icon: Flame },
];

export function ExperiencesView({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();

  // Top-Level Segmented Tab
  const [activeHubTab, setActiveHubTab] = useState<"experiences" | "challenges">("experiences");

  // Experiences State
  const [experiences, setExperiences] = useState<BacExperience[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory>("all");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyTargetMatch, setOnlyTargetMatch] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Student Challenges State
  const [challenges, setChallenges] = useState<StudentChallenge[]>([]);
  const [challengeStream, setChallengeStream] = useState<string>("all");
  const [challengeSubject, setChallengeSubject] = useState<string>("all");
  const [challengeDifficulty, setChallengeDifficulty] = useState<string>("all");
  const [challengeWilaya, setChallengeWilaya] = useState<string>("all");
  const [challengeSearch, setChallengeSearch] = useState<string>("");
  const [isShareChallengeModalOpen, setIsShareChallengeModalOpen] = useState<boolean>(false);
  const [activeChallengeForDetails, setActiveChallengeForDetails] = useState<StudentChallenge | null>(null);

  // Common User State
  const [userStreamId, setUserStreamId] = useState<string | undefined>(undefined);
  const [userFirstName, setUserFirstName] = useState<string>("طالب");
  const [userWilaya, setUserWilaya] = useState<string>("");
  const [isOperatorUser, setIsOperatorUser] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChallengesLoading, setIsChallengesLoading] = useState<boolean>(false);

  // Read student profile, active stream, Wilaya, and role
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAuth = localStorage.getItem("bac_auth_user");
        const uid = user?.id || (storedAuth ? JSON.parse(storedAuth)?.id : null);

        // Check if owner or operator
        const isOpsBypass = Boolean(localStorage.getItem("ops_owner_bypass"));
        const isOpsToken = Boolean(localStorage.getItem("ops_auth_token"));
        const isOwnerMail = user?.email === "azinox27@gmail.com";
        setIsOperatorUser(isOpsBypass || isOpsToken || isOwnerMail);

        if (uid) {
          const prof = getStrategicProfile(uid);
          const reg = getRegistrationDraft(uid);

          if (prof?.streamId) setUserStreamId(prof.streamId);
          if (prof?.firstName) {
            setUserFirstName(prof.firstName.trim().split(/\s+/)[0]);
          } else if (reg?.firstName) {
            setUserFirstName(reg.firstName.trim().split(/\s+/)[0]);
          } else if (user?.user_metadata?.first_name) {
            setUserFirstName(user.user_metadata.first_name.trim().split(/\s+/)[0]);
          }

          // Wilaya detection
          let wilayaName = prof?.wilayaName || reg?.wilayaName || "";
          if (!wilayaName && (prof?.wilayaCode || reg?.wilayaCode)) {
            const code = prof?.wilayaCode || reg?.wilayaCode;
            const found = ALGERIAN_WILAYAS.find((w) => w.code === code);
            if (found) wilayaName = found.name_ar;
          }

          if (wilayaName) setUserWilaya(wilayaName);

          StudentService.getProfile(uid).then((sp) => {
            if (sp) {
              if (sp.firstName) setUserFirstName(sp.firstName.trim().split(/\s+/)[0]);
              if (sp.streamId) setUserStreamId(sp.streamId);
              if (sp.wilayaName) {
                setUserWilaya(sp.wilayaName);
              } else if (sp.wilayaCode) {
                const found = ALGERIAN_WILAYAS.find((w) => w.code === sp.wilayaCode);
                if (found) setUserWilaya(found.name_ar);
              }
            }
          });
        }
      } catch {}
    }
  }, [user]);

  // Load Experiences
  const loadExperiences = async () => {
    setIsLoading(true);
    try {
      const data = await ExperienceService.getExperiences(
        {
          streamId: selectedStream,
          category: selectedCategory,
          searchQuery,
          wilaya: selectedWilaya,
          onlyTargetMatch,
        },
        userStreamId
      );
      setExperiences(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, [selectedStream, selectedCategory, selectedWilaya, searchQuery, onlyTargetMatch, userStreamId]);

  // Load Student Challenges
  const loadChallenges = async () => {
    setIsChallengesLoading(true);
    try {
      const data = await ChallengeService.getChallenges({
        stream_id: challengeStream,
        subject_id: challengeSubject,
        difficulty: challengeDifficulty,
        wilaya: challengeWilaya,
        searchQuery: challengeSearch,
        currentUserId: user?.id,
      });
      setChallenges(data);
    } catch (e) {
      console.error("Failed to load challenges:", e);
    } finally {
      setIsChallengesLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [challengeStream, challengeSubject, challengeDifficulty, challengeWilaya, challengeSearch, user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleCreatedExperience = (newExp: BacExperience) => {
    setExperiences((prev) => [newExp, ...prev]);
    setSelectedStream("all");
    setSelectedCategory("all");
    setSelectedWilaya("all");
    setOnlyTargetMatch(false);
  };

  const handleCreatedChallenge = async (input: ChallengeInput) => {
    const res = await ChallengeService.createChallenge(input, user?.id);
    if (res.success && res.data) {
      setChallenges((prev) => [res.data!, ...prev]);
      showToast("تم نشر التحدي بنجاح في مجتمع البكالوريا!");
      return true;
    }
    return false;
  };

  const handleUpvoteChallenge = async (id: string) => {
    await ChallengeService.toggleUpvote(id, user?.id);
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التحدي؟")) return;
    const ok = await ChallengeService.deleteChallenge(id);
    if (ok) {
      setChallenges((prev) => prev.filter((c) => c.id !== id));
      showToast("تم حذف التحدي بنجاح");
      if (activeChallengeForDetails?.id === id) {
        setActiveChallengeForDetails(null);
      }
    }
  };

  // Aggregated Stats for Experiences
  const expStats = useMemo(() => {
    const total = experiences.length;
    const highGrades = experiences.filter((e) => (e.final_grade || 0) >= 16).length;
    const repeaters = experiences.filter(
      (e) => e.author_role === "repeater_success" || e.initial_grade || e.retaking_bac
    ).length;
    return { total, highGrades, repeaters };
  }, [experiences]);

  // Aggregated Stats for Challenges
  const chalStats = useMemo(() => {
    const total = challenges.length;
    const withSolution = challenges.filter((c) => c.has_solution).length;
    const highDiff = challenges.filter((c) => c.difficulty_level === "hard" || c.difficulty_level === "genius").length;
    return { total, withSolution, highDiff };
  }, [challenges]);

  const innerContent = (
    <div className="w-full space-y-6 sm:space-y-8 font-sans selection:bg-[var(--color-primary)] selection:text-white">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-2 rounded-2xl bg-white border-2 border-emerald-500 px-5 py-3 text-sm font-black text-emerald-950 shadow-lg backdrop-blur-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Dual Top-Level Hub Navigation Switcher */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-white border-2 border-slate-200 p-1.5 rounded-2xl flex items-center gap-2 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveHubTab("experiences")}
                className={`flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  activeHubTab === "experiences"
                    ? "bg-[#2C5E54] text-white shadow-xs"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C5E54]" />
                <span>تجارب وعِبر البكالوريا</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeHubTab === "experiences"
                      ? "bg-white/20 text-white font-black"
                      : "bg-slate-100 text-black font-bold border border-slate-300"
                  }`}
                >
                  {experiences.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveHubTab("challenges")}
                className={`flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  activeHubTab === "challenges"
                    ? "bg-[#2C5E54] text-white shadow-xs"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span>مواضيع وتحديات الزملاء</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeHubTab === "challenges"
                      ? "bg-white/20 text-white font-black"
                      : "bg-slate-100 text-black font-bold border border-slate-300"
                  }`}
                >
                  {challenges.length}
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: EXPERIENCES BANK                                                    */}
          {/* ========================================================================= */}
          {activeHubTab === "experiences" && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              {/* Hero Section: Majestic Forest Theme with Warm Glow */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A34] via-[#244b43] to-[#2C5E54] text-white p-6 sm:p-10 shadow-clay border border-[#2C5E54]/40">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-200 border border-white/20">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>حكمة وخبرات الميدان للبكالوريا</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
                      بنك التجارب والعِبر 🎓
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                      قصص واقعية ملهمة من متفوقين ومعيدين وطلبة مقبلين على بكالوريا 2027.
                      اضغط على أي تجربة لاكتشاف الفخاخ التي تضيع النقاط، والروتين اليومي الحاسم للتفوق.
                    </p>
                  </div>

                  {/* CTA Button: Share Experience */}
                  <div className="w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3.5 text-sm sm:text-base font-extrabold shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>شارك تجربتك واصنع الفارق ✨</span>
                    </button>
                  </div>
                </div>

                {/* Highlights Row */}
                <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/20 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 border border-white/15">
                    <div className="text-white/90 font-bold">إجمالي التجارب</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-white font-mono">{expStats.total}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 border border-white/15">
                    <div className="text-white/90 font-bold">متفوقو 16+ فما فوق</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-amber-300 font-mono">{expStats.highGrades}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 border border-white/15">
                    <div className="text-white/90 font-bold">قصص نجاح المعيدين</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-white font-mono">{expStats.repeaters}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 border border-white/15">
                    <div className="text-white/90 font-bold">تدقيق ومراجعة معتمدة</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-300 font-mono">100%</div>
                  </div>
                </div>
              </div>

              {/* Filter Controls (Comfortable High-Contrast Theme) */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="relative md:col-span-6">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالاسم، التخصص الجامعي (طب، ESI...)، أو الفخاخ..."
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white pr-11 pl-4 py-3 text-sm sm:text-base text-black placeholder:text-slate-500 font-bold focus:border-[#2C5E54] focus:outline-none focus:ring-2 focus:ring-[#2C5E54]/20 shadow-xs"
                    />
                  </div>

                  <div className="relative md:col-span-3">
                    <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600 pointer-events-none" />
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white pr-10 pl-4 py-3 text-sm sm:text-base text-black font-black focus:border-[#2C5E54] focus:outline-none cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="all">📍 جميع الولايات (الـ 58 ولاية)</option>
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w.code} value={w.name_ar}>
                          {w.code} - {w.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    {userStreamId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOnlyTargetMatch(!onlyTargetMatch);
                          if (!onlyTargetMatch) {
                            setSelectedStream("all");
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black border-2 transition-all cursor-pointer ${
                          onlyTargetMatch
                            ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                            : "bg-white text-black border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Target className="h-4 w-4" />
                        <span>تناسب شعبتي ({userStreamId}) 🎯</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const isActive = selectedCategory === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.id)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                          isActive
                            ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                            : "bg-white text-black border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stream Selector Pills */}
                {!onlyTargetMatch && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="flex items-center gap-1 text-sm text-black ml-2 font-black">
                      <Filter className="h-4 w-4 text-[#2C5E54]" />
                      <span>الشعبة:</span>
                    </span>
                    {STREAMS.map((s) => {
                      const isSelected = selectedStream === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStream(s.id)}
                          className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                            isSelected
                              ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                              : "bg-white text-black border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Directory Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-72 rounded-2xl border-2 border-slate-200 bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : experiences.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-4 shadow-sm">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-black">لا توجد تجارب مطابقة لهذا البحث حالياً</h3>
                  <p className="text-sm sm:text-base text-black max-w-md mx-auto font-semibold">
                    جرب تغيير خيارات الفلترة للاطلاع على كافة التجارب الملهمة المتاحة.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {experiences.map((exp) => (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      userId={user?.id}
                      userEmail={user?.email}
                      userFirstName={userFirstName}
                      userWilaya={userWilaya}
                      isOperator={isOperatorUser}
                      onToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STUDENT CHALLENGES & EXERCISES BANK                                 */}
          {/* ========================================================================= */}
          {activeHubTab === "challenges" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Challenges Hero */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#08152E] via-slate-900/70 to-slate-950 p-6 sm:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>بنك تمارين وتحديات الزملاء</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                      مواضيع وتحديات الزملاء ⚡
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      مسائل وتمارين مختارة يشاركها الطلاب للتدريب وتبادل الحلول النموذجية ومناقشة الأفكار الذكية.
                      يمكنك كتابة نص التمرين أو رفع صورة/PDF ومناقشة الحل مع زملائك.
                    </p>
                  </div>

                  {/* CTA Button: Post Challenge */}
                  <div className="w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setIsShareChallengeModalOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>+ شارك موضوعاً أو تحدياً ⚡</span>
                    </button>
                  </div>
                </div>

                {/* Challenges Highlights Row */}
                <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80">
                    <div className="text-slate-200 font-bold">إجمالي التحديات</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-white">{chalStats.total}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80">
                    <div className="text-slate-200 font-bold">مرفقة بالحل النموذجي</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-cyan-400">{chalStats.withSolution}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80">
                    <div className="text-slate-200 font-bold">أفكار تعمق وتحدي 19+</div>
                    <div className="mt-1 text-xl sm:text-2xl font-black text-amber-400">{chalStats.highDiff}</div>
                  </div>
                </div>
              </div>

              {/* Challenges Search & Filters */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="relative md:col-span-6">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      value={challengeSearch}
                      onChange={(e) => setChallengeSearch(e.target.value)}
                      placeholder="ابحث بعنوان التمرين، المحور (دوال، متتاليات...)، أو اسم الطالب..."
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white pr-11 pl-4 py-3 text-sm sm:text-base text-black placeholder:text-slate-500 font-bold focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 shadow-xs"
                    />
                  </div>

                  <div className="relative md:col-span-3">
                    <select
                      value={challengeSubject}
                      onChange={(e) => setChallengeSubject(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm sm:text-base text-black font-black focus:border-cyan-600 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value="all">جميع المواد الدراسية</option>
                      {Object.values(ALL_SUBJECTS).map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative md:col-span-3">
                    <select
                      value={challengeDifficulty}
                      onChange={(e) => setChallengeDifficulty(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm sm:text-base text-black font-black focus:border-cyan-600 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value="all">جميع مستويات الصعوبة</option>
                      <option value="normal">مستوى عادي</option>
                      <option value="medium">متوسط وأفكار هامة</option>
                      <option value="hard">فكرة صعبة / تعمق</option>
                      <option value="genius">تحدي للمتفوقين 19+</option>
                    </select>
                  </div>
                </div>

                {/* Stream Selector Pills for Challenges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="flex items-center gap-1 text-sm text-black ml-2 font-black">
                    <Filter className="h-4 w-4 text-cyan-600" />
                    <span>الشعبة:</span>
                  </span>
                  {STREAMS.map((s) => {
                    const isSelected = challengeStream === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setChallengeStream(s.id)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                          isSelected
                            ? "bg-cyan-600 text-white shadow-xs border-cyan-600"
                            : "bg-white text-black border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Challenges Grid */}
              {isChallengesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-80 rounded-2xl border-2 border-slate-200 bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : challenges.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-4 shadow-sm">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                    <Flame className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-black">لا توجد تمارين وتحديات مطابقة حالياً</h3>
                  <p className="text-sm sm:text-base text-black max-w-md mx-auto font-semibold">
                    كن أول من يشارك موضوعاً أو مسألة رياضية/فيزيائية من ثانويتك مع زملائك في البكالوريا!
                  </p>
                  <button
                    onClick={() => setIsShareChallengeModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white hover:bg-cyan-500 transition-colors cursor-pointer shadow-lg shadow-cyan-600/25"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة أول تحدي الآن</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((item) => (
                    <StudentChallengeCard
                      key={item.id}
                      challenge={item}
                      onUpvote={handleUpvoteChallenge}
                      onOpenDetails={(c) => setActiveChallengeForDetails(c)}
                      onDelete={handleDeleteChallenge}
                      currentUserId={user?.id}
                      isOperator={isOperatorUser}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Experience Modal */}
        <ShareExperienceModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          userId={user?.id}
          userFirstName={userFirstName}
          userWilaya={userWilaya}
          defaultStreamId={userStreamId || "sciences"}
          onCreated={handleCreatedExperience}
          onToast={showToast}
        />

        {/* Share Student Challenge Modal */}
        <ShareChallengeModal
          isOpen={isShareChallengeModalOpen}
          onClose={() => setIsShareChallengeModalOpen(false)}
          onSubmit={handleCreatedChallenge}
          userFirstName={userFirstName}
          userWilaya={userWilaya}
          userStreamId={userStreamId}
        />

        {/* Challenge Details & Discussion Modal */}
        <ChallengeDetailsModal
          isOpen={Boolean(activeChallengeForDetails)}
          onClose={() => setActiveChallengeForDetails(null)}
          challenge={activeChallengeForDetails}
          onUpvote={handleUpvoteChallenge}
          userFirstName={userFirstName}
          userWilaya={userWilaya}
          currentUserId={user?.id}
          isOperator={isOperatorUser}
        />
      </div>
  );

  if (embedded) {
    return innerContent;
  }

  return <AppShell activeNav="experiences">{innerContent}</AppShell>;
}

export default function ExperiencesPage() {
  return <ExperiencesView />;
}
