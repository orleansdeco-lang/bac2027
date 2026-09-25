"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CampusPost, CampusPostType } from "@/types/campus";
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
} from "lucide-react";

const STREAMS_LIST: { id: string; label: string }[] = [
  { id: "ALL", label: "جميع الشعب" },
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "langues", label: "لغات أجنبية" },
];

export function DiwanSharedSummariesTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [selectedType, setSelectedType] = useState<"ALL" | "SUMMARY" | "TRICKY_EXAM_PROBLEM">("ALL");
  const [selectedStream, setSelectedStream] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New post draft state
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<CampusPostType>("SUMMARY");
  const [draftStream, setDraftStream] = useState<StreamId>("sciences_exp");
  const [draftSubject, setDraftSubject] = useState<SubjectId>("natural_sciences");
  const [draftLesson, setDraftLesson] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load posts
  useEffect(() => {
    const localPosts = CampusService.getPosts();
    setPosts(localPosts);

    // Sync remote posts in background
    CampusService.fetchRemotePosts().then((remote) => {
      if (remote && remote.length > 0) {
        setPosts(remote);
      }
    });
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

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchContent = post.content.toLowerCase().includes(q);
        const matchLesson = post.lesson.toLowerCase().includes(q);
        const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchLesson && !matchTags) return false;
      }

      return true;
    });
  }, [posts, selectedType, selectedStream, searchQuery]);

  const handleLike = (postId: string) => {
    const res = CampusService.toggleLikePost(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: res.likesCount, isLiked: res.isLiked } : p))
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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftContent.trim() || !draftLesson.trim()) {
      showToast("يرجى ملء كافة الحقول الأساسية للملخص");
      return;
    }

    const tagsArray = draftTags
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPost = CampusService.createPost({
      authorId: user?.id || "student-user",
      authorName: user?.email?.split("@")[0] || "طالب بكالوريا",
      authorAvatar: "👨‍🎓",
      authorStream: draftStream,
      authorBadge: "مساهم متميز",
      type: draftType,
      title: draftTitle.trim(),
      content: draftContent.trim(),
      stream: draftStream,
      subjectId: draftSubject,
      lesson: draftLesson.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ["ملخص_تشاركي", "بكالوريا"],
    });

    setPosts((prev) => [newPost, ...prev]);
    setIsShareModalOpen(false);
    setDraftTitle("");
    setDraftContent("");
    setDraftLesson("");
    setDraftTags("");
    showToast("تم نشر ملخصك بنجاح في ديوان العلم! شكراً لمساهمتك مع زملائك 🌟");
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
      <div
        className="rounded-3xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 16, 31, 0.98) 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                مساهمات طلابية تشاركية
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {filteredPosts.length} ملخص وفكرة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              المواضيع والملخصات التشاركية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1 max-w-2xl leading-relaxed">
              بنك معرفي تشاركي يضم ملخصات الدروس، الخرائط الذهنية المركزة، وأفكار التمارين الوزارية مع الفخاخ الشائعة التي شاركها زملاؤك والمتفوقون.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>مشاركة ملخص أو فكرة تمرين ✍️</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-theme">
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
            <span>الملخصات والخرائط 📑</span>
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
            <span>فخاخ وأفكار تمارين ⚠️</span>
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
            إضافة أول ملخص الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredPosts.map((post) => {
            const isTricky = post.type === "TRICKY_EXAM_PROBLEM";
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

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                        isTricky
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isTricky ? "فخ وزاري ⚠️" : "ملخص مركز 📑"}
                    </span>
                  </div>

                  {/* Title & Lesson */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>درس: {post.lesson}</span>
                  </div>

                  {/* Content snippet */}
                  <div className="mt-3 text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                    {post.content}
                  </div>

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

      {/* Modal: Share Summary or Tricky Problem */}
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
                  مشاركة ملخص أو فكرة تمرين مع الزملاء
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
                    ملخص درس / خريطة 📑
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
                    فكرة تمرين / فخ وزاري ⚠️
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان الملخص أو الفكرة</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="مثال: فخ التحليل البعدي لثابت الزمن في دارة RC..."
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
                    <option value="sciences_exp" className="bg-[#0B1222]">علوم تجريبية</option>
                    <option value="math" className="bg-[#0B1222]">رياضيات</option>
                    <option value="technique_math" className="bg-[#0B1222]">تقني رياضي</option>
                    <option value="gestion_eco" className="bg-[#0B1222]">تسيير واقتصاد</option>
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
                    <option value="math" className="bg-[#0B1222]">رياضيات</option>
                    <option value="physics" className="bg-[#0B1222]">فيزياء</option>
                    <option value="natural_sciences" className="bg-[#0B1222]">علوم طبيعية</option>
                    <option value="philosophy" className="bg-[#0B1222]">فلسفة</option>
                    <option value="arabic" className="bg-[#0B1222]">لغة عربية</option>
                    <option value="history_geography" className="bg-[#0B1222]">تاريخ وجغرافيا</option>
                    <option value="islamic_studies" className="bg-[#0B1222]">علوم إسلامية</option>
                  </select>
                </div>
              </div>

              {/* Lesson */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الدرس المعني</label>
                <input
                  type="text"
                  value={draftLesson}
                  onChange={(e) => setDraftLesson(e.target.value)}
                  placeholder="مثال: الظواهر الكهربائية (الدارة RC)"
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">المحتوى والشرح المركز</label>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={5}
                  placeholder="اكتب نقاط الملخص، القوانين الذهبية، أو الفخ وطريقة تجنبه في سلم التنقيط..."
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs resize-none"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">وسوم مساعدة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={draftTags}
                  onChange={(e) => setDraftTags(e.target.value)}
                  placeholder="مثال: كهرباء، قوانين_ذهبية، سلم_التنقيط"
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  نشر الملخص في الديوان 🚀
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
    </div>
  );
}
