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

export function ExperienceCard({
  experience,
  userId,
  userEmail,
  userFirstName,
  userWilaya,
  isOperator = false,
  onToast,
}: ExperienceCardProps) {
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
    setUpvoted(ExperienceService.hasUserUpvoted(experience.id));
    setIsFavorite(ExperienceService.isFavorite(experience.id));
  }, [experience.id]);

  // Load comments when accordion expands
  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetched = await ExperienceService.getComments(experience.id);
        setComments(fetched);
        setCommentsCount(fetched.length);
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    const authorName = userFirstName || "طالب شاطر";

    try {
      const added = await ExperienceService.addComment(
        experience.id,
        newCommentText,
        authorName,
        userId,
        userWilaya || null
      );
      setComments((prev) => [...prev, added]);
      setCommentsCount((prev) => prev + 1);
      setNewCommentText("");
      onToast("💬 تم إضافة تعليقك بنجاح!");
    } catch {
      onToast("تعذر إضافة التعليق حالياً، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEditComment = (comment: ExperienceComment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    setIsSavingEditComment(true);

    try {
      const success = await ExperienceService.updateComment(
        experience.id,
        commentId,
        editCommentContent,
        userId,
        userEmail
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
        onToast("✏️ تم تحديث التعليق بنجاح");
      } else {
        onToast("فشل تحديث التعليق");
      }
    } catch {
      onToast("حدث خطأ أثناء تعديل التعليق");
    } finally {
      setIsSavingEditComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    try {
      const success = await ExperienceService.deleteComment(
        experience.id,
        commentId,
        userId,
        userEmail
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

  const handleUpvote = async () => {
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

  const handleToggleFavorite = () => {
    const fav = ExperienceService.toggleFavorite(experience.id);
    setIsFavorite(fav);
    if (fav) {
      onToast("⭐ تم حفظ التجربة في قائمة مفضلتك للرجوع إليها!");
    } else {
      onToast("تمت إزالة التجربة من المفضلة");
    }
  };

  // Viral share message text
  const shareSnippet =
    experience.winning_routine.length > 90
      ? `${experience.winning_routine.slice(0, 90)}...`
      : experience.winning_routine;

  const getShareUrl = () => {
    if (typeof window === "undefined") return "https://bac2027-three.vercel.app/experiences";
    return `${window.location.origin}/experiences#${experience.id}`;
  };

  const shareText = `🇩🇿 نصيحة وتجربة بكالوريا حقيقية بقلم ${experience.author_name}:\n"💡 ${shareSnippet}"\n\nتصفح المزيد من النصائح وتجارب المتفوقين في منصة الشاطر:\n${getShareUrl()}`;

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `تجربة ${experience.author_name} في البكالوريا | الشاطر`,
          text: `🇩🇿 نصيحة ذهبية في البكالوريا بقلم ${experience.author_name}:\n"${shareSnippet}"`,
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
    // Fallback: open share menu
    setShowShareMenu(true);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      onToast("🔗 تم نسخ رابط التجربة بنجاح للمشاركة مع زملائك!");
      setShowShareMenu(false);
    } catch {
      onToast("تعذر نسخ الرابط تلقائياً");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(
      `🇩🇿 تجربة ملهمة في البكالوريا بقلم ${experience.author_name}:\n"${shareSnippet}"`
    );
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `🇩🇿 تجربة ملهمة في البكالوريا بقلم ${experience.author_name}:\n"${shareSnippet}"\n\n`
    );
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    setShowShareMenu(false);
  };

  const streamInfo = STREAM_CONFIG[experience.stream_id] || {
    label: experience.stream_id,
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
  };

  const formattedDate = formatArabicDate(experience.created_at);

  return (
    <>
      <div
        id={experience.id}
        className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/90 p-5 md:p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col justify-between"
      >
        {/* Top Header Row */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 pb-4">
            <div className="flex items-start gap-3">
              {/* Avatar Initial */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-lg font-bold text-white shadow-inner">
                {experience.author_name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-100 text-base md:text-lg">
                    {experience.author_name}
                  </h3>
                  {experience.is_verified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20"
                      title="تجربة تم التحقق من صحتها وسلم علامتها"
                    >
                      <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      موثقة
                    </span>
                  )}

                  {/* Wilaya badge if present */}
                  {experience.wilaya && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60">
                      <MapPin className="h-3 w-3 text-[#D7A66A]" />
                      <span>{experience.wilaya}</span>
                    </span>
                  )}

                  {/* Date badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formattedDate}
                  </span>
                </div>

                {/* Candidate Track & Stream Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Stream */}
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-0.5 font-medium border ${streamInfo.bg} ${streamInfo.text} ${streamInfo.border}`}
                  >
                    <GraduationCap className="h-3 w-3 ml-1" />
                    {streamInfo.label}
                  </span>

                  {/* Candidate Track Badge */}
                  {experience.candidate_type === "current_student" ? (
                    <span className="inline-flex items-center rounded-lg bg-sky-500/10 px-2.5 py-0.5 font-semibold text-sky-400 border border-sky-500/20">
                      🎯 مقبل على الباك 2027
                    </span>
                  ) : (
                    <>
                      {experience.passed_bac !== false && (
                        <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-400 border border-emerald-500/20">
                          🎓 اجتاز الباك بنجاح
                        </span>
                      )}
                      {experience.passed_bac === false && (
                        <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-400 border border-amber-500/20">
                          💪 تجربة وتدارك للأخطاء
                        </span>
                      )}
                      {experience.retaking_bac && (
                        <span className="inline-flex items-center rounded-lg bg-purple-500/10 px-2.5 py-0.5 font-semibold text-purple-400 border border-purple-500/20">
                          🔄 مترشح حر للتفوق
                        </span>
                      )}
                    </>
                  )}

                  {/* Legacy author_role fallback tags */}
                  {experience.author_role === "top_achiever" && !experience.candidate_type && (
                    <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-400 border border-emerald-500/20">
                      🏆 متفوق 16+
                    </span>
                  )}
                  {experience.author_role === "repeater_success" && !experience.candidate_type && (
                    <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-400 border border-amber-500/20">
                      🚀 قصة نجاح معيد
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GPA & University / Target Major */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {experience.final_grade && (
                <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1 border border-emerald-500/30 text-emerald-300 font-bold text-sm md:text-base shadow-sm">
                  <span className="text-xs text-slate-400">المعدل:</span>
                  <span className="font-extrabold text-white text-base md:text-lg">
                    {experience.final_grade.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-400">/20</span>
                </div>
              )}

              {experience.initial_grade && experience.final_grade && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    من {experience.initial_grade.toFixed(2)} إلى {experience.final_grade.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* University Major or Target Destination */}
          {(experience.university_major || experience.target_major) && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 border border-slate-800">
              <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">
                {experience.university_major ? "التخصص الجامعي الحالي:" : "الوجهة المستهدفة:"}
              </span>
              <span className="font-bold text-emerald-300">
                {experience.university_major || experience.target_major}
              </span>
            </div>
          )}

          {/* Danger Box: Biggest Trap (أكبر فخ) - Sleek Dark High-Contrast */}
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>⚠️ أكبر فخ نحذركم منه:</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200 pr-1 select-text">
              {experience.biggest_trap}
            </p>
          </div>

          {/* Success Box: Winning Routine (الروتين الحاسم) - Sleek Dark High-Contrast */}
          <div className="mt-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <Lightbulb className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>💡 السر أو الروتين الذي صنع الفارق:</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200 pr-1 select-text">
              {experience.winning_routine}
            </p>
          </div>

          {/* Best Resources (المراجع والأساتذة) */}
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

        {/* Footer Actions: Upvote, Comments Count, Save, Share */}
        <div className="mt-5 border-t border-slate-800/80 pt-3.5">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            {/* Left side: Upvote + Comments button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvote}
                disabled={isLiking}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  upvoted
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-102"
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

              {/* Comments Toggle Button */}
              <button
                onClick={handleToggleComments}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  showComments
                    ? "bg-slate-800 text-white"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title="عرض وإضافة تعليقات"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>التعليقات</span>
                <span className="rounded-full bg-slate-900/80 px-1.5 py-0.2 text-[11px] font-bold text-slate-300 border border-slate-700">
                  {commentsCount}
                </span>
                {showComments ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Right side: Favorite & Share */}
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium transition-colors cursor-pointer ${
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

              {/* Share Trigger Button */}
              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="مشاركة التجربة"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">مشاركة</span>
              </button>

              {/* Image Card Quick Trigger */}
              <button
                onClick={() => setShowImageCardModal(true)}
                className="flex items-center gap-1 rounded-xl p-2 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors cursor-pointer border border-amber-500/20 bg-slate-800/60"
                title="مشاركة التجربة كصورة للإنستغرام وتليغرام"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs font-semibold hidden md:inline">صورة 🎨</span>
              </button>
            </div>
          </div>

          {/* Share Dropdown / Popover Modal if expanded */}
          {showShareMenu && (
            <div className="mt-3 p-3 rounded-xl border border-slate-800 bg-slate-950 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-200">اختر وسيلة المشاركة:</span>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white py-2 px-2.5 font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <span>واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 text-white py-2 px-2.5 font-bold hover:bg-sky-600 transition-colors cursor-pointer"
                >
                  <span>تليغرام</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-white py-2 px-2.5 font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <span>فيسبوك</span>
                </button>

                {/* X */}
                <button
                  onClick={handleShareX}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 text-white py-2 px-2.5 font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span>منصة X</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 py-2 px-2.5 font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>نسخ الرابط</span>
                </button>

                {/* Image Card Generator */}
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    setShowImageCardModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2 px-2.5 font-bold hover:brightness-110 transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>كصورة 🎨</span>
                </button>
              </div>
            </div>
          )}

          {/* Comments Accordion Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
              <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>تعليقات واستفسارات الطلبة ({commentsCount})</span>
              </h4>

              {/* Comments List */}
              {loadingComments ? (
                <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>جاري تحميل التعليقات...</span>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
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
                        className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-3 text-xs space-y-1.5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-200">
                              {comment.author_name}
                            </span>

                            {/* Commenter Wilaya */}
                            {comment.wilaya && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                <MapPin className="h-2.5 w-2.5 text-[#D7A66A]" />
                                <span>{comment.wilaya}</span>
                              </span>
                            )}

                            {isAuthor && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold">
                                أنت
                              </span>
                            )}

                            {isPlatformOwner && !isAuthor && (
                              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/20 font-semibold inline-flex items-center gap-0.5">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                إشراف
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">
                              {formatArabicDate(comment.created_at)}
                              {comment.updated_at && " (معدل)"}
                            </span>

                            {/* Edit & Delete Buttons for Author or Owner */}
                            {canManage && !isEditingThis && (
                              <div className="flex items-center gap-1 mr-1">
                                <button
                                  onClick={() => handleStartEditComment(comment)}
                                  className="text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                                  title="تعديل التعليق"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                                  title="حذف التعليق"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comment text or Edit Box */}
                        {isEditingThis ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full rounded-lg border border-indigo-500/40 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                disabled={isSavingEditComment || !editCommentContent.trim()}
                                onClick={() => handleSaveEditComment(comment.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 font-bold text-white hover:bg-emerald-500 text-[11px] flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>{isSavingEditComment ? "..." : "حفظ التعديل"}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment Form: Locked user identity without surname notice */}
              <form onSubmit={handleAddComment} className="mt-3 space-y-2 pt-2 border-t border-slate-800/60">
                {/* Author Display Badge (Strictly first name, non-editable, + Wilaya) */}
                <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <span>التعليق باسم:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {userFirstName || "طالب"}
                  </span>
                  {userWilaya && (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      <MapPin className="h-3 w-3 text-[#D7A66A]" />
                      <span>{userWilaya}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="اكتب تعليقك أو سؤالك هنا..."
                    required
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isSubmittingComment ? "..." : "إرسال"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Social Image Card Modal */}
      <ExperienceImageCard
        experience={experience}
        isOpen={showImageCardModal}
        onClose={() => setShowImageCardModal(false)}
      />
    </>
  );
}
