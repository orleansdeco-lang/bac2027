"use client";

import React, { useState } from "react";
import { StudentChallenge } from "@/types/challenge";
import {
  FileText,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Trash2,
  Share2,
  Flame,
  Award,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/constants/streams";

interface StudentChallengeCardProps {
  challenge: StudentChallenge;
  onUpvote: (id: string) => void;
  onOpenDetails: (challenge: StudentChallenge) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isOperator?: boolean;
}

export function StudentChallengeCard({
  challenge,
  onUpvote,
  onOpenDetails,
  onDelete,
  currentUserId,
  isOperator,
}: StudentChallengeCardProps) {
  const [upvoted, setUpvoted] = useState(challenge.user_has_upvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(challenge.upvotes_count || 0);

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvoted(!upvoted);
    setUpvoteCount((prev) => (upvoted ? Math.max(0, prev - 1) : prev + 1));
    onUpvote(challenge.id);
  };

  const subjectLabel =
    ALL_SUBJECTS[challenge.subject_id as keyof typeof ALL_SUBJECTS]?.name_ar ||
    challenge.subject_id;

  const difficultyMeta: Record<string, { label: string; color: string }> = {
    normal: { label: "مستوى عادي", color: "text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 font-bold" },
    medium: { label: "متوسط وأفكار هامة", color: "text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 font-bold" },
    hard: { label: "فكرة صعبة / تعمق", color: "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 font-bold" },
    genius: { label: "تحدي للمتفوقين 19+", color: "text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 font-bold" },
  };

  const diff = difficultyMeta[challenge.difficulty_level] || difficultyMeta.medium;

  const isAuthor = currentUserId && challenge.author_id === currentUserId;
  const canDelete = isAuthor || isOperator;

  return (
    <div
      onClick={() => onOpenDetails(challenge)}
      className="group relative bg-card hover:bg-card-muted/60 border border-theme hover:border-[#2C5E54]/40 dark:hover:border-cyan-500/40 rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-clay hover:shadow-lg cursor-pointer flex flex-col justify-between"
      dir="rtl"
    >
      <div>
        {/* Top Header: Author, Wilaya, Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C5E54] to-teal-700 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {challenge.author_name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {challenge.author_name}
                </span>
                {challenge.wilaya && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-surface px-2 py-0.5 rounded-md border border-theme">
                    <MapPin className="w-3 h-3 text-[#2C5E54] dark:text-cyan-400" />
                    <span>{challenge.wilaya}</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(challenge.created_at).toLocaleDateString("ar-DZ", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full border ${diff.color}`}
            >
              {diff.label}
            </span>

            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(challenge.id);
                }}
                title="حذف التحدي"
                className="p-1.5 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Badges: Subject & Topic */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="text-xs font-bold text-[#2C5E54] dark:text-cyan-300 bg-[#2C5E54]/10 dark:bg-cyan-500/10 border border-[#2C5E54]/20 dark:border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
            {subjectLabel}
          </span>
          {challenge.topic_name && (
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-surface px-2.5 py-0.5 rounded-lg border border-theme">
              الوحدة: {challenge.topic_name}
            </span>
          )}
          {challenge.has_solution && (
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>الحل متوفر</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#2C5E54] dark:group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {challenge.title}
        </h3>

        {/* Text Snippet */}
        {challenge.content_text && (
          <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed mb-3 font-medium">
            {challenge.content_text}
          </p>
        )}

        {/* Attachment Thumbnail / Badge */}
        {challenge.file_url && (
          <div className="mb-4">
            {challenge.file_type === "image" ||
            [".jpg", ".jpeg", ".png", ".webp"].some((ext) =>
              challenge.file_url?.toLowerCase().includes(ext)
            ) ? (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-theme bg-slate-950">
                <img
                  src={challenge.file_url}
                  alt={challenge.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                  <span className="text-[11px] font-bold text-cyan-200 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Eye className="w-3 h-3" />
                    <span>انقر لمعاينة المسألة كاملة</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-theme hover:border-[#2C5E54]/40 transition-all">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">ملف PDF مرفق بالتمرين</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">انقر للفتح والعرض في القارئ المدمج</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions: Upvote & Discussion */}
      <div className="flex items-center justify-between pt-3 border-t border-theme mt-auto">
        <button
          onClick={handleUpvoteClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            upvoted
              ? "bg-[#2C5E54]/15 text-[#2C5E54] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#2C5E54]/30 dark:border-cyan-500/40"
              : "bg-surface hover:bg-card-muted text-slate-700 dark:text-slate-200 hover:text-slate-950 border border-theme"
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? "fill-[#2C5E54] text-[#2C5E54] dark:fill-cyan-400 dark:text-cyan-400" : ""}`} />
          <span>{upvoteCount}</span>
          <span className="hidden sm:inline">تحدي مفيد</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(challenge);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-surface hover:bg-card-muted border border-theme transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#2C5E54] dark:text-cyan-400" />
          <span>{challenge.comments_count || 0}</span>
          <span>مناقشة وحلول</span>
        </button>
      </div>
    </div>
  );
}
