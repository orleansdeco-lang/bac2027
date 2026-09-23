"use client";

import React, { useState, useEffect } from "react";
import { StudentChallenge, ChallengeComment } from "@/types/challenge";
import { ChallengeService } from "@/lib/services/challenge-service";
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  FileText,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Download,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/constants/streams";

interface ChallengeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: StudentChallenge | null;
  onUpvote: (id: string) => void;
  userFirstName: string;
  userWilaya: string;
  currentUserId?: string;
  isOperator?: boolean;
}

export function ChallengeDetailsModal({
  isOpen,
  onClose,
  challenge,
  onUpvote,
  userFirstName,
  userWilaya,
  currentUserId,
  isOperator,
}: ChallengeDetailsModalProps) {
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (challenge) {
      setUpvoted(challenge.user_has_upvoted || false);
      setUpvoteCount(challenge.upvotes_count || 0);
      setShowSolution(false);
      // Fetch comments
      ChallengeService.getComments(challenge.id).then(setComments);
    }
  }, [challenge]);

  if (!isOpen || !challenge) return null;

  const subjectLabel =
    ALL_SUBJECTS[challenge.subject_id as keyof typeof ALL_SUBJECTS]?.name_ar ||
    challenge.subject_id;

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    setUpvoteCount((prev) => (upvoted ? Math.max(0, prev - 1) : prev + 1));
    onUpvote(challenge.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await ChallengeService.addComment({
        challengeId: challenge.id,
        authorName: userFirstName || "طالب",
        wilaya: userWilaya || undefined,
        content: commentText.trim(),
        userId: currentUserId,
      });

      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    const ok = await ChallengeService.deleteComment(commentId, challenge.id);
    if (ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isPdf =
    challenge.file_type === "pdf" ||
    challenge.file_url?.toLowerCase().includes(".pdf") ||
    challenge.file_url?.startsWith("data:application/pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-[#0B132B] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        dir="rtl"
      >
        {/* Top bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {challenge.author_name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{challenge.author_name}</span>
                {challenge.wilaya && (
                  <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{challenge.wilaya}</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>
                  {new Date(challenge.created_at).toLocaleDateString("ar-DZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="مشاركة رابط التحدي"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg">
              {subjectLabel}
            </span>
            {challenge.topic_name && (
              <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                المحور: {challenge.topic_name}
              </span>
            )}
            {challenge.has_solution && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مرفق بالحل النموذجي</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
            {challenge.title}
          </h2>

          {/* Text Content */}
          {challenge.content_text && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {challenge.content_text}
            </div>
          )}

          {/* Attached Document / Image Viewer */}
          {challenge.file_url && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200">وثيقة / صورة التمرين المرفقة:</h4>
              {isPdf ? (
                <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-950 h-96">
                  <iframe
                    src={challenge.file_url}
                    className="w-full h-full border-0"
                    title="Challenge PDF Document"
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[500px] flex items-center justify-center p-2">
                  <img
                    src={challenge.file_url}
                    alt={challenge.title}
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              )}
            </div>
          )}

          {/* Model Solution Section (Spoiler Accordion) */}
          {challenge.has_solution && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>الحل النموذجي والتنقيط المقترح</span>
                </div>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-all"
                >
                  {showSolution ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>إخفاء الحل</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>إظهار الحل النموذجي</span>
                    </>
                  )}
                </button>
              </div>

              {showSolution ? (
                <div className="pt-3 border-t border-emerald-500/20 space-y-3 text-slate-200 text-xs leading-relaxed">
                  {challenge.solution_text && (
                    <p className="whitespace-pre-wrap p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                      {challenge.solution_text}
                    </p>
                  )}
                  {challenge.solution_file_url && (
                    <div className="flex items-center gap-2">
                      <a
                        href={challenge.solution_file_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل ملف الحل الكامل</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-200 font-medium">
                  حاول حل المسألة بنفسك أولاً، ثم انقر على "إظهار الحل النموذجي" للمطابقة والتصحيح.
                </p>
              )}
            </div>
          )}

          {/* Upvote & stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                upvoted
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${upvoted ? "fill-cyan-400 text-cyan-400" : ""}`} />
              <span>{upvoteCount}</span>
              <span>تحدي مفيد ومميز</span>
            </button>

            <span className="text-xs text-slate-300 font-bold">
              {comments.length} تعليق ومحاولة حل
            </span>
          </div>

          {/* Discussion & Comments Thread */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>مناقشة المسألة ومحاولات الحل ({comments.length})</span>
            </h3>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="اكتب فكرة حلك، أو استفسر عن خطوة غير واضحة..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {isSubmittingComment ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-xs text-slate-300 font-medium text-center py-6">
                كن أول من يشارك محاولة حله أو استفساره حول هذا التمرين!
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((com) => {
                  const canDeleteCom =
                    isOperator || (currentUserId && com.author_id === currentUserId);

                  return (
                    <div
                      key={com.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{com.author_name}</span>
                          {com.wilaya && (
                            <span className="text-[10px] text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                              {com.wilaya}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-300 font-medium">
                            {new Date(com.created_at).toLocaleDateString("ar-DZ", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {canDeleteCom && (
                          <button
                            onClick={() => handleDeleteComment(com.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors p-1"
                            title="حذف التعليق"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-100 leading-relaxed font-normal">{com.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
