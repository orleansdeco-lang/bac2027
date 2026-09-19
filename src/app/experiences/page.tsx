"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BacExperience, ExperienceCategory } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ShareExperienceModal } from "@/components/experiences/ShareExperienceModal";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile } from "@/lib/onboarding/profile";
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

export default function ExperiencesPage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<BacExperience[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyTargetMatch, setOnlyTargetMatch] = useState<boolean>(false);
  const [userStreamId, setUserStreamId] = useState<string | undefined>(undefined);
  const [userFirstName, setUserFirstName] = useState<string>("طالب");

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Read student's active stream and first name from strategic profile & auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAuth = localStorage.getItem("bac_auth_user");
        const uid = user?.id || (storedAuth ? JSON.parse(storedAuth)?.id : null);
        if (uid) {
          const prof = getStrategicProfile(uid);
          if (prof?.streamId) {
            setUserStreamId(prof.streamId);
          }
          if (prof?.firstName) {
            setUserFirstName(prof.firstName.trim().split(/\s+/)[0]);
          } else if (user?.user_metadata?.first_name) {
            setUserFirstName(user.user_metadata.first_name.trim().split(/\s+/)[0]);
          }
        }
      } catch {}
    }
  }, [user]);

  const loadExperiences = async () => {
    setIsLoading(true);
    try {
      const data = await ExperienceService.getExperiences(
        {
          streamId: selectedStream,
          category: selectedCategory,
          searchQuery,
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
  }, [selectedStream, selectedCategory, searchQuery, onlyTargetMatch, userStreamId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleCreated = (newExp: BacExperience) => {
    setExperiences((prev) => [newExp, ...prev]);
    setSelectedStream("all");
    setSelectedCategory("all");
    setOnlyTargetMatch(false);
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = experiences.length;
    const highGrades = experiences.filter((e) => (e.final_grade || 0) >= 16).length;
    const repeaters = experiences.filter(
      (e) => e.author_role === "repeater_success" || e.initial_grade || e.retaking_bac
    ).length;
    return { total, highGrades, repeaters };
  }, [experiences]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#26302F] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1E3A34] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2 rounded-2xl bg-[#1E3A34] border border-[#5F8F86] px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md">
            <CheckCircle2 className="h-5 w-5 text-[#D7A66A] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Banner with Eye-Comfort Warm Forest/Gold Palette */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E4DED2] bg-gradient-to-br from-[#1E3A34] via-[#24463F] to-[#1E3A34] p-6 sm:p-10 shadow-lg text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-[#5F8F86]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-72 w-72 rounded-full bg-[#D7A66A]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#E6C285] border border-white/15">
                <Sparkles className="h-3.5 w-3.5" />
                <span>خلاصة وخبرات الميدان الحقيقية</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                بنك التجارب والعِبر 🎓
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                تجارب ميدانية صادقة من متفوقين ومعيدين وطلبة مقبلين على بكالوريا 2027.
                تعلم من أكبر الفخاخ التي تضيع النقاط، واكتشف الروتينات الحاسمة التي صنعت الفارق.
              </p>
            </div>

            {/* CTA Button: Share Experience */}
            <div className="w-full md:w-auto shrink-0">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#D7A66A] to-[#E6C285] px-6 py-3.5 text-sm sm:text-base font-extrabold text-[#1E3A34] shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusCircle className="h-5 w-5" />
                <span>شارك تجربتك واصنع الفارق ✨</span>
              </button>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15 text-xs sm:text-sm">
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 backdrop-blur-xs">
              <div className="text-emerald-200/80">إجمالي التجارب</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-white">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 backdrop-blur-xs">
              <div className="text-emerald-200/80">متفوقو 16+ فما فوق</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-[#E6C285]">{stats.highGrades}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 backdrop-blur-xs">
              <div className="text-emerald-200/80">قصص نجاح المعيدين</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-white">{stats.repeaters}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 backdrop-blur-xs">
              <div className="text-emerald-200/80">مراجعة وتدقيق معتمد</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-300">100%</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4">
          {/* Top Search and Target Match Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#768280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، التخصص الجامعي (طب، إعلام آلي...)، أو أكبر فخ..."
                className="w-full rounded-2xl border border-[#E4DED2] bg-white pr-10 pl-4 py-2.5 text-xs sm:text-sm text-[#26302F] placeholder-[#A0AAA8] focus:border-[#1E3A34] focus:outline-none shadow-xs"
              />
            </div>

            {/* Target Match Filter Button */}
            {userStreamId && (
              <button
                onClick={() => {
                  setOnlyTargetMatch(!onlyTargetMatch);
                  if (!onlyTargetMatch) {
                    setSelectedStream("all");
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  onlyTargetMatch
                    ? "bg-[#1E3A34] text-white border-[#1E3A34] shadow-sm"
                    : "bg-white text-[#26302F] border-[#E4DED2] hover:bg-[#F3EDE0]"
                }`}
              >
                <Target className="h-4 w-4 text-[#5F8F86]" />
                <span>تجارب تناسب شعبتي ({userStreamId}) 🎯</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1E3A34] text-white shadow-sm font-bold"
                      : "bg-white text-[#4A5553] border border-[#E4DED2] hover:bg-[#F3EDE0] hover:text-[#26302F]"
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
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="flex items-center gap-1 text-xs text-[#768280] ml-2 font-medium">
                <Filter className="h-3.5 w-3.5 text-[#5F8F86]" />
                <span>الشعبة:</span>
              </span>
              {STREAMS.map((s) => {
                const isSelected = selectedStream === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStream(s.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1E3A34] text-white font-bold shadow-xs"
                        : "bg-white text-[#4A5553] border border-[#E4DED2] hover:bg-[#F3EDE0] hover:text-[#26302F]"
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
                className="h-72 rounded-2xl border border-[#E4DED2] bg-white animate-pulse"
              />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E4DED2] bg-white p-12 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#768280] border border-[#E4DED2]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1E3A34]">لا توجد تجارب مطابقة لهذا البحث حالياً</h3>
            <p className="text-xs sm:text-sm text-[#768280] max-w-md mx-auto">
              جرب تغيير خيارات الفلترة أو إلغاء كلمات البحث للاطلاع على كافة التجارب الملهمة المتاحة.
            </p>
            <button
              onClick={() => {
                setSelectedStream("all");
                setSelectedCategory("all");
                setSearchQuery("");
                setOnlyTargetMatch(false);
              }}
              className="rounded-xl bg-[#1E3A34] px-5 py-2 text-xs font-bold text-white hover:bg-[#2c4e46] transition-colors cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                userId={user?.id}
                userFirstName={userFirstName}
                onToast={showToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Experience Modal */}
      <ShareExperienceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userId={user?.id}
        userFirstName={userFirstName}
        defaultStreamId={userStreamId || "sciences"}
        onCreated={handleCreated}
        onToast={showToast}
      />
    </div>
  );
}
