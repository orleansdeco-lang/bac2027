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
export function YptNavbar() {
  const pathname = usePathname();
  const {
    seconds,
    isRunning,
    selectedSubject,
    toggleTimer,
    streakDays,
    setIsFullscreen,
  } = useTimer();

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
