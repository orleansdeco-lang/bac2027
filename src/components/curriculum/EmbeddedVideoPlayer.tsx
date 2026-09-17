"use client";

import React, { useState } from "react";
import { Play, ExternalLink, Clock, Youtube, Sparkles } from "lucide-react";

export interface EmbeddedVideoPlayerProps {
  videoId: string;
  videoUrl?: string;
  startSeconds?: number;
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
  videoUrl,
  startSeconds = 0,
  title_ar,
  channelName = "قناة الأستاذ المعتمدة",
  timestampStr,
}) => {
  const [imgError, setImgError] = useState(false);

  // Determine actual target URL
  const rawTarget = videoUrl || videoId || "";
  const isSearchQuery =
    rawTarget.includes("results?search_query=") || rawTarget.includes("search_query=");
  const isHttp = rawTarget.startsWith("http://") || rawTarget.startsWith("https://");

  let cleanVideoId = "";
  let directYoutubeUrl = "";

  if (isSearchQuery) {
    directYoutubeUrl = rawTarget;
  } else {
    cleanVideoId = extractYoutubeVideoId(rawTarget);
    const isValidId =
      cleanVideoId &&
      cleanVideoId.length === 11 &&
      !cleanVideoId.includes("/") &&
      !cleanVideoId.includes("?") &&
      !cleanVideoId.includes("&");

    if (isValidId) {
      directYoutubeUrl = `https://www.youtube.com/watch?v=${cleanVideoId}${
        startSeconds > 0 ? `&t=${startSeconds}s` : ""
      }`;
    } else if (isHttp) {
      directYoutubeUrl = rawTarget;
    } else {
      directYoutubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${channelName} ${title_ar} علوم طبيعية بكالوريا`
      )}`;
    }
  }

  const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${channelName} ${title_ar} بكالوريا`
  )}`;

  const formattedTime = timestampStr || formatSecondsToTime(startSeconds);
  const hasValidThumbnailId =
    cleanVideoId && cleanVideoId.length === 11 && !cleanVideoId.includes("/");
  const thumbnailUrl = hasValidThumbnailId
    ? `https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`
    : "";

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
          {thumbnailUrl && !imgError ? (
            <img
              src={thumbnailUrl}
              alt={title_ar}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-red-950/40 text-white p-4 text-center">
              <Youtube className="w-10 h-10 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold line-clamp-2 leading-relaxed text-slate-200">
                {title_ar}
              </span>
              <span className="text-[10px] text-red-300 mt-1 font-medium bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                {channelName}
              </span>
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

        {/* Video description & Direct action buttons */}
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
            رابط مباشر موجه إلى القناة المعتمدة للأستاذ مع إمكانية البحث الفوري عن الدرس والتمارين المرافقة لتوفير الوقت وتفادي مشكلات الروابط المعطلة.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href={directYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>مشاهدة الشرح على يوتيوب ↗</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href={fallbackSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all active:scale-[0.98]"
              title="البحث عن شروحات إضافية لنفس الدرس على يوتيوب"
            >
              <span>بحث شامل في يوتيوب 🔍</span>
            </a>

            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              روابط موثوقة ومحدثة 2026/2027
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
