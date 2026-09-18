"use client";

import React, { useState, useEffect } from "react";
import { BacExperience } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import {
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Share2,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";

interface ExperienceCardProps {
  experience: BacExperience;
  userId?: string | null;
  onToast: (msg: string) => void;
}

const STREAM_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  sciences: {
    label: "علوم تجريبية",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  math: {
    label: "رياضيات",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  technique_math: {
    label: "تقني رياضي",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  gestion_economie: {
    label: "تسيير واقتصاد",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  lettres_philo: {
    label: "آداب وفلسفة",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
  langues_etrangeres: {
    label: "لغات أجنبية",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
};

export function ExperienceCard({ experience, userId, onToast }: ExperienceCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(experience.upvotes_count);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setUpvoted(ExperienceService.hasUserUpvoted(experience.id));
    setIsFavorite(ExperienceService.isFavorite(experience.id));
  }, [experience.id]);

  const handleUpvote = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await ExperienceService.toggleUpvote(experience.id, upvotesCount, userId);
      setUpvoted(res.upvoted);
      setUpvotesCount(res.count);
      if (res.upvoted) {
        onToast("👏 شكراً لتقديرك لهذه التجربة الملهمة!");
      }
    } catch {
      onToast("تعذر تسجيل الإعجاب حالياً");
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleFavorite = () => {
    const fav = ExperienceService.toggleFavorite(experience.id);
    setIsFavorite(fav);
    if (fav) {
      onToast("⭐ تم حفظ التجربة في قائمة مفضلتك للرجوع إليها!");
    } else {
      onToast("تمت إزالة التجربة من المفضلة");
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/experiences#${experience.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast("🔗 تم نسخ رابط التجربة بنجاح للمشاركة مع زملائك!");
    } catch {
      onToast("تعذر نسخ الرابط تلقائياً");
    }
  };

  const streamInfo = STREAM_CONFIG[experience.stream_id] || {
    label: experience.stream_id,
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
  };

  return (
    <div
      id={experience.id}
      className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/90 p-5 md:p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col justify-between"
    >
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-lg font-bold text-white shadow-inner">
              {experience.author_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base md:text-lg">
                  {experience.author_name}
                </h3>
                {experience.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20"
                    title="تجربة تم التحقق من صحتها وسلم علامتها"
                  >
                    <CheckCircle2 className="h-3 w-3 text-blue-400" />
                    موثق
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {/* Stream Badge */}
                <span
                  className={`inline-flex items-center rounded-lg px-2.5 py-0.5 font-medium border ${streamInfo.bg} ${streamInfo.text} ${streamInfo.border}`}
                >
                  <GraduationCap className="h-3 w-3 ml-1" />
                  {streamInfo.label}
                </span>

                {/* Role Badge */}
                {experience.author_role === "top_achiever" && (
                  <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-400 border border-emerald-500/20">
                    🏆 متفوق 16+
                  </span>
                )}
                {experience.author_role === "repeater_success" && (
                  <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-400 border border-amber-500/20">
                    🚀 قصة نجاح معيد
                  </span>
                )}
                {experience.author_role === "student" && (
                  <span className="inline-flex items-center rounded-lg bg-slate-800 px-2.5 py-0.5 font-semibold text-slate-400 border border-slate-700">
                    🎯 طالب بكالوريا
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grades & Target Major Badge */}
          <div className="flex flex-col items-end gap-1.5">
            {experience.final_grade && (
              <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1 border border-emerald-500/30 text-emerald-300 font-bold text-sm md:text-base shadow-sm">
                <span>المعدل:</span>
                <span className="font-extrabold text-white text-base md:text-lg">
                  {experience.final_grade.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400">/20</span>
              </div>
            )}

            {/* Progression for repeaters */}
            {experience.initial_grade && experience.final_grade && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <TrendingUp className="h-3 w-3" />
                <span>قفزة من {experience.initial_grade.toFixed(2)} إلى {experience.final_grade.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Target Major */}
        {experience.target_major && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 border border-slate-800">
            <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">الوجهة أو التخصص الجامعي:</span>
            <span className="font-bold text-emerald-300">{experience.target_major}</span>
          </div>
        )}

        {/* Danger Box: Biggest Trap (أكبر فخ) */}
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>⚠️ أكبر فخ نحذركم منه:</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200 pr-1 select-text">
            {experience.biggest_trap}
          </p>
        </div>

        {/* Success Box: Winning Routine (السر أو الروتين الحاسم) */}
        <div className="mt-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>💡 السر أو الروتين الذي صنع الفارق:</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200 pr-1 select-text">
            {experience.winning_routine}
          </p>
        </div>

        {/* Best Resources (المراجع والأساتذة الأكثر فائدة) */}
        {experience.best_resources && (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-1.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>📚 أفضل المراجع وقنوات المراجعة:</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 pr-1">
              {experience.best_resources}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3.5 text-xs">
        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          disabled={isLiking}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-bold transition-all ${
            upvoted
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105"
              : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          title="تصويت إيجابي لهذه النصيحة"
        >
          <ThumbsUp className={`h-4 w-4 ${upvoted ? "fill-slate-950" : ""}`} />
          <span>مفيدة جداً</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[11px] font-extrabold ${
              upvoted ? "bg-slate-900 text-emerald-300" : "bg-slate-900/60 text-slate-400"
            }`}
          >
            {upvotesCount}
          </span>
        </button>

        {/* Secondary Actions: Bookmark & Share */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium transition-colors ${
              isFavorite
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="حفظ في المفضلة"
          >
            {isFavorite ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">محفوظة</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">حفظ</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="نسخ رابط التجربة"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
