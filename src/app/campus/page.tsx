"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Users,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Heart,
  Plus,
  Share2,
  Lightbulb,
  AlertTriangle,
  GraduationCap,
  Calendar,
  CheckCircle,
  Tag,
  Briefcase,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { CampusPost, CampusPostType, CampusBagItem } from "@/types/campus";
import { StreamId, SubjectId } from "@/types/education";
import { CampusService } from "@/lib/campus/campus-service";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { useAuth } from "@/lib/auth/context";
import { useLearningAccessGate } from "@/lib/hooks";
import { AppShell } from "@/components/ui/AppShell";
import { CampusAccessGate } from "@/components/campus/CampusAccessGate";
import { CreatePostModal } from "@/components/campus/CreatePostModal";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const STREAM_FILTERS = [
  { id: "ALL", label: "جميع الشعب" },
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "langues", label: "لغات أجنبية" },
];

const TYPE_TABS: { id: "ALL" | CampusPostType; label: string; icon: any }[] = [
  { id: "ALL", label: "كل المنشورات", icon: Layers },
  { id: "EXPERIENCE", label: "تجارب ونصائح", icon: Lightbulb },
  { id: "SUMMARY", label: "ملخصات ودروس", icon: BookOpen },
  { id: "TRICKY_EXAM_PROBLEM", label: "أفكار تمارين وفخاخ", icon: AlertTriangle },
];

export default function CampusFeedPage() {
  const { user } = useAuth();
  const gate = useLearningAccessGate({ redirectToAuth: false });

  const studentStream: StreamId =
    gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp";
  const studentName =
    gate.profile?.firstName || (user?.user_metadata as any)?.first_name || "طالب بكالوريا";
  const studentId = user?.id || "guest-student";

  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<"ALL" | CampusPostType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBagModalOpen, setIsBagModalOpen] = useState(false);
  const [bagItems, setBagItems] = useState<CampusBagItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data and sync from backend
  useEffect(() => {
    const loadedPosts = CampusService.getPosts();
    const bag = CampusService.getBagItems(studentId);
    setBagItems(bag);

    // Map bookmark state to posts
    const bagPostIds = new Set(bag.map((b) => b.postId));
    setPosts(
      loadedPosts.map((p) => ({
        ...p,
        isBookmarked: bagPostIds.has(p.id),
      }))
    );

    // Asynchronously fetch latest posts from server
    CampusService.fetchRemotePosts().then((syncedPosts) => {
      if (syncedPosts && syncedPosts.length > 0) {
        const latestBag = CampusService.getBagItems(studentId);
        const latestBagIds = new Set(latestBag.map((b) => b.postId));
        setPosts(
          syncedPosts.map((p) => ({
            ...p,
            isBookmarked: latestBagIds.has(p.id),
          }))
        );
      }
    });
  }, [studentId]);

  // Handle bookmarking post to bag & planner
  const handleBookmark = async (post: CampusPost) => {
    const res = await CampusService.bookmarkPostToPlanner(studentId, post);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isBookmarked: res.isBookmarked,
                bookmarksCount: res.isBookmarked ? p.bookmarksCount + 1 : Math.max(0, p.bookmarksCount - 1),
              }
            : p
        )
      );
      setBagItems(CampusService.getBagItems(studentId));

      if (res.isBookmarked) {
        showToast(`تم حفظ "${post.title.substring(0, 30)}..." في حقيبتك وجدولته في خطتك اليومية 🎒📅`);
      } else {
        showToast("تمت إزالة العنصر من حقيبتك الدراسية");
      }
    }
  };

  // Handle like toggle
  const handleLike = (postId: string) => {
    const { likesCount, isLiked } = CampusService.toggleLikePost(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount, isLiked } : p))
    );
  };

  // Handle create post
  const handleCreatePost = (params: any) => {
    const newPost = CampusService.createPost({
      ...params,
      authorId: studentId,
      authorName: studentName,
      authorAvatar: "👨‍🎓",
      authorStream: studentStream,
    });
    setPosts(CampusService.getPosts());
    showToast("تم نشر مشاركتك بنجاح في بنك المعرفة والتجارب! 🌟");
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (selectedStream !== "ALL" && p.stream !== "ALL" && p.stream !== selectedStream) return false;
    if (selectedType !== "ALL" && p.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchLesson = p.lesson.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchLesson && !matchTags) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <CampusAccessGate>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" dir="rtl">
          {/* Header Banner */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-surface-elevated border border-purple-500/30 overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" size="md" className="font-bold">
                    بنك التجارب والمعرفة 🏛️
                  </Badge>
                  <span className="text-xs text-theme-muted">
                    شعبتك: <strong className="text-theme-text">{ALGERIAN_BAC_STREAMS[studentStream]?.name_ar}</strong>
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-theme-text font-sans">
                  فضاء مجالس العلم وبنك تجارب المتفوقين
                </h1>
                <p className="text-xs sm:text-sm text-theme-muted mt-1 max-w-2xl leading-relaxed">
                  تجارب حقيقية، ملخصات ذهبية، وفخاخ الامتحانات الرسمية. احفظ أي ملخص بضغطة زر واحدة لينتقل مباشرة إلى حقيبتك وجدولك الدراسي.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Link href="/campus/tables">
                  <Button variant="primary" size="md" className="bg-purple-600 hover:bg-purple-700 gap-2 shadow-lg shadow-purple-500/20">
                    <Users className="w-4 h-4" />
                    <span>طاولات مجالس العلم 3D 🏛️</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsBagModalOpen(true)}
                  className="gap-2 border-theme hover:border-purple-500"
                >
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>حقيبتي ({bagItems.length})</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>مشاركة فكرة</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-theme pb-2">
            {TYPE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "bg-surface border border-theme text-theme-secondary hover:text-theme-text hover:bg-surface-soft"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Stream Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-theme">
            {/* Stream Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {STREAM_FILTERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStream(st.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                    selectedStream === st.id
                      ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40"
                      : "bg-surface-soft text-theme-muted hover:text-theme-text"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-theme-muted absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في التجارب والفخاخ..."
                className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const streamMeta = ALGERIAN_BAC_STREAMS[post.stream as keyof typeof ALGERIAN_BAC_STREAMS];

              return (
                <Card
                  key={post.id}
                  className="p-5 sm:p-6 rounded-3xl border border-theme bg-surface hover:border-purple-500/40 transition-all shadow-sm"
                >
                  {/* Top Author Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-lg flex items-center justify-center shrink-0">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-theme-text">
                            {post.authorName}
                          </span>
                          {post.authorBadge && (
                            <Badge variant="warning" size="sm" className="text-[10px] py-0 px-1.5">
                              {post.authorBadge}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-theme-muted">
                          {new Date(post.createdAt).toLocaleDateString("ar-DZ", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Category Type Badge */}
                    <Badge
                      variant="outline"
                      size="sm"
                      className={`text-[11px] font-bold ${
                        post.type === "EXPERIENCE"
                          ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                          : post.type === "SUMMARY"
                          ? "border-blue-500/40 text-blue-500 bg-blue-500/10"
                          : "border-rose-500/40 text-rose-500 bg-rose-500/10"
                      }`}
                    >
                      {post.type === "EXPERIENCE"
                        ? "🌟 تجربة متفوق"
                        : post.type === "SUMMARY"
                        ? "📚 ملخص درس"
                        : "⚠️ فخ وزاري"}
                    </Badge>
                  </div>

                  {/* Post Title */}
                  <h3 className="text-base sm:text-lg font-black text-theme-text mb-2.5 leading-snug">
                    {post.title}
                  </h3>

                  {/* Post Content with MathRenderer & Markdown */}
                  <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed mb-4 p-3.5 rounded-2xl bg-surface-soft/60 border border-theme/60 overflow-x-auto font-sans">
                    <MathRenderer content={post.content} />
                  </div>

                  {/* Lesson & Tags */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
                      {post.lesson}
                    </span>
                    {streamMeta && (
                      <span className="text-[11px] font-bold text-theme-muted bg-surface-soft px-2.5 py-1 rounded-xl border border-theme">
                        شعبة {streamMeta.name_ar}
                      </span>
                    )}
                    {post.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] text-theme-muted font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Footer Actions: Like, Bookmark to Planner, Share */}
                  <div className="pt-3 border-t border-theme/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          post.isLiked
                            ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                            : "bg-surface-soft border-theme text-theme-muted hover:text-theme-text"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      {/* Bookmark count */}
                      <span className="text-xs text-theme-muted flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{post.bookmarksCount} حفظ</span>
                      </span>
                    </div>

                    {/* Bookmark to Planner Button (CRITICAL REQUIREMENT) */}
                    <Button
                      variant={post.isBookmarked ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleBookmark(post)}
                      className={`gap-1.5 text-xs font-bold ${
                        post.isBookmarked
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                          : "border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                      }`}
                    >
                      {post.isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>محفوظ في حقيبتك ✓</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>احفظ في حقيبتي (+)</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-surface border border-theme text-theme-muted">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-500" />
              <h3 className="text-base font-bold text-theme-text mb-1">لا توجد منشورات تطابق البحث</h3>
              <p className="text-xs mb-4">شارك تجربتك الأولى أو ملخصاً لزملائك في البكالوريا!</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>مشاركة أول فكرة</span>
              </Button>
            </div>
          )}
        </div>

        {/* Modal: Create Post */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userStream={studentStream}
          onCreate={handleCreatePost}
        />

        {/* Modal: My Bag (حقيبتي الدراسية) */}
        {isBagModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
            <div className="w-full max-w-lg bg-surface border border-theme rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-theme-text">حقيبتي الدراسية المحفوظة 🎒</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBagModalOpen(false)}
                  className="p-1 rounded-xl text-theme-muted hover:text-theme-text"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-theme-muted mb-4">
                جميع هذه العناصر مجدولة تلقائياً في خطتك الدراسية اليومية (Daily Planner) للمراجعة.
              </p>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {bagItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-theme-muted">
                    حقيبتك فارغة حالياً. انقر على "احفظ في حقيبتي" على أي ملخص لحفظه!
                  </div>
                ) : (
                  bagItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-surface-soft border border-theme flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-theme-text truncate max-w-[260px]">{item.title}</h4>
                        <span className="text-[11px] text-theme-muted">{item.lesson}</span>
                      </div>
                      <Badge variant="success" size="sm">
                        مجدول في الخطة ✓
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white shadow-2xl text-xs sm:text-sm font-bold text-center"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </CampusAccessGate>
    </AppShell>
  );
}
