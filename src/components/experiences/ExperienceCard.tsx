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
    bg: "bg-emerald-50",
    text: "text-emerald-950 font-black",
    border: "border-emerald-300",
  },
  math: {
    label: "رياضيات",
    bg: "bg-blue-50",
    text: "text-blue-950 font-black",
    border: "border-blue-300",
  },
  technique_math: {
    label: "تقني رياضي",
    bg: "bg-amber-50",
    text: "text-amber-950 font-black",
    border: "border-amber-300",
  },
  gestion_economie: {
    label: "تسيير واقتصاد",
    bg: "bg-purple-50",
    text: "text-purple-950 font-black",
    border: "border-purple-300",
  },
  lettres_philo: {
    label: "آداب وفلسفة",
    bg: "bg-rose-50",
    text: "text-rose-950 font-black",
    border: "border-rose-300",
  },
  langues_etrangeres: {
    label: "لغات أجنبية",
    bg: "bg-cyan-50",
    text: "text-cyan-950 font-black",
    border: "border-cyan-300",
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
    bg: "bg-slate-100",
    text: "text-black font-black",
    border: "border-slate-300",
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
        className={`group relative rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
          isExpanded
            ? "bg-white border-[#2C5E54] shadow-xl ring-2 ring-[#2C5E54]/15"
            : "bg-white hover:bg-slate-50 border-slate-200 shadow-md hover:shadow-lg hover:border-[#2C5E54]/40"
        } p-5 sm:p-7 flex flex-col justify-between`}
      >
        {/* Subtle Top Indicator when expanded */}
        {isExpanded && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5E54] via-emerald-400 to-teal-500" />
        )}

        <div>
          {/* Top Metadata Row: Student Profile, Wilaya, Date, GPA */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              {/* Avatar Initial with Soft Editorial Gradient */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C5E54] to-[#1E3A34] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border border-white/20">
                {cleanAuthorName.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-black text-lg sm:text-xl font-sans">
                    {cleanAuthorName}
                  </h3>

                  {experience.is_verified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-950 border border-emerald-300"
                      title="تجربة موثقة رسمياً"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      <span>موثقة</span>
                    </span>
                  )}

                  {/* Wilaya badge */}
                  {experience.wilaya && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-black border border-slate-300">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span>{experience.wilaya}</span>
                    </span>
                  )}

                  {/* Date badge */}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
                    <Calendar className="h-4 w-4 text-slate-700" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                {/* Candidate Track & Stream Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-black border ${streamInfo.bg} ${streamInfo.text} ${streamInfo.border} text-xs sm:text-sm`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>{streamInfo.label}</span>
                  </span>

                  {/* Track Badge */}
                  {experience.candidate_type === "current_student" ? (
                    <span className="inline-flex items-center rounded-lg bg-sky-100 px-3 py-1 font-black text-sky-950 border border-sky-300 text-xs sm:text-sm">
                      🎯 مقبل على الباك 2027
                    </span>
                  ) : experience.initial_grade && experience.final_grade ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1 font-black text-amber-950 border border-amber-300 text-xs sm:text-sm">
                      <TrendingUp className="h-4 w-4 text-amber-800" />
                      <span>قصة نجاح وتدارك</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1 font-black text-emerald-950 border border-emerald-300 text-xs sm:text-sm">
                      🎓 خريج بكالوريا
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GPA Score Badge (Clean, Solid Black & High Contrast) */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {experience.final_grade && (
                <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3.5 py-1.5 border-2 border-emerald-300 text-black font-black shadow-xs">
                  <span className="text-xs text-black font-bold">المعدل:</span>
                  <span className="font-black text-lg sm:text-2xl font-mono text-[#2C5E54]">
                    {experience.final_grade.toFixed(2)}
                  </span>
                  <span className="text-xs text-black font-bold">/20</span>
                </div>
              )}

              {experience.initial_grade && experience.final_grade && (
                <div className="text-xs font-black text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>من {experience.initial_grade.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* BIG HEADLINE / TITLE (العنوان الكبير الواضح بحجم بارز)            */}
          {/* ================================================================= */}
          <div className="mt-5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-black group-hover:text-[#2C5E54] transition-colors leading-snug tracking-tight">
              {bigTitle}
            </h2>

            {/* Short Teaser / Quote before expansion - comfortable large font */}
            {!isExpanded && (
              <div className="mt-3 space-y-3">
                <p className="text-base sm:text-lg text-black leading-relaxed font-bold italic pr-3 border-r-4 border-[#2C5E54]">
                  &ldquo;{experience.winning_routine}&rdquo;
                </p>

                {/* Quick Indicators */}
                <div className="flex items-center gap-3 pt-2 text-xs sm:text-sm text-black font-bold flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>قراءة: دقيقتان</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-rose-900 font-black">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>فخ محذر منه</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-900 font-black">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
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
            <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300 border-t-2 border-slate-200 pt-5">
              {/* Target / Current Major */}
              {(experience.university_major || experience.target_major) && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-black border-2 border-slate-200">
                  <Target className="h-5 w-5 text-[#2C5E54] shrink-0" />
                  <span className="text-black font-bold">
                    {experience.university_major ? "التخصص الجامعي الحالي:" : "الوجهة المستهدفة:"}
                  </span>
                  <span className="font-black text-[#2C5E54] font-serif text-base sm:text-lg">
                    {experience.university_major || experience.target_major}
                  </span>
                </div>
              )}

              {/* Danger Box: The Biggest Trap (أكبر فخ) - High Contrast & Large Easy-to-Read Font */}
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2.5 text-rose-950 font-black text-base sm:text-lg mb-2.5 font-serif">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                  <span>⚠️ أكبر فخ نحذركم منه (إياك والوقوع فيه):</span>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-black pr-1 select-text font-semibold">
                  {experience.biggest_trap}
                </p>
              </div>

              {/* Success Box: Winning Routine (الروتين الحاسم) - High Contrast & Large Easy-to-Read Font */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2.5 text-emerald-950 font-black text-base sm:text-lg mb-2.5 font-serif">
                  <Lightbulb className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>💡 السر أو الروتين اليومي الذي صنع الفارق:</span>
                </div>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-black pr-1 select-text font-semibold">
                  {experience.winning_routine}
                </p>
              </div>

              {/* Best Resources & Teachers (المراجع والأساتذة) */}
              {experience.best_resources && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2.5 text-amber-950 font-black text-base sm:text-lg mb-2 font-serif">
                    <BookOpen className="h-5 w-5 shrink-0 text-amber-700" />
                    <span>📚 أفضل المراجع وقنوات المراجعة الموصى بها:</span>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed text-black pr-1 select-text font-semibold">
                    {experience.best_resources}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Expand trigger button (when collapsed) OR Full Interactions Bar (when expanded) */}
        <div className="mt-5 border-t-2 border-slate-200 pt-3.5">
          {!isExpanded ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-[#2C5E54] inline-flex items-center gap-1.5 group-hover:translate-x-[-4px] transition-transform">
                <span>اضغط لقراءة التفاصيل الكاملة</span>
                <ChevronDown className="w-4 h-4" />
              </span>

              <div className="flex items-center gap-3 text-sm text-black font-black">
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <ThumbsUp className="w-4 h-4 text-emerald-700" />
                  <span className="font-black">{upvotesCount}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <MessageCircle className="w-4 h-4 text-blue-700" />
                  <span className="font-black">{commentsCount}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Action Buttons Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
                {/* Left side: Upvote + Comments toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpvote}
                    disabled={isLiking}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black transition-all cursor-pointer ${
                      upvoted
                        ? "bg-[#2C5E54] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300"
                    }`}
                    title="تصويت إيجابي لهذه النصيحة"
                  >
                    <ThumbsUp className={`h-4 w-4 ${upvoted ? "fill-white" : ""}`} />
                    <span>مفيدة جداً</span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-black">
                      {upvotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleComments}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black transition-colors cursor-pointer border ${
                      showComments
                        ? "bg-[#2C5E54] text-white border-[#2C5E54]"
                        : "bg-slate-100 border-slate-300 text-black hover:bg-slate-200"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>التعليقات ({commentsCount})</span>
                    {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Right side: Save, Share, Image Card, Collapse */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-black transition-colors cursor-pointer border ${
                      isFavorite
                        ? "bg-amber-100 text-amber-950 border-amber-300"
                        : "bg-slate-100 text-black hover:bg-slate-200 border-slate-300"
                    }`}
                    title="حفظ في المفضلة"
                  >
                    {isFavorite ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-amber-700" />
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
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 transition-colors cursor-pointer font-black"
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
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 bg-amber-100 text-amber-950 border border-amber-300 font-black transition-colors cursor-pointer"
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
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 bg-slate-100 text-black hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer font-black"
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
                  className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs text-black">اختر وسيلة المشاركة:</span>
                    <button
                      type="button"
                      onClick={() => setShowShareMenu(false)}
                      className="text-xs text-black hover:text-slate-700 font-bold"
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
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-300 text-black py-2 px-3 font-bold hover:bg-slate-100 transition-colors"
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
                  className="pt-4 border-t-2 border-slate-200 space-y-3 animate-in fade-in duration-200"
                >
                  <h4 className="font-black text-sm sm:text-base text-black flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#2C5E54]" />
                    <span>تعليقات واستفسارات الطلبة ({commentsCount})</span>
                  </h4>

                  {/* Comments List */}
                  {loadingComments ? (
                    <div className="py-4 text-center text-sm text-black flex items-center justify-center gap-2 font-bold">
                      <RefreshCw className="h-4 w-4 animate-spin text-[#2C5E54]" />
                      <span>جاري تحميل التعليقات...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-black py-2 font-semibold">
                      لا توجد تعليقات بعد. كن أول من يترك انطباعاً أو استفساراً لصاحب التجربة! ✍️
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {comments.map((comment) => {
                        const isAuthor = Boolean(userId && comment.author_id && comment.author_id === userId);
                        const canManage = isAuthor || isPlatformOwner;
                        const isEditingThis = editingCommentId === comment.id;

                        return (
                          <div
                            key={comment.id}
                            className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-3.5 text-sm space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-black text-sm sm:text-base">
                                  {comment.author_name}
                                </span>

                                {comment.wilaya && (
                                  <span className="inline-flex items-center gap-1 text-xs text-black bg-white px-2.5 py-0.5 rounded-md border border-slate-300 font-bold">
                                    <MapPin className="h-3 w-3 text-amber-500" />
                                    <span>{comment.wilaya}</span>
                                  </span>
                                )}

                                {isAuthor && (
                                  <span className="text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 font-black">
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
                                    className="p-1 text-slate-700 hover:text-black transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 text-rose-600 hover:text-rose-800 transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditingThis ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  className="w-full rounded-xl bg-white border-2 border-slate-300 p-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2C5E54] font-semibold"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-3 py-1.5 text-xs rounded-lg text-black hover:bg-slate-200 font-bold"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditComment(comment.id)}
                                    disabled={isSavingEditComment}
                                    className="px-3.5 py-1.5 text-xs rounded-lg bg-[#2C5E54] text-white font-bold"
                                  >
                                    حفظ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-black text-sm sm:text-base leading-relaxed font-semibold select-text">
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
                        className="flex-1 rounded-xl bg-white border-2 border-slate-300 px-4 py-2.5 text-sm text-black placeholder:text-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E54]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="rounded-xl bg-[#2C5E54] hover:bg-[#1E3A34] text-white px-5 py-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingComment ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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
