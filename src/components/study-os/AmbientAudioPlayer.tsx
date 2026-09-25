"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStudyAudio } from "@/context/StudyAudioContext";
import { useFocus } from "@/context/FocusContext";
import { AmbientSoundMode } from "@/lib/ypt/soundEngine";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Headphones,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AmbientAudioPlayerProps {
  /** If true, renders an embedded inline version (for FocusModeModal or StudyRoom) */
  embedded?: boolean;
  className?: string;
}

export function AmbientAudioPlayer({ embedded = false, className = "" }: AmbientAudioPlayerProps) {
  let isFocusModeOpen = false;
  try {
    const focus = useFocus();
    isFocusModeOpen = focus.isFocusModeOpen;
  } catch {
    // Ignore if outside FocusContext
  }

  const {
    isPlaying,
    currentSound,
    currentSoundMeta,
    volume,
    isMuted,
    availableSounds,
    togglePlay,
    setSound,
    setVolume,
    toggleMute,
  } = useStudyAudio();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If floating player and focus mode is fullscreen, don't show the duplicate floating pill
  if (!embedded && isFocusModeOpen) {
    return null;
  }

  // Close popup if clicking outside
  useEffect(() => {
    if (embedded || !isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [embedded, isExpanded]);

  const effectiveVolume = isMuted ? 0 : volume;

  // Embedded version (for inside modals or header toolbars)
  if (embedded) {
    return (
      <div
        role="region"
        aria-label="مشغل الصوتيات المحيطية للتركيز"
        className={`flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 ${className}`}
        dir="rtl"
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "إيقاف الصوت المحيطي مؤقتاً" : "تشغيل الصوت المحيطي"}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isPlaying
              ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Sound Selection Chips */}
        <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="اختر صوت التركيز">
          {availableSounds.map((snd) => {
            const isSelected = currentSound === snd.id;
            return (
              <button
                key={snd.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${snd.nameAr} - ${snd.descriptionAr}`}
                onClick={() => setSound(snd.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <span>{snd.emoji}</span>
                <span>{snd.nameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Volume & Mute */}
        <div className="flex items-center gap-2 mr-auto">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {isMuted || effectiveVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effectiveVolume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="مستوى الصوت المحيطي"
            className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          />
          <span className="text-[10px] font-mono text-zinc-400 w-7 text-left">
            {Math.round(effectiveVolume * 100)}%
          </span>
        </div>
      </div>
    );
  }

  // Global Compact Persistent Docked Player (Bottom Corner)
  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="مشغل الصوتيات المحيطية للتركيز"
      className={`fixed bottom-4 left-4 z-40 select-none ${className}`}
      dir="rtl"
    >
      {/* Expanded Control Card */}
      {isExpanded && (
        <div
          id="ambient-audio-controls"
          className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-4 rounded-3xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70 mb-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white font-sans">
                صوتيات التركيز الهادئة
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="تصغير مشغل الصوتيات"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Sound Options List */}
          <div className="space-y-1.5 mb-4" role="radiogroup" aria-label="اختر صوت التركيز">
            {availableSounds.map((snd) => {
              const isSelected = currentSound === snd.id;
              return (
                <button
                  key={snd.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${snd.nameAr}: ${snd.descriptionAr}`}
                  onClick={() => setSound(snd.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl text-xs transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-right">
                    <span className="text-base">{snd.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold">{snd.nameAr}</div>
                      <div className="text-[10px] text-zinc-400 font-normal leading-tight">
                        {snd.descriptionAr}
                      </div>
                    </div>
                  </div>
                  {isSelected && isPlaying && (
                    <div className="flex items-end gap-0.5 h-3 mr-2" aria-hidden="true">
                      <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse" />
                      <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse delay-75" />
                      <span className="w-0.5 h-3.5 bg-amber-400 rounded-full animate-pulse delay-150" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Playback Controls & Volume Slider */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70 gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "إيقاف الصوت المحيطي مؤقتاً" : "تشغيل الصوت المحيطي"}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isPlaying
                  ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                  : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>تشغيل الصوت</span>
                </>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {isMuted || effectiveVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-zinc-300" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effectiveVolume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="مستوى الصوت"
                className="w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
              <span className="text-[10px] font-mono text-zinc-400 w-6 text-left">
                {Math.round(effectiveVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill (Always visible, lightweight, high accessibility) */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-xl transition-all ${
          isPlaying
            ? "bg-zinc-950/95 border-amber-500/40 text-amber-300 shadow-amber-500/10"
            : "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 shadow-black/30"
        }`}
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={isPlaying ? "إيقاف الصوت المحيطي" : "تشغيل الصوت المحيطي"}
          className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isPlaying
              ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Expand / Sound Info Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls="ambient-audio-controls"
          aria-label={`الصوت الحالي: ${currentSoundMeta?.nameAr || "مطر خفيف"}. انقر لفتح خيارات الصوت`}
          className="flex items-center gap-2 text-xs font-semibold cursor-pointer py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg px-1"
        >
          <span>{currentSoundMeta?.emoji || "🌧️"}</span>
          <span className="hidden sm:inline text-xs text-zinc-200">
            {currentSoundMeta?.nameAr || "مطر خفيف"}
          </span>

          {isPlaying && (
            <div className="flex items-end gap-0.5 h-2.5 mx-0.5" aria-hidden="true">
              <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
            </div>
          )}

          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>
      </div>
    </div>
  );
}
