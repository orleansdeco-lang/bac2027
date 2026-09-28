"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles, Music2 } from "lucide-react";
import {
  soundEngine,
  AMBIENT_SOUNDS,
  AmbientSoundMode,
} from "@/lib/ypt/soundEngine";

export function MajlisAudioBar() {
  const [currentMode, setCurrentMode] = useState<AmbientSoundMode>("none");
  const [volume, setVolume] = useState<number>(0.4);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setCurrentMode(soundEngine.getCurrentAmbiance());
    setVolume(soundEngine.getVolume());
  }, []);

  const handleSelectMode = async (mode: AmbientSoundMode) => {
    await soundEngine.resumeContext();
    if (currentMode === mode) {
      soundEngine.stopAmbiance();
      setCurrentMode("none");
    } else {
      soundEngine.setAmbiance(mode);
      setCurrentMode(mode);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const activeMeta = AMBIENT_SOUNDS.find((s) => s.id === currentMode) || AMBIENT_SOUNDS[0];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3 text-xs text-slate-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">صوتيات التركيز الهادئة</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                توليد إجرائي برمجياً
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              الحالة الحالية: <span className="text-white font-semibold">{activeMeta.emoji} {activeMeta.nameAr}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Sound Mode Pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {AMBIENT_SOUNDS.map((s) => {
              const isSelected = currentMode === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectMode(s.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400"
                      : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                  }`}
                  title={s.descriptionAr}
                >
                  <span>{s.emoji}</span>
                  <span>{s.nameAr}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => {
                if (volume > 0) {
                  soundEngine.setVolume(0);
                  setVolume(0);
                } else {
                  soundEngine.setVolume(0.4);
                  setVolume(0.4);
                }
              }}
              className="text-slate-400 hover:text-white transition-colors"
              title="كتم / تفعيل الصوت"
            >
              {volume === 0 || currentMode === "none" ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-blue-500 bg-white/20 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Mobile selector for small screens */}
      <div className="sm:hidden grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
        {AMBIENT_SOUNDS.slice(0, 3).map((s) => {
          const isSelected = currentMode === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectMode(s.id)}
              className={`p-1.5 rounded-lg text-[10px] font-medium transition-all text-center ${
                isSelected
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white/[0.03] text-slate-400"
              }`}
            >
              {s.emoji} {s.nameAr.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
