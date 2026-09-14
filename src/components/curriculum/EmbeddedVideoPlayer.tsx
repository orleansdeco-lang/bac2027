"use client";

import React from "react";

export interface EmbeddedVideoPlayerProps {
  videoId: string;
  startSeconds: number;
  title_ar: string;
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

export function extractYoutubeVideoId(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]+)/);
  return match ? match[1] : url;
}

export const EmbeddedVideoPlayer: React.FC<EmbeddedVideoPlayerProps> = ({
  videoId,
  startSeconds,
  title_ar,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
          فيديو توجيهي موجه بدقة
        </span>
        <h4 className="text-xs font-medium text-slate-400 truncate max-w-[70%]">{title_ar}</h4>
      </div>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800/80 shadow-lg bg-slate-950">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${startSeconds}&rel=0&modestbranding=1`}
          title={title_ar}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
