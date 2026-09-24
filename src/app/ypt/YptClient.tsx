"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { StudyTimer } from "@/components/ypt/StudyTimer";
import { VisualTimeline } from "@/components/ypt/VisualTimeline";
import { ActivePeersRoom } from "@/components/ypt/ActivePeersRoom";
import { BacPlannerAndAnalytics } from "@/components/ypt/BacPlannerAndAnalytics";
import { StudySession, MustWinTask } from "@/types/ypt";
import { YPT_BAC_SUBJECTS, getSubjectById, getCurrentSlotIndex } from "@/lib/ypt/yptData";
import { Flame, Trophy, Sparkles, Clock, ShieldCheck } from "lucide-react";

// Generate initial sample slots so the student immediately sees the heat map in action
function getInitialSampleSlots(): (string | null)[] {
  const slots: (string | null)[] = new Array(144).fill(null);
  // 08:30 to 10:00 (slots 51 to 59): Math
  for (let i = 51; i <= 59; i++) {
    slots[i] = "math";
  }
  // 10:30 to 11:40 (slots 63 to 69): Physics
  for (let i = 63; i <= 69; i++) {
    slots[i] = "physics";
  }
  // 14:00 to 15:20 (slots 84 to 91): Natural Sciences
  for (let i = 84; i <= 91; i++) {
    slots[i] = "natural_sciences";
  }
  return slots;
}

const DEFAULT_TASKS: MustWinTask[] = [
  {
    id: "task_1",
    text: "حل مسألة المتتاليات والدوال العددية بكالوريا 2021",
    subjectId: "math",
    completed: true,
    priority: "high",
  },
  {
    id: "task_2",
    text: "مراجعة منهجية الاستدلال العلمي والمسعى العلمي (تمرين 3)",
    subjectId: "natural_sciences",
    completed: false,
    priority: "high",
  },
  {
    id: "task_3",
    text: "حفظ 4 شخصيات وتاريخين من الوحدة الأولى (الحرب الباردة)",
    subjectId: "history_geography",
    completed: false,
    priority: "high",
  },
];

const DEFAULT_SESSIONS: StudySession[] = [
  {
    id: "sess_demo_1",
    subjectId: "math",
    subjectNameAr: "الرياضيات",
    subjectHex: "#2563EB",
    startTime: Date.now() - 6 * 3600 * 1000,
    endTime: Date.now() - 4.5 * 3600 * 1000,
    durationSeconds: 90 * 60,
    date: new Date().toISOString().split("T")[0],
    mode: "pomodoro",
  },
  {
    id: "sess_demo_2",
    subjectId: "physics",
    subjectNameAr: "العلوم الفيزيائية",
    subjectHex: "#D97706",
    startTime: Date.now() - 4 * 3600 * 1000,
    endTime: Date.now() - 2.8 * 3600 * 1000,
    durationSeconds: 70 * 60,
    date: new Date().toISOString().split("T")[0],
    mode: "stopwatch",
  },
  {
    id: "sess_demo_3",
    subjectId: "natural_sciences",
    subjectNameAr: "علوم الطبيعة والحياة",
    subjectHex: "#059669",
    startTime: Date.now() - 2 * 3600 * 1000,
    endTime: Date.now() - 0.7 * 3600 * 1000,
    durationSeconds: 80 * 60,
    date: new Date().toISOString().split("T")[0],
    mode: "pomodoro",
  },
];

export function YptClient() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");

  // State
  const [slots, setSlots] = useState<(string | null)[]>(getInitialSampleSlots);
  const [tasks, setTasks] = useState<MustWinTask[]>(DEFAULT_TASKS);
  const [sessions, setSessions] = useState<StudySession[]>(DEFAULT_SESSIONS);
  const [targetMinutes, setTargetMinutes] = useState<number>(360); // 6 hours
  const [streakDays, setStreakDays] = useState<number>(7);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const storedSlots = localStorage.getItem(`bac_ypt_slots_${todayStr}`);
      if (storedSlots) {
        setSlots(JSON.parse(storedSlots));
      }

      const storedTasks = localStorage.getItem(`bac_ypt_tasks_${todayStr}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }

      const storedSessions = localStorage.getItem(`bac_ypt_sessions_${todayStr}`);
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }

      const storedTarget = localStorage.getItem("bac_ypt_target_minutes");
      if (storedTarget) {
        setTargetMinutes(Number(storedTarget));
      }

      const storedStreak = localStorage.getItem("bac_ypt_streak_days");
      if (storedStreak) {
        setStreakDays(Number(storedStreak));
      }
    } catch {
      // LocalStorage access fallback
    }
  }, [todayStr]);

  // Persist slots
  const updateSlots = (newSlots: (string | null)[]) => {
    setSlots(newSlots);
    try {
      localStorage.setItem(`bac_ypt_slots_${todayStr}`, JSON.stringify(newSlots));
    } catch {
      // Ignore
    }
  };

  // Persist tasks
  const updateTasks = (newTasks: MustWinTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(`bac_ypt_tasks_${todayStr}`, JSON.stringify(newTasks));
    } catch {
      // Ignore
    }
  };

  // Persist sessions
  const updateSessions = (newSessions: StudySession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(`bac_ypt_sessions_${todayStr}`, JSON.stringify(newSessions));
    } catch {
      // Ignore
    }
  };

  // Handle completed session from StudyTimer
  const handleSessionComplete = (session: StudySession) => {
    // 1. Add session
    const nextSessions = [session, ...sessions];
    updateSessions(nextSessions);

    // 2. Color corresponding timeline slots
    const currentSlot = getCurrentSlotIndex();
    const durationMinutes = Math.round(session.durationSeconds / 60);
    const slotsToFill = Math.max(1, Math.round(durationMinutes / 10));

    const nextSlots = [...slots];
    for (let i = 0; i < slotsToFill; i++) {
      const targetSlot = Math.max(0, currentSlot - i);
      nextSlots[targetSlot] = session.subjectId;
    }
    updateSlots(nextSlots);
  };

  // Task Actions
  const handleAddTask = (taskData: Omit<MustWinTask, "id">) => {
    const newTask: MustWinTask = {
      ...taskData,
      id: "task_" + Date.now(),
    };
    updateTasks([...tasks, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    const next = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    updateTasks(next);
  };

  const handleDeleteTask = (taskId: string) => {
    const next = tasks.filter((t) => t.id !== taskId);
    updateTasks(next);
  };

  const handleUpdateTargetHours = (hours: number) => {
    const mins = hours * 60;
    setTargetMinutes(mins);
    try {
      localStorage.setItem("bac_ypt_target_minutes", String(mins));
    } catch {
      // Ignore
    }
  };

  // Total studied minutes today based on timeline slots
  const totalStudiedMinutesToday = slots.filter(Boolean).length * 10;
  const studiedHours = (totalStudiedMinutesToday / 60).toFixed(1);
  const selectedSubject = getSubjectById(selectedSubjectId);

  return (
    <AppShell activeNav="ypt">
      <Container size="xl" className="py-6 sm:py-8 space-y-8">
        {/* TOP HERO BANNER: YPT BAC BRANDING & STREAK COUNTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl bg-card border border-theme shadow-clay relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: selectedSubject.hexColor }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#2C5E54]/15 text-[#2C5E54] dark:text-emerald-400 flex items-center justify-center font-bold text-3xl shadow-xs shrink-0">
              ⏱️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-theme-text font-serif">
                  يلا نقرا - متتبع التركيز الذكي (YPT BAC)
                </h1>
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-[10px]"
                >
                  نسخة البكالوريا الرسمية
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-1 max-w-2xl leading-relaxed">
                مستوحى من نظام Yeolpumta العالمي ومكيف مع برنامج البكالوريا الجزائرية: عداد دقيق، خريطة حرارية 24 ساعة، دراسة جماعية مباشرة، وإحصائيات متقدمة.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges: Streak & Today's Hours */}
          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto flex-wrap">
            {/* Streak Days */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              <div>
                <span className="block text-[10px] font-bold opacity-80">سلسلة الالتزام:</span>
                <span className="font-mono text-xs font-black text-theme-text">
                  {streakDays} أيام متتالية 🔥
                </span>
              </div>
            </div>

            {/* Total Today Hours */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary/10 border border-primary/25 text-primary">
              <Clock className="w-5 h-5" />
              <div>
                <span className="block text-[10px] font-bold opacity-80">إنجاز اليوم:</span>
                <span className="font-mono text-xs font-black text-theme-text" dir="ltr">
                  {studiedHours}h / {(targetMinutes / 60).toFixed(0)}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. CENTRAL INTERACTIVE STUDY TIMER (The Core) */}
        <div>
          <StudyTimer
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* 2. 24-HOUR VISUAL HEAT TIMELINE (The Signature YPT Feature) */}
        <div>
          <VisualTimeline slots={slots} />
        </div>

        {/* 3. DAILY TARGET, 3 MUST-WIN TASKS & VISUAL ANALYTICS (Charts) */}
        <div>
          <BacPlannerAndAnalytics
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            totalStudiedMinutesToday={totalStudiedMinutesToday}
            targetMinutesToday={targetMinutes}
            onUpdateTargetHours={handleUpdateTargetHours}
            sessions={sessions}
          />
        </div>

        {/* 4. VIRTUAL STUDY ROOM / LIVE PEERS ("ندرس معاً") */}
        <div>
          <ActivePeersRoom
            currentUserStudying={false}
            currentSubjectName={selectedSubject.nameAr}
            currentSubjectHex={selectedSubject.hexColor}
            currentDurationMinutes={0}
          />
        </div>
      </Container>
    </AppShell>
  );
}
