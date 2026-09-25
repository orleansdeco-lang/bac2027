"use client";

import React from "react";
import { useFocus } from "@/context/FocusContext";
import { Play, Pause, Maximize2 } from "lucide-react";

export function MiniTimer() {
  const {
    isSessionActive,
    activeSession,
    formattedElapsed,
    formattedRemaining,
    isRunning,
    togglePauseResume,
    openFocusMode,
  } = useFocus();

  if (!isSessionActive || !activeSession) {
    return null;
  }

  const isCountdown = activeSession.targetDurationMinutes > 0;
  const displayTime = isCountdown ? formattedRemaining : formattedElapsed;

  return (
    <div className="inline-flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-md backdrop-blur-md text-zinc-100 transition-all hover:border-emerald-500/50">
      {/* Clickable pill to expand into Fullscreen Zen Mode */}
      <button
        type="button"
        onClick={openFocusMode}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-zinc-800/80 transition-colors cursor-pointer group text-start"
        title="انقر لتكبير وضع التركيز الشامل"
      >
        {/* Subject color dot & pulse */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isRunning && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: activeSession.subjectHex || "#10B981" }}
            />
          )}
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: activeSession.subjectHex || "#10B981" }}
          />
        </span>

        {/* Subject short label */}
        <span className="hidden sm:inline text-[11px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[80px] lg:max-w-[110px]">
          {activeSession.subjectNameAr}
        </span>

        {/* Monospace time */}
        <span
          dir="ltr"
          className={`font-mono text-xs sm:text-sm font-black tabular-nums transition-colors ${
            isRunning ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {displayTime}
        </span>

        <Maximize2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0 hidden md:inline" />
      </button>

      {/* Direct Play/Pause Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePauseResume();
        }}
        aria-label={isRunning ? "إيقاف مؤقت" : "استئناف الجلسة"}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
          isRunning
            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 border border-amber-500/30"
            : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 border border-emerald-500/30"
        }`}
        title={isRunning ? "إيقاف مؤقت" : "استئناف"}
      >
        {isRunning ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
}
