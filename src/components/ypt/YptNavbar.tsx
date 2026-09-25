"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Flame,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import { formatSecondsToTime } from "@/lib/ypt/yptData";
import { FocusAmbianceType } from "@/lib/ypt/soundEngine";

export function YptNavbar() {
  const pathname = usePathname();
  const {
    seconds,
    isRunning,
    selectedSubject,
    toggleTimer,
    ambiance,
    setAmbiance,
    volume,
    setVolume,
    streakDays,
    setIsFullscreen,
  } = useTimer();

  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const { formatted } = formatSecondsToTime(seconds);

  const navLinks = [
    {
      href: "/ypt",
      labelAr: "المكتب الشخصي",
      icon: Clock,
      exact: true,
    },
    {
      href: "/ypt/table",
      labelAr: "طاولة المذاكرة الجماعية",
      icon: Users,
    },
    {
      href: "/ypt/curriculum",
      labelAr: "برنامج البكالوريا",
      icon: BookOpen,
    },
    {
      href: "/ypt/analytics",
      labelAr: "الإحصائيات والنتائج",
      icon: BarChart3,
    },
  ];

  const getAmbianceLabel = (t: FocusAmbianceType) => {
    switch (t) {
      case "library":
        return { label: "مكتبة هادئة", icon: "📚" };
      case "rain":
        return { label: "مطر خفيف", icon: "🌧️" };
      case "deep_focus":
        return { label: "تركيز عميق", icon: "🌊" };
      default:
        return { label: "بدون صوت", icon: "🔇" };
    }
  };

  const activeAmbiance = getAmbianceLabel(ambiance);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/10 select-none text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* RIGHT: Logo & Back to Main App Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="العودة للمنصة الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/ypt" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center font-black text-lg text-white shadow-md group-hover:scale-105 transition-transform">
              🎓
            </span>
            <div className="hidden sm:block">
              <span className="font-serif font-black text-base tracking-tight text-white block leading-none">
                يلا نقرا
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold tracking-wider">
                YPT-BAC 2027
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Primary 4 Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "text-white font-black"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-white/20 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">{link.labelAr}</span>
              </Link>
            );
          })}
        </nav>

        {/* LEFT: Persistent Mini-Timer Pill & Soundscape Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Persistent Mini-Timer Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs shadow-xs"
            style={{
              borderColor: isRunning ? `${selectedSubject.hexColor}60` : undefined,
            }}
          >
            {/* Subject dot / icon */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedSubject.hexColor }}
              title={selectedSubject.nameAr}
            />

            {/* Time display */}
            <Link
              href="/ypt"
              dir="ltr"
              className="font-mono font-black text-white hover:text-amber-400 transition-colors cursor-pointer"
              title="انقر للانتقال إلى صفحة العداد"
            >
              {formatted}
            </Link>

            {/* Quick Play/Pause button */}
            <button
              onClick={toggleTimer}
              className={`p-1 rounded-lg transition-colors ${
                isRunning
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              }`}
              title={isRunning ? "إيقاف مؤقت" : "بدء العداد"}
            >
              {isRunning ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="hidden lg:block p-1 text-white/50 hover:text-white transition-colors"
              title="وضع التركيز الأقصى"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persistent Soundscape Pill with dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                ambiance !== "none"
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
              }`}
              title="البيئات الصوتية للتركيز"
            >
              <span>{activeAmbiance.icon}</span>
              <span className="hidden xl:inline text-[11px]">{activeAmbiance.label}</span>
              {/* Equalizer Wave Bars if playing */}
              {ambiance !== "none" && (
                <span className="flex items-end gap-[1.5px] h-3 ml-0.5">
                  <span className="w-0.5 bg-sky-400 animate-pulse h-2" />
                  <span className="w-0.5 bg-sky-400 animate-pulse h-3 delay-75" />
                  <span className="w-0.5 bg-sky-400 animate-pulse h-1.5 delay-150" />
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Soundscape Dropdown Popover */}
            <AnimatePresence>
              {isSoundMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-64 p-3 rounded-2xl bg-[#111827] border border-white/15 shadow-2xl z-50 text-white space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-black pb-2 border-b border-white/10">
                    <span>البيئة الصوتية للتركيز</span>
                    {ambiance !== "none" && (
                      <button
                        onClick={() => setAmbiance("none")}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        كتم الصوت
                      </button>
                    )}
                  </div>

                  {/* 3 Selectable Focus Ambiances */}
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setAmbiance("library");
                        setIsSoundMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-colors ${
                        ambiance === "library"
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                          : "hover:bg-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <div>
                          <div className="font-bold text-[11px]">مكتبة هادئة</div>
                          <div className="text-[9px] text-white/50">
                            همس هادئ وتقليب صفحات
                          </div>
                        </div>
                      </div>
                      {ambiance === "library" && <span className="text-amber-400">●</span>}
                    </button>

                    <button
                      onClick={() => {
                        setAmbiance("rain");
                        setIsSoundMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-colors ${
                        ambiance === "rain"
                          ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40"
                          : "hover:bg-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🌧️</span>
                        <div>
                          <div className="font-bold text-[11px]">مطر خفيف</div>
                          <div className="text-[9px] text-white/50">
                            صوت زخات المطر على الزجاج
                          </div>
                        </div>
                      </div>
                      {ambiance === "rain" && <span className="text-sky-400">●</span>}
                    </button>

                    <button
                      onClick={() => {
                        setAmbiance("deep_focus");
                        setIsSoundMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-colors ${
                        ambiance === "deep_focus"
                          ? "bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40"
                          : "hover:bg-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🌊</span>
                        <div>
                          <div className="font-bold text-[11px]">تركيز عميق</div>
                          <div className="text-[9px] text-white/50">
                            ضوضاء بنية مهدئة + موجات ألفا
                          </div>
                        </div>
                      </div>
                      {ambiance === "deep_focus" && <span className="text-indigo-400">●</span>}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white/60">
                      <span>مستوى الصوت:</span>
                      <span className="font-mono">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-white/20"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Streak Badge */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
            title="سلسلة الالتزام المتتالية"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono font-black">{streakDays}</span>
            <span className="text-[10px]">أيام 🔥</span>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 bg-[#0B0F17]/95 text-xs font-bold">
        {navLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
                isActive ? "text-amber-400 font-black" : "text-white/60 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{link.labelAr}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
