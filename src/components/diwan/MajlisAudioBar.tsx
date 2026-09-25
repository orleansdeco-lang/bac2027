"use client";

import React from "react";
import { useStudyAudio } from "@/context/StudyAudioContext";
import { AmbientSoundMode } from "@/lib/ypt/soundEngine";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Headphones,
  Sliders,
  Sparkles,
} from "lucide-react";

export function MajlisAudioBar() {
  const {
    isPlaying,
    currentSound,
    volume,
    isMuted,
    togglePlay,
    setSound,
    setVolume,
    toggleMute,
  } = useStudyAudio();

  const presets: { id: AmbientSoundMode; label: string; emoji: string }[] = [
    { id: "library", label: "مكتبة هادئة", emoji: "☕" },
    { id: "rain", label: "مطر خفيف", emoji: "🌧️" },
    { id: "deep_focus", label: "تركيز عميق", emoji: "🎧" },
  ];

  const handleSelectPreset = (id: AmbientSoundMode) => {
    if (currentSound === id && isPlaying) {
      togglePlay();
    } else {
      setSound(id);
      if (!isPlaying) {
        togglePlay();
      }
    }
  };

  return (
    <div
      className="rounded-2xl p-3 sm:p-4 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 select-none"
      style={{
        background: "linear-gradient(90deg, rgba(11, 18, 34, 0.95) 0%, rgba(14, 23, 42, 0.95) 100%)",
      }}
      dir="rtl"
    >
      {/* Start: Icon + Label & Presets */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 shrink-0">
          <Volume2 className="w-4 h-4" />
          <span>الأصوات الهادئة</span>
        </div>

        {/* Presets Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {presets.map((p) => {
            const isActive = currentSound === p.id && isPlaying;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                    : "bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08] hover:bg-white/[0.08]"
                }`}
              >
                <span>{p.label}</span>
                <span>{p.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center/End: Volume Slider & Play/Pause & Global Hint */}
      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
              : "bg-white/[0.08] text-slate-300 hover:text-white"
          }`}
          title={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "إلغاء الكتم" : "كتم"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 sm:w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Global Persistence Note */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 pr-3 border-r border-white/10 font-medium">
          <Headphones className="w-3.5 h-3.5 text-blue-400" />
          <span>الصوت يعمل في جميع الصفحات</span>
        </div>
      </div>
    </div>
  );
}
