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
} from "lucide-react";

interface ExperienceCardProps {
  experience: BacExperience;
  userId?: string | null;
  userFirstName?: string;
  onToast: (msg: string) => void;
}

const STREAM_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  sciences: {
    label: "علوم تجريبية",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  math: {
    label: "رياضيات",
    bg: "bg-blue-50 text-blue-800 border-blue-200",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  technique_math: {
    label: "تقني رياضي",
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  gestion_economie: {
    label: "تسيير واقتصاد",
    bg: "bg-purple-50 text-purple-800 border-purple-200",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  lettres_philo: {
    label: "آداب وفلسفة",
    bg: "bg-rose-50 text-rose-800 border-rose-200",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  langues_etrangeres: {
    label: "لغات أجنبية",
    bg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    text: "text-cyan-800",
    border: "border-cyan-200",
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
  userFirstName,
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
  const [commentAuthorName, setCommentAuthorName] = useState(
    userFirstName || ""
  );
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Share & Image card state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showImageCardModal, setShowImageCardModal] = useState(false);

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
    try {
      const added = await ExperienceService.addComment(
        experience.id,
        newCommentText,
        commentAuthorName || userFirstName || "طالب",
        userId
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
    bg: "bg-slate-100 text-slate-800 border-slate-200",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  const formattedDate = formatArabicDate(experience.created_at);

  return (
    <>
      <div
        id={experience.id}
        className="group relative rounded-2xl border border-[#E4DED2] bg-white p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        {/* Top Header Row */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFEAE1] pb-4">
            <div className="flex items-start gap-3">
              {/* Avatar Initial */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-lg font-extrabold text-[#1E3A34] shadow-2xs">
                {experience.author_name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-[#26302F] text-base md:text-lg">
                    {experience.author_name}
                  </h3>
                  {experience.is_verified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200"
                      title="تجربة تم التحقق من صحتها ومراجعتها"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      موثقة
                    </span>
                  )}

                  {/* Date badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#768280] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EFEAE1]">
                    <Calendar className="h-3 w-3 text-[#A0AAA8]" />
                    {formattedDate}
                  </span>
                </div>

                {/* Candidate Track & Stream Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Stream */}
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-0.5 font-medium border ${streamInfo.bg}`}
                  >
                    <GraduationCap className="h-3 w-3 ml-1" />
                    {streamInfo.label}
                  </span>

                  {/* Candidate Track Badge */}
                  {experience.candidate_type === "current_student" ? (
                    <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-0.5 font-semibold text-sky-800 border border-sky-200">
                      🎯 مقبل على الباك 2027
                    </span>
                  ) : (
                    <>
                      {experience.passed_bac !== false && (
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                          🎓 اجتاز الباك بنجاح
                        </span>
                      )}
                      {experience.passed_bac === false && (
                        <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800 border border-amber-200">
                          💪 تجربة وتدارك للأخطاء
                        </span>
                      )}
                      {experience.retaking_bac && (
                        <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-0.5 font-semibold text-purple-800 border border-purple-200">
                          🔄 مترشح حر للتفوق
                        </span>
                      )}
                    </>
                  )}

                  {/* Legacy author_role fallback tags if present */}
                  {experience.author_role === "top_achiever" && !experience.candidate_type && (
                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                      🏆 متفوق 16+
                    </span>
                  )}
                  {experience.author_role === "repeater_success" && !experience.candidate_type && (
                    <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800 border border-amber-200">
                      🚀 قصة نجاح معيد
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GPA & University / Target Major */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {experience.final_grade && (
                <div className="flex items-center gap-1.5 rounded-xl bg-[#FAF8F5] px-3 py-1 border border-[#E4DED2] text-[#1E3A34] font-bold text-sm md:text-base shadow-2xs">
                  <span className="text-xs text-[#768280]">المعدل:</span>
                  <span className="font-black text-[#1E3A34] text-base md:text-lg">
                    {experience.final_grade.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#768280]">/20</span>
                </div>
              )}

              {experience.initial_grade && experience.final_grade && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
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
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#4A5553] border border-[#EFEAE1]">
              <Target className="h-3.5 w-3.5 text-[#5F8F86] shrink-0" />
              <span className="text-[#768280]">
                {experience.university_major ? "التخصص الجامعي الحالي:" : "الوجهة المستهدفة:"}
              </span>
              <span className="font-bold text-[#1E3A34]">
                {experience.university_major || experience.target_major}
              </span>
            </div>
          )}

          {/* Danger Box: Biggest Trap (أكبر فخ) - Soft Eye-comfort coral */}
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm mb-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>⚠️ أكبر فخ نحذركم منه:</span>
            </div>
            <p className="text-sm leading-relaxed text-[#26302F] pr-1 select-text">
              {experience.biggest_trap}
            </p>
          </div>

          {/* Success Box: Winning Routine (الروتين الحاسم) - Soft Eye-comfort emerald */}
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm mb-1.5">
              <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>💡 السر أو الروتين الذي صنع الفارق:</span>
            </div>
            <p className="text-sm leading-relaxed text-[#26302F] pr-1 select-text">
              {experience.winning_routine}
            </p>
          </div>

          {/* Best Resources (المراجع والأساتذة) */}
          {experience.best_resources && (
            <div className="mt-3 rounded-xl border border-[#E4DED2] bg-[#FAF8F5] p-3.5">
              <div className="flex items-center gap-2 text-[#3D5A54] font-bold text-xs mb-1">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#5F8F86]" />
                <span>📚 أفضل المراجع وقنوات المراجعة:</span>
              </div>
              <p className="text-xs leading-relaxed text-[#4A5553] pr-1">
                {experience.best_resources}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions: Upvote, Comments Count, Save, Share */}
        <div className="mt-5 border-t border-[#EFEAE1] pt-3.5">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            {/* Left side: Upvote + Comments button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvote}
                disabled={isLiking}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  upvoted
                    ? "bg-[#1E3A34] text-white shadow-xs scale-102"
                    : "bg-[#FAF8F5] text-[#26302F] border border-[#E4DED2] hover:bg-[#F3EDE0]"
                }`}
                title="تصويت إيجابي لهذه النصيحة"
              >
                <ThumbsUp className={`h-4 w-4 ${upvoted ? "fill-white text-white" : "text-[#5F8F86]"}`} />
                <span>مفيدة جداً</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] font-black ${
                    upvoted ? "bg-emerald-700 text-white" : "bg-white text-[#5F8F86] border border-[#E4DED2]"
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
                    ? "bg-slate-200 text-[#1E3A34]"
                    : "bg-[#FAF8F5] text-[#4A5553] border border-[#E4DED2] hover:bg-[#F3EDE0]"
                }`}
                title="عرض وإضافة تعليقات"
              >
                <MessageCircle className="h-4 w-4 text-[#5F8F86]" />
                <span>التعليقات</span>
                <span className="rounded-full bg-white px-1.5 py-0.2 text-[11px] font-bold text-[#1E3A34] border border-[#E4DED2]">
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
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "text-[#768280] hover:bg-[#FAF8F5] hover:text-[#26302F]"
                }`}
                title="حفظ في المفضلة"
              >
                {isFavorite ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-amber-600" />
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
                className="flex items-center gap-1 rounded-xl p-2 text-[#768280] hover:bg-[#FAF8F5] hover:text-[#1E3A34] transition-colors cursor-pointer border border-transparent hover:border-[#E4DED2]"
                title="مشاركة التجربة"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">مشاركة</span>
              </button>

              {/* Image Card Quick Trigger */}
              <button
                onClick={() => setShowImageCardModal(true)}
                className="flex items-center gap-1 rounded-xl p-2 text-[#5F8F86] hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer border border-[#E4DED2] bg-[#FAF8F5]"
                title="مشاركة التجربة كصورة للإنستغرام وتليغرام"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs font-semibold hidden md:inline">صورة</span>
              </button>
            </div>
          </div>

          {/* Share Dropdown / Popover Modal if expanded */}
          {showShareMenu && (
            <div className="mt-3 p-3 rounded-xl border border-[#E4DED2] bg-[#FAF8F5] animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-[#26302F]">اختر وسيلة المشاركة:</span>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-xs text-[#768280] hover:text-[#26302F]"
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
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white py-2 px-2.5 font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>منصة X</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white border border-[#E4DED2] text-[#26302F] py-2 px-2.5 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
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
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D7A66A] text-white py-2 px-2.5 font-bold hover:bg-[#c29358] transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>كصورة 🎨</span>
                </button>
              </div>
            </div>
          )}

          {/* Comments Accordion Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[#EFEAE1] space-y-3 animate-in fade-in duration-200">
              <h4 className="font-extrabold text-xs text-[#26302F] flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-[#5F8F86]" />
                <span>تعليقات واستفسارات الطلبة ({commentsCount})</span>
              </h4>

              {/* Comments List */}
              {loadingComments ? (
                <div className="py-4 text-center text-xs text-[#768280] flex items-center justify-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#5F8F86]" />
                  <span>جاري تحميل التعليقات...</span>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-[#768280] py-2">
                  لا توجد تعليقات بعد. كن أول من يترك انطباعاً أو استفساراً لصاحب التجربة! ✍️
                </p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1E3A34]">
                          {comment.author_name}
                        </span>
                        <span className="text-[10px] text-[#768280]">
                          {formatArabicDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-[#26302F] leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentAuthorName}
                    onChange={(e) => setCommentAuthorName(e.target.value)}
                    placeholder="اسمك الأول (للحفاظ على الخصوصية)"
                    className="w-1/3 rounded-lg border border-[#E4DED2] bg-white px-2.5 py-1.5 text-xs text-[#26302F] placeholder-[#A0AAA8] focus:border-[#5F8F86] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-[#768280]">
                    * لن يتم نشر اللقب العائلي
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="اكتب تعليقك أو سؤالك هنا..."
                    required
                    className="flex-1 rounded-lg border border-[#E4DED2] bg-white px-3 py-1.5 text-xs text-[#26302F] placeholder-[#A0AAA8] focus:border-[#5F8F86] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    className="flex items-center gap-1 rounded-lg bg-[#1E3A34] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2c4e46] disabled:opacity-50 transition-all cursor-pointer"
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
