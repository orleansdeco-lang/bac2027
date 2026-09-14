"use client";

import React, { useState } from "react";
import { Play, ExternalLink, Clock, Youtube, Sparkles } from "lucide-react";

export interface EmbeddedVideoPlayerProps {
  videoId: string;
  startSeconds: number;
  title_ar: string;
  channelName?: string;
  timestampStr?: string;
}

export function parseTimestampToSeconds(timestamp: string | number): number {
  if (typeof timestamp === "number") return timestamp;
  if (!timestamp) return 0;
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return Number(timestamp) || 0;
}

export function formatSecondsToTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function extractYoutubeVideoId(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]+)/);
  return match ? match[1] : url;
}

export const EmbeddedVideoPlayer: React.FC<EmbeddedVideoPlayerProps> = ({
  videoId,
  startSeconds,
  title_ar,
  channelName = "قناة الأستاذ المعتمدة",
  timestampStr,
}) => {
  const [imgError, setImgError] = useState(false);

  const cleanVideoId = extractYoutubeVideoId(videoId);
  const formattedTime = timestampStr || formatSecondsToTime(startSeconds);
  const directYoutubeUrl = `https://www.youtube.com/watch?v=${cleanVideoId}${
    startSeconds > 0 ? `&t=${startSeconds}s` : ""
  }`;
  const thumbnailUrl = `https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`;

  return (
    <div
      className="w-full rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm overflow-hidden text-right transition-all hover:border-emerald-500/50 hover:shadow-md"
      dir="rtl"
    >
      {/* Header bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            <Youtube className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            <span>شرح يوتيوب موجه</span>
          </span>
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {channelName}
          </span>
        </div>

        {startSeconds > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>يبدأ من الدقيقة {formattedTime}</span>
          </div>
        )}
      </div>

      {/* Main card content */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        {/* Thumbnail Preview with Play Overlay */}
        <a
          href={directYoutubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner shrink-0 block cursor-pointer"
          title="فتح الفيديو في تبويب جديد على يوتيوب"
        >
          {!imgError ? (
            <img
              src={thumbnailUrl}
              alt={title_ar}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-3 text-center">
              <Youtube className="w-10 h-10 text-red-500 mb-1" />
              <span className="text-xs font-bold">{title_ar}</span>
            </div>
          )}

          {/* Dark gradient & play badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>

          {/* Timestamp badge */}
          {startSeconds > 0 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/85 text-white text-[11px] font-mono font-bold">
              {formattedTime}
            </span>
          )}
        </a>

        {/* Video description & Direct action button */}
        <div className="flex-1 w-full space-y-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              عنوان الحصة التعليمية:
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {title_ar}
            </h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            تم ضبط الرابط للانتقال مباشرة إلى المقطع المنهجي المحدد (
            <strong className="text-emerald-700 font-bold">{formattedTime}</strong>
            ) لتوفير الوقت وتفادي البحث اليدوي ومشكلات التضمين المقيدة على المنصات.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              href={directYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>مشاهدة الشرح الموجه على يوتيوب ↗</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              يفتح بجودة عالية في تبويب جديد بدون تقطيع
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
