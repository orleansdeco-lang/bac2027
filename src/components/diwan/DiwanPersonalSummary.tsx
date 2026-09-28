"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Zap, CheckCircle2, ShieldCheck, Flame, ArrowRight, AlertTriangle } from "lucide-react";
import { PlannerStorage } from "@/lib/planner/storage";
import { CampusService } from "@/lib/campus/campus-service";
import { loadErrorRecords } from "@/lib/mission/storage";
import { useAuth } from "@/lib/auth/context";

export function DiwanPersonalSummary() {
  const { user } = useAuth();
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [pureSessionsCount, setPureSessionsCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const userId = user?.id || "demo-user";
        const sessions = await PlannerStorage.loadStudySessions(userId);

        if (isMounted) {
          const totalSec = sessions.reduce((acc, s) => acc + (s.actualDurationSeconds || 0), 0);
          const mins = Math.floor(totalSec / 60);
          setTotalMinutes(mins);

          // 10 minutes = 1 XP
          const earnedXp = Math.floor(mins / 10);
          setXp(earnedXp);

          // Pure sessions: completed with 0 interruptions and > 10 minutes
          const pure = sessions.filter(
            (s) => s.status === "COMPLETED" && (s.interruptionsCount === 0 || !s.interruptionsCount) && (s.actualDurationSeconds || 0) >= 600
          ).length;
          setPureSessionsCount(pure);

          const errorsMap = loadErrorRecords();
          const studentErrors = Object.values(errorsMap).filter(
            (e) => !userId || userId === "demo-user" || e.studentId === userId
          );
          setMistakesCount(studentErrors.length);
        }
      } catch (err) {
        console.warn("Error loading Diwan personal summary:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStats();

    const handleSessionLogged = () => loadStats();
    window.addEventListener("study-session-logged", handleSessionLogged);
    return () => {
      isMounted = false;
      window.removeEventListener("study-session-logged", handleSessionLogged);
    };
  }, [user?.id]);

  // Rank determination
  let rankTitle = "مجتهد 🥉";
  let nextRankTitle = "قائد 🥈";
  let nextRankThreshold = 50;
  let rankProgress = Math.min(100, Math.round((xp / 50) * 100));

  if (xp >= 300) {
    rankTitle = "أسطورة 👑";
    nextRankTitle = "الدرجة القصوى";
    nextRankThreshold = 300;
    rankProgress = 100;
  } else if (xp >= 150) {
    rankTitle = "متفوق 🥇";
    nextRankTitle = "أسطورة 👑";
    nextRankThreshold = 300;
    rankProgress = Math.min(100, Math.round(((xp - 150) / 150) * 100));
  } else if (xp >= 50) {
    rankTitle = "قائد 🥈";
    nextRankTitle = "متفوق 🥇";
    nextRankThreshold = 150;
    rankProgress = Math.min(100, Math.round(((xp - 50) / 100) * 100));
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl p-5 bg-[#0B1222]/90 border border-white/[0.08] animate-pulse h-36" />
    );
  }

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0B1222]/95 via-[#0f172a]/90 to-[#1e1b4b]/60 border border-white/[0.08] shadow-xl text-white space-y-4" dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">رتبتك الأكاديمية الفعلية</span>
            <h4 className="text-base font-black text-white flex items-center gap-1.5">
              <span>{rankTitle}</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {xp} XP
              </span>
            </h4>
          </div>
        </div>

        <div className="text-left">
          <span className="text-[11px] text-slate-400 block font-mono">الهدف القادم</span>
          <span className="text-xs font-bold text-slate-300">{nextRankTitle}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>التقدم نحو الرتبة التالية</span>
          <span className="font-mono">{xp} / {nextRankThreshold} XP</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${rankProgress}%` }}
          />
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.05] text-center">
          <span className="text-[10px] text-slate-400 block">دقائق المذاكرة</span>
          <span className="text-base font-black text-blue-400 font-mono mt-0.5 block">{totalMinutes} د</span>
        </div>

        <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.05] text-center">
          <span className="text-[10px] text-slate-400 block">جلسات نقية 🌟</span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{pureSessionsCount}</span>
        </div>

        <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.05] text-center">
          <span className="text-[10px] text-slate-400 block">أخطاء في المعمل</span>
          <span className="text-base font-black text-rose-400 font-mono mt-0.5 block">{mistakesCount}</span>
        </div>
      </div>

      {/* Link to Error Vault */}
      {mistakesCount > 0 && (
        <div className="pt-1">
          <Link
            href="/error-lab"
            className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-xs text-rose-300 font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>لديك {mistakesCount} أخطاء تحتاج مراجعة في معمل الأخطاء</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
