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
    normal: { label: "مستوى عادي", color: "text-emerald-950 bg-emerald-50 border-emerald-300 font-black" },
    medium: { label: "متوسط وأفكار هامة", color: "text-blue-950 bg-blue-50 border-blue-300 font-black" },
    hard: { label: "فكرة صعبة / تعمق", color: "text-amber-950 bg-amber-50 border-amber-300 font-black" },
    genius: { label: "تحدي للمتفوقين 19+", color: "text-rose-950 bg-rose-50 border-rose-300 font-black" },
  };

  const diff = difficultyMeta[challenge.difficulty_level] || difficultyMeta.medium;

  const isAuthor = currentUserId && challenge.author_id === currentUserId;
  const canDelete = isAuthor || isOperator;

  return (
    <div
      onClick={() => onOpenDetails(challenge)}
      className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#2C5E54]/50 rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex flex-col justify-between"
      dir="rtl"
    >
      <div>
        {/* Top Header: Author, Wilaya, Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2C5E54] to-teal-800 flex items-center justify-center text-white font-black text-sm shadow-sm">
              {challenge.author_name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-black">
                  {challenge.author_name}
                </span>
                {challenge.wilaya && (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-black bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#2C5E54]" />
                    <span>{challenge.wilaya}</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-700 font-bold flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
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
              className={`text-xs px-3 py-1 rounded-full font-black border ${diff.color}`}
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
                className="p-1.5 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Badges: Subject & Topic */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-black text-[#2C5E54] bg-[#2C5E54]/10 border border-[#2C5E54]/30 px-3 py-1 rounded-lg">
            {subjectLabel}
          </span>
          {challenge.topic_name && (
            <span className="text-xs font-bold text-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
              الوحدة: {challenge.topic_name}
            </span>
          )}
          {challenge.has_solution && (
            <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>الحل متوفر</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-serif font-black text-black group-hover:text-[#2C5E54] transition-colors line-clamp-2 mb-3 leading-snug">
          {challenge.title}
        </h3>

        {/* Text Snippet */}
        {challenge.content_text && (
          <p className="text-sm sm:text-base text-black line-clamp-3 leading-relaxed mb-4 font-semibold">
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
              <div className="relative h-36 w-full rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-950">
                <img
                  src={challenge.file_url}
                  alt={challenge.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5 text-cyan-300" />
                    <span>انقر لمعاينة المسألة كاملة</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-[#2C5E54]/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-black truncate">ملف PDF مرفق بالتمرين</p>
                  <p className="text-xs text-slate-700 font-bold">انقر للفتح والعرض في القارئ المدمج</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions: Upvote & Discussion */}
      <div className="flex items-center justify-between pt-3.5 border-t-2 border-slate-200 mt-auto">
        <button
          onClick={handleUpvoteClick}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            upvoted
              ? "bg-[#2C5E54] text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${upvoted ? "fill-white text-white" : "text-black"}`} />
          <span>{upvoteCount}</span>
          <span className="hidden sm:inline">تحدي مفيد</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(challenge);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black text-black hover:text-white bg-slate-100 hover:bg-[#2C5E54] border border-slate-300 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{challenge.comments_count || 0}</span>
          <span>مناقشة وحلول</span>
        </button>
      </div>
    </div>
  );
}
