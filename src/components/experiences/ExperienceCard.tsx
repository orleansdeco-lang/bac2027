"use client";

import React, { useState, useEffect } from "react";
import { BacExperience, ExperienceComment } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import { ExperienceImageCard } from "./ExperienceImageCard";
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
  MessageCircle,
  Calendar,
  Send,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  Edit2,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  BookMarked,
} from "lucide-react";

interface ExperienceCardProps {
  experience: BacExperience;
  userId?: string | null;
  userEmail?: string | null;
  userFirstName?: string;
  userWilaya?: string;
  isOperator?: boolean;
  onToast: (msg: string) => void;
}

const STREAM_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  sciences: {
    label: "علوم تجريبية",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  math: {
    label: "رياضيات",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  technique_math: {
    label: "تقني رياضي",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  gestion_economie: {
    label: "تسيير واقتصاد",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
  },
  lettres_philo: {
    label: "آداب وفلسفة",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
  },
  langues_etrangeres: {
    label: "لغات أجنبية",
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/30",
  },
};

function formatArabicDate(dateStr?: string): string {
  if (!dateStr) return "مؤخراً";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "مؤخراً";
    return new Intl.DateTimeFormat("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "مؤخراً";
  }
}

// Generate an inspiring title if not explicitly set
function getExperienceTitle(exp: BacExperience): string {
  if (exp.title && exp.title.trim()) return exp.title;
  if (exp.initial_grade && exp.final_grade) {
    return `من معدل ${exp.initial_grade.toFixed(2)} إلى ${exp.final_grade.toFixed(2)}: كيف قلبت المعادلة في البكالوريا؟`;
  }
  if (exp.final_grade && exp.final_grade >= 16) {
    return `طريقتي إلى معدل ${exp.final_grade.toFixed(2)}: الأسرار والروتين الحاسم لتفوق البكالوريا`;
  }
  if (exp.candidate_type === "current_student") {
    return `خطتي والتحديات التي أواجهها للوصول إلى الامتياز في بكالوريا 2027`;
  }
  return `تجربتي في البكالوريا: كيف تجاوزت الفخاخ وحققت أهدافي`;
}

export function ExperienceCard({
  experience,
  userId,
  userEmail,
  userFirstName,
  userWilaya,
  isOperator = false,
  onToast,
}: ExperienceCardProps) {
  // Expansion state: Start collapsed with Big Title & Name, click to reveal details!
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(experience.upvotes_count);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ExperienceComment[]>(
    experience.comments || []
  );
  const [commentsCount, setCommentsCount] = useState(
    experience.comments_count || experience.comments?.length || 0
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Inline comment editing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isSavingEditComment, setIsSavingEditComment] = useState(false);

  // Share & Image card state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showImageCardModal, setShowImageCardModal] = useState(false);

  const isPlatformOwner =
    userEmail === "azinox27@gmail.com" ||
    isOperator ||
    (typeof window !== "undefined" &&
      (Boolean(localStorage.getItem("ops_owner_bypass")) ||
        Boolean(localStorage.getItem("ops_auth_token"))));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const upvotedIds = ExperienceService.getUpvotedIds();
      setUpvoted(upvotedIds.includes(experience.id));
      setIsFavorite(ExperienceService.isFavorite(experience.id));
    }
  }, [experience.id]);

  const handleToggleComments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetched = await ExperienceService.getComments(experience.id);
        setComments(fetched);
        setCommentsCount(fetched.length);
      } catch {
        onToast("تعذر تحميل التعليقات");
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const added = await ExperienceService.addComment(
        experience.id,
        newCommentText.trim(),
        userFirstName || "طالب(ة) الشاطر",
        userId || null,
        userWilaya || null
      );

      if (added) {
        setComments((prev) => [...prev, added]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText("");
        onToast("💬 تم نشر تعليقك بنجاح!");
      } else {
        onToast("تعذر نشر التعليق حالياً");
      }
    } catch {
      onToast("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editCommentContent.trim() || isSavingEditComment) return;
    setIsSavingEditComment(true);
    try {
      const success = await ExperienceService.updateComment(
        experience.id,
        commentId,
        editCommentContent.trim(),
        userId || null,
        userEmail || null
      );
      if (success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, content: editCommentContent.trim(), updated_at: new Date().toISOString() }
              : c
          )
        );
        setEditingCommentId(null);
        setEditCommentContent("");
        onToast("✅ تم تعديل التعليق بنجاح");
      } else {
        onToast("فشل حفظ التعديل");
      }
    } catch {
      onToast("حدث خطأ أثناء تعديل التعليق");
    } finally {
      setIsSavingEditComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا التعليق؟")) return;
    try {
      const success = await ExperienceService.deleteComment(
        experience.id,
        commentId,
        userId || null,
        userEmail || null
      );
      if (success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
        onToast("🗑️ تم حذف التعليق بنجاح");
      } else {
        onToast("فشل حذف التعليق");
      }
    } catch {
      onToast("حدث خطأ أثناء حذف التعليق");
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await ExperienceService.toggleUpvote(
        experience.id,
        upvotesCount,
        userId
      );
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fav = ExperienceService.toggleFavorite(experience.id);
    setIsFavorite(fav);
    if (fav) {
      onToast("⭐ تم حفظ التجربة في مفضلتك للرجوع إليها!");
    } else {
      onToast("تمت إزالة التجربة من المفضلة");
    }
  };

  const shareSnippet =
    experience.winning_routine.length > 90
      ? `${experience.winning_routine.slice(0, 90)}...`
      : experience.winning_routine;

  const getShareUrl = () => {
    if (typeof window === "undefined") return "https://bac2027-three.vercel.app/experiences";
    return `${window.location.origin}/experiences#${experience.id}`;
  };

  const shareText = `🇩🇿 تجربة بكالوريا ملهمة بقلم ${experience.author_name}:\n"${experience.title || getExperienceTitle(experience)}"\n💡 ${shareSnippet}\n\nتصفح كامل التجربة في منصة الشاطر:\n${getShareUrl()}`;

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `تجربة ${experience.author_name} في البكالوريا | الشاطر`,
          text: shareText,
          url: url,
        });
        setShowShareMenu(false);
        onToast("🌟 تم فتح نافذة المشاركة بنجاح!");
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Native share error:", err);
        }
      }
    }
    setShowShareMenu(true);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    onToast("🔗 تم نسخ رابط التجربة بنجاح!");
    setShowShareMenu(false);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const streamInfo = STREAM_CONFIG[experience.stream_id] || {
    label: experience.stream_id,
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30",
  };

  const formattedDate = formatArabicDate(experience.created_at);
  const bigTitle = getExperienceTitle(experience);

  // Extract author name without bracketed wilaya for cleaner presentation
  const cleanAuthorName = experience.author_name.replace(/\(ولاية[^)]+\)/g, "").trim();

  return (
    <>
      <article
        id={experience.id}
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`group relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${
          isExpanded
            ? "bg-card border-[var(--color-primary)]/40 shadow-clay ring-2 ring-[var(--color-primary)]/10"
            : "bg-card hover:bg-card-hover border-theme shadow-clay hover:shadow-lg hover:border-[var(--color-primary)]/30"
        } p-5 sm:p-7 flex flex-col justify-between`}
      >
        {/* Subtle Top Indicator when expanded */}
        {isExpanded && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5E54] via-emerald-400 to-teal-500" />
        )}

        <div>
          {/* Top Metadata Row: Student Profile, Wilaya, Date, GPA */}
          <div className="flex items-start justify-between gap-3 border-b border-theme/60 pb-4">
            <div className="flex items-center gap-3">
              {/* Avatar Initial with Soft Editorial Gradient */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C5E54] to-[#1E3A34] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border border-white/20">
                {cleanAuthorName.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-950 dark:text-white text-base sm:text-lg font-sans">
                    {cleanAuthorName}
                  </h3>

                  {experience.is_verified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                      title="تجربة موثقة رسمياً"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>موثقة</span>
                    </span>
                  )}

                  {/* Wilaya badge */}
                  {experience.wilaya && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-theme">
                      <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{experience.wilaya}</span>
                    </span>
                  )}

                  {/* Date badge */}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-surface px-2.5 py-0.5 rounded-lg border border-theme">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                {/* Candidate Track & Stream Badges */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 font-bold border ${streamInfo.bg} ${streamInfo.text} ${streamInfo.border} text-xs`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{streamInfo.label}</span>
                  </span>

                  {/* Track Badge */}
                  {experience.candidate_type === "current_student" ? (
                    <span className="inline-flex items-center rounded-lg bg-sky-500/15 px-2.5 py-0.5 font-bold text-sky-800 dark:text-sky-200 border border-sky-500/30 text-xs">
                      🎯 مقبل على الباك 2027
                    </span>
                  ) : experience.initial_grade && experience.final_grade ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-800 dark:text-amber-200 border border-amber-500/30 text-xs">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>قصة نجاح وتدارك</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-lg bg-emerald-500/15 px-2.5 py-0.5 font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 text-xs">
                      🎓 خريج بكالوريا
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GPA Score Badge (Clean, High Contrast) */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {experience.final_grade && (
                <div className="flex items-center gap-1.5 rounded-2xl bg-[#2C5E54]/15 dark:bg-[#2C5E54]/30 px-3.5 py-1.5 border border-[#2C5E54]/40 text-[#1E3A34] dark:text-emerald-300 font-bold shadow-xs">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">المعدل:</span>
                  <span className="font-black text-base sm:text-xl font-mono text-[#2C5E54] dark:text-emerald-300">
                    {experience.final_grade.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">/20</span>
                </div>
              )}

              {experience.initial_grade && experience.final_grade && (
                <div className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>من {experience.initial_grade.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* BIG HEADLINE / TITLE (العنوان الكبير الذي طلبه المستخدم)            */}
          {/* ================================================================= */}
          <div className="mt-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black text-slate-900 dark:text-white group-hover:text-[#2C5E54] dark:group-hover:text-emerald-400 transition-colors leading-snug tracking-tight">
              {bigTitle}
            </h2>

            {/* Short Teaser / Quote before expansion */}
            {!isExpanded && (
              <div className="mt-2.5 space-y-2">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed font-semibold italic pr-2 border-r-3 border-[#2C5E54]">
                  &ldquo;{experience.winning_routine}&rdquo;
                </p>

                {/* Quick Indicators */}
                <div className="flex items-center gap-3 pt-2 text-xs text-slate-700 dark:text-slate-200 font-bold flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>قراءة: دقيقتان</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>فخ محذر منه</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>روتين التفوق</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* EXPANDED CONTENT AREA ("تضغط عليه يظهرولك المعلومات")             */}
          {/* ================================================================= */}
          {isExpanded && (
            <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300 border-t border-theme/60 pt-5">
              {/* Target / Current Major */}
              {(experience.university_major || experience.target_major) && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-surface px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-theme">
                  <Target className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                  <span className="text-slate-700 dark:text-slate-200 font-bold">
                    {experience.university_major ? "التخصص الجامعي الحالي:" : "الوجهة المستهدفة:"}
                  </span>
                  <span className="font-black text-[#2C5E54] dark:text-emerald-400 font-serif text-sm sm:text-base">
                    {experience.university_major || experience.target_major}
                  </span>
                </div>
              )}

              {/* Danger Box: The Biggest Trap (أكبر فخ) - High Contrast & Eye Comfort */}
              <div className="rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/30 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-rose-950 dark:text-rose-200 font-black text-sm sm:text-base mb-2 font-serif">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>⚠️ أكبر فخ نحذركم منه (إياك والوقوع فيه):</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-950 dark:text-rose-50 pr-1 select-text font-medium">
                  {experience.biggest_trap}
                </p>
              </div>

              {/* Success Box: Winning Routine (الروتين الحاسم) - High Contrast & Eye Comfort */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/30 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-black text-sm sm:text-base mb-2 font-serif">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>💡 السر أو الروتين اليومي الذي صنع الفارق:</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-950 dark:text-emerald-50 pr-1 select-text font-medium">
                  {experience.winning_routine}
                </p>
              </div>

              {/* Best Resources & Teachers (المراجع والأساتذة) */}
              {experience.best_resources && (
                <div className="rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/30 p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm mb-1.5 font-serif">
                    <BookOpen className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                    <span>📚 أفضل المراجع وقنوات المراجعة الموصى بها:</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-950 dark:text-amber-50 pr-1 font-medium">
                    {experience.best_resources}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Expand trigger button (when collapsed) OR Full Interactions Bar (when expanded) */}
        <div className="mt-5 border-t border-theme/60 pt-3.5">
          {!isExpanded ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black text-[#2C5E54] dark:text-emerald-400 inline-flex items-center gap-1.5 group-hover:translate-x-[-4px] transition-transform">
                <span>اضغط لقراءة التفاصيل الكاملة</span>
                <ChevronDown className="w-4 h-4" />
              </span>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 font-bold">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold">{upvotesCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-bold">{commentsCount}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Action Buttons Row */}
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                {/* Left side: Upvote + Comments toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpvote}
                    disabled={isLiking}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer ${
                      upvoted
                        ? "bg-[#2C5E54] text-white shadow-xs"
                        : "bg-surface hover:bg-card-hover text-theme-text border border-theme"
                    }`}
                    title="تصويت إيجابي لهذه النصيحة"
                  >
                    <ThumbsUp className={`h-4 w-4 ${upvoted ? "fill-white" : ""}`} />
                    <span>مفيدة جداً</span>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[11px] font-black">
                      {upvotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleComments}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-colors cursor-pointer border ${
                      showComments
                        ? "bg-surface border-theme text-slate-950 dark:text-white font-extrabold"
                        : "bg-surface-soft border-theme text-slate-800 dark:text-slate-200 hover:text-slate-950 font-bold"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>التعليقات ({commentsCount})</span>
                    {showComments ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Right side: Save, Share, Image Card, Collapse */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-2 font-bold transition-colors cursor-pointer border ${
                      isFavorite
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30"
                        : "bg-surface text-slate-800 dark:text-slate-200 hover:text-slate-950 border-theme"
                    }`}
                    title="حفظ في المفضلة"
                  >
                    {isFavorite ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span>محفوظة</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        <span>حفظ</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex items-center gap-1 rounded-xl px-2.5 py-2 bg-surface hover:bg-card-hover text-slate-800 dark:text-slate-200 hover:text-slate-950 border border-theme transition-colors cursor-pointer font-bold"
                    title="مشاركة التجربة"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>مشاركة</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowImageCardModal(true);
                    }}
                    className="flex items-center gap-1 rounded-xl px-2.5 py-2 bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-bold transition-colors cursor-pointer"
                    title="مشاركة التجربة كصورة أنيقة"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>صورة 🎨</span>
                  </button>

                  {/* Collapse Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="flex items-center gap-1 rounded-xl px-2.5 py-2 bg-surface text-slate-800 dark:text-slate-200 hover:text-slate-950 border border-theme transition-colors cursor-pointer font-bold"
                    title="طي التجربة"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>إغلاق</span>
                  </button>
                </div>
              </div>

              {/* Share Drawer */}
              {showShareMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-3.5 rounded-2xl border border-theme bg-surface animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-theme-text">اختر وسيلة المشاركة:</span>
                    <button
                      type="button"
                      onClick={() => setShowShareMenu(false)}
                      className="text-xs text-theme-muted hover:text-theme-text"
                    >
                      إغلاق ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white py-2 px-3 font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <span>واتساب</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareTelegram}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 text-white py-2 px-3 font-bold hover:bg-sky-600 transition-colors"
                    >
                      <span>تليغرام</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-card border border-theme text-theme-text py-2 px-3 font-bold hover:bg-card-hover transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>نسخ الرابط</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowShareMenu(false);
                        setShowImageCardModal(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 text-white py-2 px-3 font-bold hover:bg-amber-700 transition-colors"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>كصورة 🎨</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {showComments && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-4 border-t border-theme/60 space-y-3 animate-in fade-in duration-200"
                >
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>تعليقات واستفسارات الطلبة ({commentsCount})</span>
                  </h4>

                  {/* Comments List */}
                  {loadingComments ? (
                    <div className="py-4 text-center text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 font-semibold">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" />
                      <span>جاري تحميل التعليقات...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 py-2 font-medium">
                      لا توجد تعليقات بعد. كن أول من يترك انطباعاً أو استفساراً لصاحب التجربة! ✍️
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {comments.map((comment) => {
                        const isAuthor = Boolean(userId && comment.author_id && comment.author_id === userId);
                        const canManage = isAuthor || isPlatformOwner;
                        const isEditingThis = editingCommentId === comment.id;

                        return (
                          <div
                            key={comment.id}
                            className="rounded-2xl bg-surface border border-theme p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-950 dark:text-white text-xs sm:text-sm">
                                  {comment.author_name}
                                </span>

                                {comment.wilaya && (
                                  <span className="inline-flex items-center gap-0.5 text-xs text-slate-700 dark:text-slate-200 bg-card px-2 py-0.5 rounded border border-theme font-semibold">
                                    <MapPin className="h-2.5 w-2.5 text-amber-500" />
                                    <span>{comment.wilaya}</span>
                                  </span>
                                )}

                                {isAuthor && (
                                  <span className="text-xs bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                                    أنت
                                  </span>
                                )}
                              </div>

                              {canManage && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditCommentContent(comment.content);
                                    }}
                                    className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditingThis ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  className="w-full rounded-xl bg-card border border-theme p-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-medium"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-1 text-[11px] rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 font-bold"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditComment(comment.id)}
                                    disabled={isSavingEditComment}
                                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[var(--color-primary)] text-white font-bold"
                                  >
                                    حفظ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed font-medium select-text">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Comment Form */}
                  <form onSubmit={handleAddComment} className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="اطرح سؤالاً أو اترك كلمة تشجيعية..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 rounded-xl bg-surface border border-theme px-3.5 py-2 text-xs sm:text-sm text-slate-950 dark:text-white placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <button
                        type="submit"
                        disabled={!newCommentText.trim() || isSubmittingComment}
                        className="rounded-xl bg-[#2C5E54] hover:bg-[#20473f] text-white px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="h-3 w-3" />
                        <span>إرسال</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Image Card Modal */}
      {showImageCardModal && (
        <ExperienceImageCard
          experience={experience}
          isOpen={showImageCardModal}
          onClose={() => setShowImageCardModal(false)}
        />
      )}
    </>
  );
}
