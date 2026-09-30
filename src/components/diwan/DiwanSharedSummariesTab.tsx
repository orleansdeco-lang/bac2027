"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CampusPost, CampusPostType, CampusPostAttachment } from "@/types/campus";
import { CampusService } from "@/lib/campus/campus-service";
import { useAuth } from "@/lib/auth/context";
import { StreamId, SubjectId } from "@/types/education";
import {
  FileText,
  Search,
  PlusCircle,
  Heart,
  Bookmark,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Filter,
  Share2,
  Check,
  Tag,
  GraduationCap,
  Layers,
  ChevronDown,
  X,
  FileUp,
  Image as ImageIcon,
  PenTool,
  Download,
  Eye,
  Maximize2,
  Trash2,
  ExternalLink,
  Copy,
  Zap,
  Award,
  Calendar,
} from "lucide-react";
import { formatStudentPrivacyName } from "@/lib/constants/majlis-config";
import {
  BAC_EXAM_DAY_RULES,
  SCIENCE_TOPIC_SELECTION_GUIDE,
  HISTORY_GEO_METHODOLOGY_GUIDE,
  REVOLUTION_DATES_CHRONOLOGY,
} from "@/data/bac-essentials-2027";

const STREAMS_LIST: { id: string; label: string }[] = [
  { id: "ALL", label: "جميع الشعب" },
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "langues", label: "لغات أجنبية" },
];

const SUBJECTS_LIST: { id: string; label: string }[] = [
  { id: "accounting_finance", label: "تسيير محاسبي ومالي" },
  { id: "economics", label: "اقتصاد ومناجمنت" },
  { id: "law", label: "قانون" },
  { id: "math", label: "رياضيات" },
  { id: "physics", label: "فيزياء" },
  { id: "natural_sciences", label: "علوم طبيعية" },
  { id: "philosophy", label: "فلسفة" },
  { id: "arabic", label: "لغة عربية" },
  { id: "history_geography", label: "تاريخ وجغرافيا" },
  { id: "islamic_studies", label: "علوم إسلامية" },
  { id: "french", label: "لغة فرنسية" },
  { id: "english", label: "لغة إنجليزية" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DiwanSharedSummariesTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [selectedType, setSelectedType] = useState<"ALL" | "SUMMARY" | "TRICKY_EXAM_PROBLEM">("ALL");
  const [selectedStream, setSelectedStream] = useState<string>("ALL");
  const [selectedFormat, setSelectedFormat] = useState<"ALL" | "PDF" | "IMAGE" | "TEXT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Viewer Modals state
  const [activeViewingPdf, setActiveViewingPdf] = useState<{ url: string; title: string; fileName?: string } | null>(null);
  const [activeViewingImage, setActiveViewingImage] = useState<{ url: string; label: string } | null>(null);
  const [activeOfficialDoc, setActiveOfficialDoc] = useState<"EXAM_SCIENCE" | "HIST_GEO_RUBRIC" | "REVOLUTION_CHRONOLOGY" | null>(null);

  const handleCopyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`تم نسخ ${label} بنجاح إلى الحافظة! 📋`);
    }
  };

  // New post draft state
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<CampusPostType>("SUMMARY");
  const [draftStream, setDraftStream] = useState<StreamId>("gestion_eco");
  const [draftSubject, setDraftSubject] = useState<SubjectId>("accounting_finance");
  const [draftLesson, setDraftLesson] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"PDF" | "IMAGE" | "TEXT">("PDF");

  // Attachment drafts
  const [draftPdf, setDraftPdf] = useState<{ name: string; size: string; url: string; pageCount?: number } | null>(null);
  const [draftImages, setDraftImages] = useState<{ name: string; url: string }[]>([]);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load posts from API with fallback
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/campus/posts?t=" + Date.now(), {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch campus posts from API:", err);
    }
    // Fallback only if offline/network error
    const localPosts = CampusService.getPosts();
    setPosts(localPosts);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts strictly for summaries and tricky problems
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Must be summary or tricky problem
      const isSummaryOrTricky = post.type === "SUMMARY" || post.type === "TRICKY_EXAM_PROBLEM";
      if (!isSummaryOrTricky) return false;

      // Filter by type
      if (selectedType !== "ALL" && post.type !== selectedType) return false;

      // Filter by stream
      if (selectedStream !== "ALL" && post.stream !== "ALL" && post.stream !== selectedStream) {
        return false;
      }

      // Filter by format
      if (selectedFormat === "PDF") {
        const hasPdf = post.attachments?.some((a) => a.type === "pdf");
        if (!hasPdf) return false;
      } else if (selectedFormat === "IMAGE") {
        const hasImg = post.attachments?.some((a) => a.type === "image");
        if (!hasImg) return false;
      } else if (selectedFormat === "TEXT") {
        const hasAttachments = post.attachments && post.attachments.length > 0;
        if (hasAttachments && (!post.content || post.content.length < 50)) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (post.title || "").toLowerCase().includes(q);
        const matchContent = (post.content || "").toLowerCase().includes(q);
        const matchLesson = (post.lesson || "").toLowerCase().includes(q);
        const matchTags = Array.isArray(post.tags) && post.tags.some((t) => (t || "").toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchLesson && !matchTags) return false;
      }

      return true;
    });
  }, [posts, selectedType, selectedStream, selectedFormat, searchQuery]);

  const handleLike = async (postId: string) => {
    if (!user) {
      showToast("يرجى تسجيل الدخول للإعجاب بالملخص 🏛️");
      return;
    }

    try {
      const res = await fetch(`/api/campus/posts/${encodeURIComponent(postId)}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likesCount: data.likesCount, isLiked: data.isLiked } : p
            )
          );
          return;
        }
      }
    } catch (err) {
      console.warn("API like error, falling back locally:", err);
    }

    const fallbackRes = CampusService.toggleLikePost(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: fallbackRes.likesCount, isLiked: fallbackRes.isLiked } : p))
    );
  };

  const handleBookmark = async (post: CampusPost) => {
    const userId = user?.id || "guest-student";
    const res = await CampusService.bookmarkPostToPlanner(userId, post);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, isBookmarked: res.isBookmarked, bookmarksCount: p.bookmarksCount + (res.isBookmarked ? 1 : -1) }
            : p
        )
      );
      if (res.isBookmarked) {
        showToast("تم حفظ الملخص وجدولة جلسة مراجعة في مخططك الدراسي اليومي! 📅");
      } else {
        showToast("تمت إزالة العنصر من حقيبة المراجعة");
      }
    }
  };

  const handleSharePost = (post: CampusPost) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/diwan?tab=summaries&postId=${post.id}`;
      navigator.clipboard.writeText(url);
      setCopiedPostId(post.id);
      showToast("تم نسخ رابط الملخص للمشاركة مع الزملاء! 🔗");
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  // PDF File Upload Handler
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast("حجم الملف يتجاوز الحد المسموح (25 ميغابايت) ⚠️");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDraftPdf({
        name: file.name,
        size: formatBytes(file.size),
        url: dataUrl,
      });
      showToast(`تم إرفاق ملف PDF بنجاح: ${file.name} 📄`);
    };
    reader.readAsDataURL(file);
  };

  // Image Upload Handler
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        showToast(`الصورة ${file.name} تتجاوز 15 ميغابايت ⚠️`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setDraftImages((prev) => [...prev, { name: file.name, url: dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
    showToast(`تمت إضافة ${files.length} صورة بنجاح 🖼️`);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("يرجى تسجيل الدخول لمشاركة ملخصك في الديوان 🏛️");
      return;
    }
    if (!draftTitle.trim() || !draftLesson.trim()) {
      showToast("يرجى إدخال عنوان الملخص/الموضوع واسم الدرس المعني");
      return;
    }

    // Must have at least text OR attached PDF OR attached Image(s)
    const hasText = draftContent.trim().length > 0;
    const hasPdf = Boolean(draftPdf);
    const hasImages = draftImages.length > 0;

    if (!hasText && !hasPdf && !hasImages) {
      showToast("يرجى كتابة نص الملخص أو إرفاق ملف PDF أو صورة واحدة على الأقل ⚠️");
      return;
    }

    // Build attachments array
    const compiledAttachments: CampusPostAttachment[] = [];
    if (draftPdf) {
      compiledAttachments.push({
        type: "pdf",
        url: draftPdf.url,
        label: draftPdf.name,
        fileName: draftPdf.name,
        size: draftPdf.size,
      });
    }
    if (draftImages.length > 0) {
      draftImages.forEach((img, idx) => {
        compiledAttachments.push({
          type: "image",
          url: img.url,
          label: img.name || `صورة ${idx + 1}`,
          fileName: img.name,
        });
      });
    }

    // Formatted fallback content if student only uploaded a file or pictures
    let finalContent = draftContent.trim();
    if (!finalContent) {
      if (draftPdf) {
        finalContent = `ملف PDF أصلي مرفق: ${draftPdf.name} (${draftPdf.size}).`;
      } else if (draftImages.length > 0) {
        finalContent = `مرفق ${draftImages.length} صورة/صفحة من الملخص الورقي.`;
      }
    }

    const tagsArray = draftTags
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const postPayload = {
      type: draftType,
      title: draftTitle.trim(),
      content: finalContent,
      stream: draftStream,
      subjectId: draftSubject,
      lesson: draftLesson.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ["ملخص_تشاركي", "بكالوريا"],
      attachments: compiledAttachments,
    };

    try {
      const res = await fetch("/api/campus/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPosts((prev) => [data.post, ...prev]);
          setIsShareModalOpen(false);
          setDraftTitle("");
          setDraftContent("");
          setDraftLesson("");
          setDraftTags("");
          setDraftPdf(null);
          setDraftImages([]);
          showToast("تم نشر ملخصك ومرفقاته بنجاح في ديوان العلم! 🌟");
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "تعذر نشر الملخص، يرجى المحاولة لاحقاً");
        return;
      }
    } catch (err) {
      console.warn("API create post failed, falling back to local store:", err);
    }

    // Privacy-safe display name fallback
    const fallbackAuthorName = formatStudentPrivacyName(
      user?.user_metadata?.full_name || "طالب بكالوريا"
    );

    const newPost = CampusService.createPost({
      authorId: user?.id || "student-user",
      authorName: fallbackAuthorName,
      authorAvatar: "👨‍🎓",
      authorStream: draftStream,
      authorBadge: "مساهم متميز",
      type: draftType,
      title: draftTitle.trim(),
      content: finalContent,
      stream: draftStream,
      subjectId: draftSubject,
      lesson: draftLesson.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ["ملخص_تشاركي", "بكالوريا"],
      attachments: compiledAttachments,
    });

    setPosts((prev) => [newPost, ...prev]);
    setIsShareModalOpen(false);
    setDraftTitle("");
    setDraftContent("");
    setDraftLesson("");
    setDraftTags("");
    setDraftPdf(null);
    setDraftImages([]);
    showToast("تم نشر ملخصك ومرفقاته بنجاح في ديوان العلم! 🌟");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="rounded-3xl p-5 sm:p-7 border-2 border-slate-200/90 bg-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>بنك الملخصات والمواضيع التشاركية</span>
              </span>
              <span className="text-xs text-slate-600 font-mono font-bold">
                {filteredPosts.length} وثيقة وموضوع
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              الملخصات والمواضيع الرسمية والتشاركية 📑
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed font-medium">
              بنك معرفي متكامل يجمع سلاسل الأساتذة الأصلية بصيغة PDF كاملة دون أي نقصان، إلى جانب ملخصات الطلاب والخرائط الذهنية بصيغ متنوعة (PDF أصلي، صور عالية الدقة، وكتابة تفاعلية).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>رفع موضوع أو ملخص (PDF / صور / نص) 🚀</span>
          </button>
        </div>
      </div>

      {/* 🌟 Official Golden Guides & Chronology Section (بكالوريا 2027) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-theme-text flex items-center gap-2">
                <span>الدليل المنهجي الرسمي والكرونولوجيا المعتمدة</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono border border-amber-500/30">
                  توجيه وزاري أصيل
                </span>
              </h3>
              <p className="text-[11px] text-theme-muted">
                مستخرجة من توجيهات المفتشية العامة للامتحانات ولجان التصحيح الوزاري المعتمدة
              </p>
            </div>
          </div>

          <Link
            href="/memorize?filter=revolution"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 font-bold"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تدرب في سباق الذاكرة 🎮</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Exam Rules & Science Comparison */}
          <div className="rounded-2xl p-4 bg-card border border-theme shadow-clay hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  علوم تجريبية • توجيه حتمي
                </span>
                <span className="text-[10px] text-theme-muted font-mono">07:30 صباحاً</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-theme-text line-clamp-2">
                توجيهات يوم الامتحان + المقارنة الأفقية الإجبارية لاختيار موضوع العلوم
              </h4>
              <p className="text-[11px] text-theme-secondary line-clamp-3 leading-relaxed">
                تحذير قطعي من المقارنة العمودية السطحية! المقارنة تكون أفقياً تمرين بتمرين (ت1: 5ن، ت2: 7ن، ت3: 8ن تمرين الحسم). والتأكد من مطابقة لون ورقة الإجابة للون ملصقة الطاولة.
              </p>
            </div>

            <div className="pt-2 border-t border-theme flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setActiveOfficialDoc("EXAM_SCIENCE")}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض الدليل كاملاً</span>
              </button>
              <Link
                href="/memorize?filter=methodologies"
                className="py-1.5 px-2.5 rounded-xl bg-surface-elevated hover:bg-surface text-theme-secondary text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-theme"
                title="تدرب بالبطاقات الذكية"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>العب</span>
              </Link>
            </div>
          </div>

          {/* Card 2: History & Geo Official Rubric */}
          <div className="rounded-2xl p-4 bg-card border border-theme shadow-clay hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/30">
                  جميع الشعب • سلم التنقيط
                </span>
                <span className="text-[10px] text-theme-muted font-mono">نظام 6 مطات</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-theme-text line-clamp-2">
                سلم التنقيط الوزاري للتاريخ والجغرافيا (المقال بـ 6 مطات + التعليق بـ 4 خطوات)
              </h4>
              <p className="text-[11px] text-theme-secondary line-clamp-3 leading-relaxed">
                العرض يتطلب وجوباً 6 مطات كاملة المعنى مع شرح موجز لكل سؤال وتمنع الفقرة الاسترسالية! والتعليق الجغرافي يمر عبر 4 خطوات: تقديم (0.5ن)، ملاحظة وتفكيك، تفسير، واستنتاج.
              </p>
            </div>

            <div className="pt-2 border-t border-theme flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setActiveOfficialDoc("HIST_GEO_RUBRIC")}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض المنهجية كاملة</span>
              </button>
              <Link
                href="/memorize?mode=quiz"
                className="py-1.5 px-2.5 rounded-xl bg-surface-elevated hover:bg-surface text-theme-secondary text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-theme"
                title="تحدي السرعة في سلم التنقيط"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>تحدي</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Revolution Dates Chronology */}
          <div className="rounded-2xl p-4 bg-card border border-theme shadow-clay hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  الوحدة 2 • كرونولوجيا شاملة
                </span>
                <span className="text-[10px] text-theme-muted font-mono">42 تاريخاً معتمداً</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-theme-text line-clamp-2">
                الكرونولوجيا الشاملة لتواريخ الثورة التحريرية واستعادة السيادة (1946 - 1962)
              </h4>
              <p className="text-[11px] text-theme-secondary line-clamp-3 leading-relaxed">
                42 محطة تاريخية مرتبة سنة بسنة مع الأحداث والسياقات والأسباب من تأسيس MTLD (02 نوفمبر 1946) إلى إعلان قيام الجمهورية (26 سبتمبر 1962).
              </p>
            </div>

            <div className="pt-2 border-t border-theme flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setActiveOfficialDoc("REVOLUTION_CHRONOLOGY")}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>استعراض الـ 42 تاريخاً</span>
              </button>
              <Link
                href="/memorize?filter=revolution"
                className="py-1.5 px-2.5 rounded-xl bg-surface-elevated hover:bg-surface text-theme-secondary text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-theme"
                title="حفظ واختبار تواريخ الثورة"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>احفظ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-surface border border-theme space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === "ALL"
                  ? "bg-blue-600 text-white"
                  : "text-theme-secondary hover:text-theme-text hover:bg-surface-elevated"
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("SUMMARY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === "SUMMARY"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الملخصات والمناهج 📑</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("TRICKY_EXAM_PROBLEM")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedType === "TRICKY_EXAM_PROBLEM"
                  ? "bg-amber-600 text-white"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>مواضيع وفخاخ وزارية ⚠️</span>
            </button>
          </div>

          {/* Stream Filter & Search Input */}
          <div className="flex items-center gap-2">
            {/* Stream Select */}
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-surface-soft border border-theme text-xs font-bold text-theme-text focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {STREAMS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Search Box */}
            <div className="relative flex-1 sm:w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-theme-muted absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس والوسوم..."
                className="w-full py-1.5 pr-8 pl-3 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text placeholder-theme-muted focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Format Filter Bar (PDF / Images / Text) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 border-t border-white/[0.06]">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 shrink-0 ml-1">
            <Filter className="w-3 h-3 text-blue-400" />
            طريقة العرض والصيغة:
          </span>
          <button
            type="button"
            onClick={() => setSelectedFormat("ALL")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedFormat === "ALL"
                ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                : "text-slate-400 hover:text-white bg-white/[0.03]"
            }`}
          >
            جميع الصيغ
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("PDF")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFormat === "PDF"
                ? "bg-rose-500/30 text-rose-300 border border-rose-400/50"
                : "text-slate-400 hover:text-white bg-white/[0.03]"
            }`}
          >
            <FileText className="w-3 h-3 text-rose-400" />
            <span>ملفات PDF الأصلية 📄</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("IMAGE")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFormat === "IMAGE"
                ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/50"
                : "text-slate-400 hover:text-white bg-white/[0.03]"
            }`}
          >
            <ImageIcon className="w-3 h-3 text-indigo-400" />
            <span>صور ومسودات 🖼️</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("TEXT")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFormat === "TEXT"
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50"
                : "text-slate-400 hover:text-white bg-white/[0.03]"
            }`}
          >
            <PenTool className="w-3 h-3 text-emerald-400" />
            <span>نصوص ومذكرات ✍️</span>
          </button>
        </div>
      </div>

      {/* Posts Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-theme space-y-3">
          <BookOpen className="w-10 h-10 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-text">لا توجد ملخصات مطابقة للبحث</h3>
          <p className="text-xs text-theme-secondary max-w-sm mx-auto">
            كن أول من يشارك ملخصاً أو فكرة تمرين مع زملائك واكسب نقاط خبرة وأوسمة في ديوان العلم!
          </p>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
          >
            رفع أول ملخص الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredPosts.map((post) => {
            const isTricky = post.type === "TRICKY_EXAM_PROBLEM";
            const pdfAttachments = post.attachments?.filter((a) => a.type === "pdf") || [];
            const imageAttachments = post.attachments?.filter((a) => a.type === "image") || [];

            return (
              <div
                key={post.id}
                className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all duration-200 hover:border-white/20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
                }}
              >
                <div>
                  {/* Author Row + Type Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-base shrink-0">
                        {post.authorAvatar || "👨‍🎓"}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {post.authorName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {post.authorBadge && (
                            <span className="text-[10px] text-amber-400 font-medium">
                              {post.authorBadge}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            · {new Date(post.createdAt).toLocaleDateString("ar-DZ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {pdfAttachments.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" />
                          PDF أصلي
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isTricky
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {isTricky ? "فخ وزاري ⚠️" : "ملخص مركز 📑"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Lesson */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>درس: {post.lesson}</span>
                  </div>

                  {/* PDF Document Attachment Card (if present) */}
                  {pdfAttachments.map((pdfAtt, idx) => (
                    <div
                      key={idx}
                      className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900/60 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 text-rose-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 text-right">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-200 border border-rose-400/40">
                              مستند PDF أصلي
                            </span>
                            {pdfAtt.size && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {pdfAtt.size}
                              </span>
                            )}
                            {pdfAtt.pageCount && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                · {pdfAtt.pageCount} صفحات
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white truncate mt-1">
                            {pdfAtt.fileName || pdfAtt.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveViewingPdf({
                              url: pdfAtt.url,
                              title: post.title,
                              fileName: pdfAtt.fileName || pdfAtt.label,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة الـ PDF 👁️</span>
                        </button>
                        <a
                          href={pdfAtt.url}
                          download={pdfAtt.fileName || `${post.title}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-xs border border-white/[0.1] transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل 📥</span>
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Image Attachments Gallery (if present) */}
                  {imageAttachments.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imageAttachments.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveViewingImage({ url: img.url, label: img.label })}
                          className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.1] cursor-pointer group bg-slate-900"
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            <span>تكبير الصورة</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content snippet */}
                  {post.content && (
                    <div className="mt-3 text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                      {post.content}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-500" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        post.isLiked
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 border-white/[0.06]"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.isLiked ? "fill-rose-400" : ""}`} />
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Bookmark to Daily Planner */}
                    <button
                      type="button"
                      onClick={() => handleBookmark(post)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        post.isBookmarked
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.06]"
                      }`}
                      title="حفظ في مخطط المذاكرة اليومي"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span className="text-[11px]">
                        {post.isBookmarked ? "محفوظ في المخطط" : "حفظ للمذاكرة"}
                      </span>
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => handleSharePost(post)}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="مشاركة الرابط"
                  >
                    {copiedPostId === post.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded PDF Viewer Modal */}
      {activeViewingPdf && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-[#090E1A] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0D1527]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-right">
                  <h3 className="text-sm font-bold text-white truncate">
                    {activeViewingPdf.title}
                  </h3>
                  {activeViewingPdf.fileName && (
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {activeViewingPdf.fileName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeViewingPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="فتح في نافذة جديدة"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">نافذة كاملة</span>
                </a>
                <a
                  href={activeViewingPdf.url}
                  download={activeViewingPdf.fileName || "document.pdf"}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveViewingPdf(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full h-full bg-[#111827] relative">
              <iframe
                src={`${activeViewingPdf.url}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={activeViewingPdf.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {activeViewingImage && (
        <div
          onClick={() => setActiveViewingImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center cursor-default"
          >
            <button
              type="button"
              onClick={() => setActiveViewingImage(null)}
              className="absolute -top-12 left-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeViewingImage.url}
              alt={activeViewingImage.label}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">
                {activeViewingImage.label}
              </span>
              <a
                href={activeViewingImage.url}
                download="note-image.png"
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ الصورة</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share Summary or Tricky Problem with 3 Upload Methods */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl text-right animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
            style={{
              background: "linear-gradient(180deg, #0B1222 0%, #070B14 100%)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">
                  مشاركة موضوع أو ملخص في ديوان العلم
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 mt-4 text-xs">
              {/* Type selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">نوع المشاركة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftType("SUMMARY")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      draftType === "SUMMARY"
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                    }`}
                  >
                    ملخص درس / وثيقة 📑
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftType("TRICKY_EXAM_PROBLEM")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      draftType === "TRICKY_EXAM_PROBLEM"
                        ? "bg-amber-600 text-white border-amber-400"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                    }`}
                  >
                    موضوع وفخ وزاري ⚠️
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان الموضوع أو الملخص *</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="مثال: ملخص قيود التسوية الشامل، موضوع مقترح بكالوريا..."
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              {/* Stream & Subject */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الشعبة</label>
                  <select
                    value={draftStream}
                    onChange={(e) => setDraftStream(e.target.value as StreamId)}
                    className="w-full py-2 px-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="gestion_eco" className="bg-[#0B1222]">تسيير واقتصاد</option>
                    <option value="sciences_exp" className="bg-[#0B1222]">علوم تجريبية</option>
                    <option value="math" className="bg-[#0B1222]">رياضيات</option>
                    <option value="technique_math" className="bg-[#0B1222]">تقني رياضي</option>
                    <option value="lettres_philo" className="bg-[#0B1222]">آداب وفلسفة</option>
                    <option value="langues" className="bg-[#0B1222]">لغات أجنبية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المادة</label>
                  <select
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value as SubjectId)}
                    className="w-full py-2 px-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {SUBJECTS_LIST.map((subj) => (
                      <option key={subj.id} value={subj.id} className="bg-[#0B1222]">
                        {subj.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lesson */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الدرس المعني *</label>
                <input
                  type="text"
                  value={draftLesson}
                  onChange={(e) => setDraftLesson(e.target.value)}
                  placeholder="مثال: أعمال نهاية السنة والتسويات، الميزانية الوظيفية..."
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              {/* 3 Upload Methods Tabs (PDF, Images, Manual Writing) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  طريقة إضافة المحتوى (ملف PDF، صور، أو كتابة يدوية)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("PDF")}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      uploadMethod === "PDF"
                        ? "bg-rose-600/30 text-rose-300 border-rose-500 shadow-sm"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>ملف PDF 📄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("IMAGE")}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      uploadMethod === "IMAGE"
                        ? "bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>رفع صور 🖼️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("TEXT")}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      uploadMethod === "TEXT"
                        ? "bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                    <span>كتابة يدوية ✍️</span>
                  </button>
                </div>

                {/* Method 1: PDF Upload */}
                {uploadMethod === "PDF" && (
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-rose-500/40 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-950/30 transition-all cursor-pointer text-center group"
                  >
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      ref={pdfInputRef}
                      onChange={handlePdfFileSelect}
                      className="hidden"
                    />
                    {draftPdf ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-rose-500/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-6 h-6 text-rose-400 shrink-0" />
                          <div className="text-right min-w-0">
                            <p className="text-xs font-bold text-white truncate">{draftPdf.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{draftPdf.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraftPdf(null);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-white">انقر لرفع ملف PDF أو اسحبه إلى هنا</p>
                        <p className="text-[10px] text-slate-400">حجم الملف حتى 25 ميغابايت (يحتفظ بكامل الجداول والرسومات الأصلية)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Method 2: Image Upload */}
                {uploadMethod === "IMAGE" && (
                  <div className="space-y-3">
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/30 transition-all cursor-pointer text-center group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={imageInputRef}
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white mt-2">انقر لرفع صور أو صفحات الملخص / الموضوع</p>
                      <p className="text-[10px] text-slate-400">يمكنك رفع صور الكراس أو ورقة الامتحان مباشرة (PNG, JPG, WEBP)</p>
                    </div>

                    {draftImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {draftImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-slate-900">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setDraftImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 left-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Text content / notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {uploadMethod === "TEXT"
                    ? "المحتوى والشرح المركز *"
                    : "ملاحظات أو نبذة موجزة عن الملف/الموضوع (اختياري)"}
                </label>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={uploadMethod === "TEXT" ? 5 : 2}
                  placeholder={
                    uploadMethod === "TEXT"
                      ? "اكتب نقاط الملخص، القوانين الذهبية، أو الفخ وطريقة تجنبه في سلم التنقيط..."
                      : "أضف نبذة سريعة عن محتوى الملف أو الموضوع مع إرشادات للزملاء..."
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs resize-none"
                  required={uploadMethod === "TEXT" && !draftPdf && draftImages.length === 0}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">وسوم مساعدة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={draftTags}
                  onChange={(e) => setDraftTags(e.target.value)}
                  placeholder="مثال: تسويات, ميزانية_وظيفية, بكالوريا2024, pdf_أصلي"
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  نشر الموضوع / الملخص في الديوان 🚀
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🏛️ Official Guides Detailed Modal Viewer */}
      {activeOfficialDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border border-white/15 shadow-2xl flex flex-col overflow-hidden text-slate-100"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {activeOfficialDoc === "EXAM_SCIENCE" && "توجيهات يوم الامتحان + منهجية المقارنة الأفقية في العلوم الطبيعية"}
                    {activeOfficialDoc === "HIST_GEO_RUBRIC" && "الدليل المنهجي لسلم التنقيط الوزاري (المقال بـ 6 مطات + التعليق بـ 4 خطوات)"}
                    {activeOfficialDoc === "REVOLUTION_CHRONOLOGY" && "الكرونولوجيا الشاملة لتواريخ الثورة التحريرية (1946 - 1962)"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    وثيقة معتمدة ومطابقة لتعليمات لجان التصحيح الوزاري الرسمية لبكالوريا 2027
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeOfficialDoc === "EXAM_SCIENCE") {
                      handleCopyText(
                        `توجيهات يوم الامتحان والمقارنة الأفقية في العلوم الطبيعية:\n1. التواجد 07:30 صباحاً.\n2. المقارنة الأفقية تمرين بتمرين.\n3. ت1 (5ن)، ت2 (7ن)، ت3 (8ن).\n4. مطابقة لون ورقة الإجابة مع ملصقة الطاولة.`,
                        "دليل العلوم وتوجيهات الامتحان"
                      );
                    } else if (activeOfficialDoc === "HIST_GEO_RUBRIC") {
                      handleCopyText(
                        `سلم التنقيط الوزاري للتاريخ والجغرافيا:\n- المقال التاريخي: مقدمة (1ن) + عرض بـ 6 مطات لكل سؤال (2.5ن) + خاتمة (0.5ن).\n- التعليق الجغرافي: تقديم (0.5ن) + ملاحظة التباين وتفكيك الأرقام + تفسير + استنتاج.`,
                        "منهجية التاريخ والجغرافيا"
                      );
                    } else if (activeOfficialDoc === "REVOLUTION_CHRONOLOGY") {
                      const text = REVOLUTION_DATES_CHRONOLOGY.map(
                        (d) => `• ${d.exactDate} (${d.year}): ${d.event} — ${d.context}`
                      ).join("\n");
                      handleCopyText(text, "الكرونولوجيا الشاملة لتواريخ الثورة (42 تاريخاً)");
                    }
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                  title="نسخ المحتوى"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOfficialDoc(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed">
              {/* DOC 1: EXAM DAY RULES & SCIENCE COMPARISON */}
              {activeOfficialDoc === "EXAM_SCIENCE" && (
                <div className="space-y-6">
                  {/* Rules Grid */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>📋 1. الضوابط الصارمة ليوم الامتحان وحفظ أوراق الإجابة</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BAC_EXAM_DAY_RULES.map((rule) => (
                        <div key={rule.id} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-white text-xs">{rule.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              {rule.importance === "CRITICAL" ? "إلزامي قطعي" : "توجيه هام"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal vs Vertical Science Comparison */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-black text-emerald-400 text-xs sm:text-sm">
                        🔬 2. {SCIENCE_TOPIC_SELECTION_GUIDE.ruleTitle}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        {SCIENCE_TOPIC_SELECTION_GUIDE.warningNote}
                      </span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed">
                      {SCIENCE_TOPIC_SELECTION_GUIDE.correctApproach}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {SCIENCE_TOPIC_SELECTION_GUIDE.exerciseBreakdown.map((ex, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                          <div className="font-bold text-emerald-300 text-xs">{ex.part}</div>
                          <div className="text-[10px] text-slate-400">{ex.focus}</div>
                          <p className="text-[11px] text-slate-200 leading-normal">{ex.advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Link to Play */}
                  <div className="pt-2 flex items-center justify-between bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300">
                      هل تريد اختبار تثبيتك لقواعد المنهجية بالبطاقات الذكية؟
                    </span>
                    <Link
                      href="/memorize?filter=methodologies"
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>العب الآن في بنك المنهجية</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* DOC 2: HISTORY & GEOGRAPHY OFFICIAL RUBRIC */}
              {activeOfficialDoc === "HIST_GEO_RUBRIC" && (
                <div className="space-y-6">
                  {/* History Section */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-400 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>📜 أولاً: منهجية مادة التاريخ في البكالوريا (سلم التنقيط الرسمي)</span>
                    </h4>

                    {/* Part 1 */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span>{HISTORY_GEO_METHODOLOGY_GUIDE.history.part1.title}</span>
                        <span className="text-blue-400 font-mono">06 نقاط</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {HISTORY_GEO_METHODOLOGY_GUIDE.history.part1.elements.map((elem, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                            <span className="font-bold text-blue-300 text-[11px]">{elem.type}</span>
                            <p className="text-[11px] text-slate-300">{elem.rule}</p>
                            <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-0.5">
                              {elem.details.map((d, dIdx) => (
                                <li key={dIdx}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Part 2 Essay: 6-bullet rule */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-300 text-xs sm:text-sm">
                          {HISTORY_GEO_METHODOLOGY_GUIDE.history.part2_essay.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                          نظام الـ 6 مطات الإلزامي
                        </span>
                      </div>

                      <div className="space-y-2">
                        {HISTORY_GEO_METHODOLOGY_GUIDE.history.part2_essay.structure.map((sec, sIdx) => (
                          <div key={sIdx} className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between font-bold text-xs">
                              <span className="text-white">{sec.section}</span>
                              <span className="text-blue-400 font-mono">{sec.points} ن</span>
                            </div>
                            <p className="text-[11px] text-slate-200">{sec.rule}</p>
                            <div className="text-[10px] text-slate-400 flex flex-wrap gap-1.5 pt-1">
                              {sec.tips.map((t, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                  💡 {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Geography Commentary */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>🌍 ثانياً: المراحل الأربع للتعليق على الجداول والرسومات البيانية في الجغرافيا</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {HISTORY_GEO_METHODOLOGY_GUIDE.geography.part1.commentaryMethodology.map((step) => (
                        <div key={step.stepNumber} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-300 text-xs">{step.stepTitle}</span>
                            {step.pointsAllocation && (
                              <span className="text-[10px] text-emerald-400 font-mono">{step.pointsAllocation}</span>
                            )}
                          </div>
                          <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                            {step.details.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Link to Quiz */}
                  <div className="pt-2 flex items-center justify-between bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300">
                      جاهز لاختبار فهمك لسلم التصحيح في تحدي السرعة؟
                    </span>
                    <Link
                      href="/memorize?mode=quiz"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>ابدأ تحدي السرعة (Quiz)</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* DOC 3: REVOLUTION DATES CHRONOLOGY (42 DATES) */}
              {activeOfficialDoc === "REVOLUTION_CHRONOLOGY" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                    <div className="text-xs text-rose-200">
                      <span className="font-bold">42 تاريخاً معتمداً رسمياً: </span>
                      مرتبة تسلسلياً سنة بسنة من 1946 إلى 1962 مع سياق كل حدث وكلماته المفتاحية في التصحيح.
                    </div>
                    <Link
                      href="/memorize?filter=revolution"
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>تدرب بالبطاقات</span>
                    </Link>
                  </div>

                  {/* Timeline list */}
                  <div className="space-y-2.5">
                    {REVOLUTION_DATES_CHRONOLOGY.map((dateItem, idx) => (
                      <div
                        key={dateItem.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                              {dateItem.exactDate}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                            {dateItem.importance === "CRITICAL" ? "تاريخ معلمي حاسم" : "محطة هامة"}
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-xs sm:text-sm">{dateItem.event}</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{dateItem.context}</p>

                        {dateItem.keywords && dateItem.keywords.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400">كلمات التصحيح:</span>
                            {dateItem.keywords.map((kw, kIdx) => (
                              <span key={kIdx} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-rose-300/90 border border-white/10">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/70">
              <span className="text-[11px] text-slate-400">
                ديوان العلم • شاطر بكالوريا 2027
              </span>
              <button
                type="button"
                onClick={() => setActiveOfficialDoc(null)}
                className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
