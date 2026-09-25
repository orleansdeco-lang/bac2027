"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { YptSubject, StudySession, StudyTimerMode, PomodoroPhase, MustWinTask } from "@/types/ypt";
import { YPT_BAC_SUBJECTS, getSubjectById, getCurrentSlotIndex } from "@/lib/ypt/yptData";
import { soundEngine, FocusAmbianceType } from "@/lib/ypt/soundEngine";

export interface VirtualDeskSeat {
  seatIndex: number;
  isCurrentUser: boolean;
  name: string;
  avatar: string;
  wilaya: string;
  streamLabel: string;
  subjectId: string;
  subjectName: string;
  subjectHex: string;
  elapsedMinutes: number;
  stickyGoalNote: string;
  waveCount: number;
  isWaving?: boolean;
}

interface TimerContextType {
  // Timer State
  mode: StudyTimerMode;
  pomodoroPhase: PomodoroPhase;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  seconds: number;
  isRunning: boolean;
  selectedSubjectId: string;
  selectedSubject: YptSubject;
  isFullscreen: boolean;

  // Timer Actions
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: StudyTimerMode) => void;
  setPomodoroPreset: (workMins: number, breakMins: number) => void;
  selectSubject: (subjectId: string) => void;
  recordCurrentSession: (overrideDuration?: number) => void;
  setIsFullscreen: (v: boolean) => void;

  // Soundscape
  ambiance: FocusAmbianceType;
  volume: number;
  setAmbiance: (type: FocusAmbianceType) => void;
  setVolume: (v: number) => void;
  toggleAmbiance: (type?: FocusAmbianceType) => void;

  // Virtual Table Seats
  activeSeat: number | null;
  userGoalNote: string;
  tableSeats: VirtualDeskSeat[];
  sitAtSeat: (seatIndex: number, goalNote?: string) => void;
  leaveSeat: () => void;
  sendFocusWave: (seatIndex: number) => void;

  // Daily Planner & Tasks
  tasks: MustWinTask[];
  addTask: (text: string, subjectId: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // 144 Timeline Slots & Sessions
  slots: (string | null)[];
  sessions: StudySession[];
  targetMinutes: number;
  setTargetHours: (hours: number) => void;
  streakDays: number;

  // Curriculum Progress
  userStream: string;
  curriculumProgress: Record<string, boolean>;
  setUserStream: (stream: string) => void;
  toggleCurriculumStage: (unitId: string, stageId: string) => void;
}

const DEFAULT_SEATS: VirtualDeskSeat[] = [
  {
    seatIndex: 0,
    isCurrentUser: false,
    name: "محمد إسلام",
    avatar: "👨‍🎓",
    wilaya: "الجزائر العاصمة",
    streamLabel: "علوم تجريبية",
    subjectId: "natural_sciences",
    subjectName: "علوم الطبيعة والحياة",
    subjectHex: "#059669",
    elapsedMinutes: 48,
    stickyGoalNote: "حل تمرين تركيب البروتين واستخراج الآليات 🧬",
    waveCount: 14,
  },
  {
    seatIndex: 1,
    isCurrentUser: false,
    name: "سارة ب.",
    avatar: "👩‍🎓",
    wilaya: "قسنطينة",
    streamLabel: "رياضيات",
    subjectId: "math",
    subjectName: "الرياضيات",
    subjectHex: "#2563EB",
    elapsedMinutes: 76,
    stickyGoalNote: "مسألة الدوال اللوغاريتمية والمتتاليات 📐",
    waveCount: 22,
  },
  {
    seatIndex: 2,
    isCurrentUser: false,
    name: "أمين ك.",
    avatar: "🧑‍💻",
    wilaya: "وهران",
    streamLabel: "تقني رياضي",
    subjectId: "physics",
    subjectName: "العلوم الفيزيائية",
    subjectHex: "#D97706",
    elapsedMinutes: 34,
    stickyGoalNote: "قوانين نيوتن وحركة الأقمار الصناعية ⚡",
    waveCount: 9,
  },
  {
    seatIndex: 3,
    isCurrentUser: false,
    name: "إيمان ل.",
    avatar: "👩‍🏫",
    wilaya: "سطيف",
    streamLabel: "آداب وفلسفة",
    subjectId: "philosophy",
    subjectName: "الفلسفة",
    subjectHex: "#7C3AED",
    elapsedMinutes: 52,
    stickyGoalNote: "كتابة مقال فلسفي: السؤال والمشكلة 💭",
    waveCount: 16,
  },
  {
    seatIndex: 4,
    isCurrentUser: false,
    name: "أيوب ز.",
    avatar: "🧑‍🎓",
    wilaya: "باتنة",
    streamLabel: "تسيير واقتصاد",
    subjectId: "economy_law",
    subjectName: "التسيير المالي",
    subjectHex: "#65A30D",
    elapsedMinutes: 28,
    stickyGoalNote: "إعداد جدول حسابات النتائج والتسوية 📊",
    waveCount: 7,
  },
  // Seat 5 is initially empty for the student to sit down!
  {
    seatIndex: 5,
    isCurrentUser: false,
    name: "مقعد شاغر",
    avatar: "🪑",
    wilaya: "",
    streamLabel: "",
    subjectId: "",
    subjectName: "مقعد فارغ",
    subjectHex: "#64748B",
    elapsedMinutes: 0,
    stickyGoalNote: "",
    waveCount: 0,
  },
];

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

function getInitialSampleSlots(): (string | null)[] {
  const slots: (string | null)[] = new Array(144).fill(null);
  for (let i = 51; i <= 59; i++) slots[i] = "math";
  for (let i = 63; i <= 69; i++) slots[i] = "physics";
  for (let i = 84; i <= 91; i++) slots[i] = "natural_sciences";
  return slots;
}

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Timer state
  const [mode, setMode] = useState<StudyTimerMode>("stopwatch");
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("work");
  const [pomodoroWorkMinutes, setPomodoroWorkMinutes] = useState<number>(25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Soundscape
  const [ambiance, setAmbianceState] = useState<FocusAmbianceType>("none");
  const [volume, setVolumeState] = useState<number>(0.35);

  // Table
  const [activeSeat, setActiveSeat] = useState<number | null>(null);
  const [userGoalNote, setUserGoalNote] = useState<string>("حل مسائل ونماذج البكالوريا الرسمية 🎯");
  const [tableSeats, setTableSeats] = useState<VirtualDeskSeat[]>(DEFAULT_SEATS);

  // Planner, Slots, Sessions
  const [tasks, setTasks] = useState<MustWinTask[]>(DEFAULT_TASKS);
  const [slots, setSlots] = useState<(string | null)[]>(getInitialSampleSlots);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [targetMinutes, setTargetMinutesState] = useState<number>(360);
  const [streakDays, setStreakDays] = useState<number>(7);

  // Curriculum
  const [userStream, setUserStreamState] = useState<string>("sciences_exp");
  const [curriculumProgress, setCurriculumProgress] = useState<Record<string, boolean>>({});

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const storedSlots = localStorage.getItem(`bac_ypt_slots_${todayStr}`);
      if (storedSlots) setSlots(JSON.parse(storedSlots));

      const storedTasks = localStorage.getItem(`bac_ypt_tasks_${todayStr}`);
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedSessions = localStorage.getItem(`bac_ypt_sessions_${todayStr}`);
      if (storedSessions) setSessions(JSON.parse(storedSessions));

      const storedTarget = localStorage.getItem("bac_ypt_target_minutes");
      if (storedTarget) setTargetMinutesState(Number(storedTarget));

      const storedStream = localStorage.getItem("bac_ypt_user_stream");
      if (storedStream) setUserStreamState(storedStream);

      const storedCurriculum = localStorage.getItem("bac_ypt_curriculum_progress");
      if (storedCurriculum) setCurriculumProgress(JSON.parse(storedCurriculum));

      const storedGoal = localStorage.getItem("bac_ypt_goal_note");
      if (storedGoal) setUserGoalNote(storedGoal);
    } catch {
      // Fallback
    }
  }, [todayStr]);

  // 2. Global Ticking Timer Loop
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) setSessionStartTime(Date.now());

      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "stopwatch") {
            return prev + 1;
          } else {
            if (prev <= 1) {
              soundEngine.playChime();
              handlePomodoroAutoSwitch();
              return 0;
            }
            return prev - 1;
          }
        });

        // Also increment elapsed study time at the virtual desk seat if seated
        if (activeSeat !== null) {
          setTableSeats((prevSeats) =>
            prevSeats.map((seat) =>
              seat.seatIndex === activeSeat && seat.isCurrentUser
                ? { ...seat, elapsedMinutes: Math.floor(seconds / 60) + 1 }
                : seat
            )
          );
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, mode, pomodoroPhase, sessionStartTime, activeSeat, seconds]);

  // Switch between work & break in Pomodoro
  const handlePomodoroAutoSwitch = () => {
    setIsRunning(false);
    if (pomodoroPhase === "work") {
      recordCurrentSession(pomodoroWorkMinutes * 60);
      setPomodoroPhase("short_break");
      setSeconds(pomodoroBreakMinutes * 60);
    } else {
      setPomodoroPhase("work");
      setSeconds(pomodoroWorkMinutes * 60);
    }
  };

  // Timer controls
  const startTimer = () => {
    setIsRunning(true);
    if (mode === "pomodoro" && seconds === 0) {
      setSeconds(
        pomodoroPhase === "work" ? pomodoroWorkMinutes * 60 : pomodoroBreakMinutes * 60
      );
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (isRunning) pauseTimer();
    else startTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(
      mode === "stopwatch"
        ? 0
        : (pomodoroPhase === "work" ? pomodoroWorkMinutes : pomodoroBreakMinutes) * 60
    );
    setSessionStartTime(null);
  };

  const switchMode = (newMode: StudyTimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "pomodoro") {
      setPomodoroPhase("work");
      setSeconds(pomodoroWorkMinutes * 60);
    } else {
      setSeconds(0);
    }
    setSessionStartTime(null);
  };

  const setPomodoroPreset = (workMins: number, breakMins: number) => {
    setPomodoroWorkMinutes(workMins);
    setPomodoroBreakMinutes(breakMins);
    if (mode === "pomodoro" && !isRunning) {
      setSeconds(workMins * 60);
      setPomodoroPhase("work");
    }
  };

  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    // Update user's desk seat badge if seated
    if (activeSeat !== null) {
      const sub = getSubjectById(subjectId);
      setTableSeats((prev) =>
        prev.map((s) =>
          s.seatIndex === activeSeat
            ? {
                ...s,
                subjectId: sub.id,
                subjectName: sub.nameAr,
                subjectHex: sub.hexColor,
              }
            : s
        )
      );
    }
  };

  const recordCurrentSession = (overrideDuration?: number) => {
    const duration =
      overrideDuration !== undefined
        ? overrideDuration
        : mode === "stopwatch"
        ? seconds
        : pomodoroWorkMinutes * 60 - seconds;

    if (duration < 30) {
      alert("الجلسة أقل من 30 ثانية ولم يتم تسجيلها كجلسة دراسية.");
      return;
    }

    const now = Date.now();
    const currentSub = getSubjectById(selectedSubjectId);
    const newSession: StudySession = {
      id: "sess_" + now + "_" + Math.random().toString(36).substring(2, 7),
      subjectId: currentSub.id,
      subjectNameAr: currentSub.nameAr,
      subjectHex: currentSub.hexColor,
      startTime: sessionStartTime || now - duration * 1000,
      endTime: now,
      durationSeconds: duration,
      date: todayStr,
      mode: mode,
    };

    // 1. Add session
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    try {
      localStorage.setItem(`bac_ypt_sessions_${todayStr}`, JSON.stringify(updatedSessions));
    } catch {
      // Ignore
    }

    // 2. Fill timeline blocks
    const currentSlot = getCurrentSlotIndex();
    const durationMinutes = Math.round(duration / 60);
    const slotsToFill = Math.max(1, Math.round(durationMinutes / 10));

    const updatedSlots = [...slots];
    for (let i = 0; i < slotsToFill; i++) {
      const idx = Math.max(0, currentSlot - i);
      updatedSlots[idx] = currentSub.id;
    }
    setSlots(updatedSlots);
    try {
      localStorage.setItem(`bac_ypt_slots_${todayStr}`, JSON.stringify(updatedSlots));
    } catch {
      // Ignore
    }

    soundEngine.playChime();

    // Reset stopwatch after recording
    if (mode === "stopwatch") {
      setSeconds(0);
      setIsRunning(false);
      setSessionStartTime(null);
    }
  };

  // Sound controls
  const setAmbiance = (type: FocusAmbianceType) => {
    setAmbianceState(type);
    soundEngine.setAmbiance(type);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    soundEngine.setVolume(v);
  };

  const toggleAmbiance = (preferredType?: FocusAmbianceType) => {
    if (ambiance !== "none") {
      setAmbiance("none");
    } else {
      setAmbiance(preferredType || "rain");
    }
  };

  // Virtual Table Seats
  const sitAtSeat = (seatIndex: number, goalNote?: string) => {
    const sub = getSubjectById(selectedSubjectId);
    const finalGoal = goalNote || userGoalNote;
    setUserGoalNote(finalGoal);
    try {
      localStorage.setItem("bac_ypt_goal_note", finalGoal);
    } catch {
      // Ignore
    }

    setActiveSeat(seatIndex);
    setTableSeats((prev) =>
      prev.map((seat) => {
        if (seat.seatIndex === seatIndex) {
          return {
            ...seat,
            isCurrentUser: true,
            name: "أنت (طالب بكالوريا)",
            avatar: "🌟",
            wilaya: "الجزائر",
            streamLabel: "شعبتك",
            subjectId: sub.id,
            subjectName: sub.nameAr,
            subjectHex: sub.hexColor,
            elapsedMinutes: Math.floor(seconds / 60),
            stickyGoalNote: finalGoal,
          };
        } else if (seat.isCurrentUser) {
          // Free previous seat if moving
          return {
            ...seat,
            isCurrentUser: false,
            name: "مقعد شاغر",
            avatar: "🪑",
            wilaya: "",
            streamLabel: "",
            subjectId: "",
            subjectName: "مقعد فارغ",
            subjectHex: "#64748B",
            elapsedMinutes: 0,
            stickyGoalNote: "",
            waveCount: 0,
          };
        }
        return seat;
      })
    );

    // Auto-start timer if not already running
    if (!isRunning) {
      startTimer();
    }
  };

  const leaveSeat = () => {
    if (activeSeat === null) return;
    setTableSeats((prev) =>
      prev.map((s) =>
        s.seatIndex === activeSeat
          ? {
              ...s,
              isCurrentUser: false,
              name: "مقعد شاغر",
              avatar: "🪑",
              wilaya: "",
              streamLabel: "",
              subjectId: "",
              subjectName: "مقعد فارغ",
              subjectHex: "#64748B",
              elapsedMinutes: 0,
              stickyGoalNote: "",
              waveCount: 0,
            }
          : s
      )
    );
    setActiveSeat(null);
  };

  const sendFocusWave = (seatIndex: number) => {
    setTableSeats((prev) =>
      prev.map((s) => {
        if (s.seatIndex === seatIndex) {
          return {
            ...s,
            waveCount: s.waveCount + 1,
            isWaving: true,
          };
        }
        return s;
      })
    );

    // Reset wave ripple animation flag after 2.5 seconds
    setTimeout(() => {
      setTableSeats((prev) =>
        prev.map((s) => (s.seatIndex === seatIndex ? { ...s, isWaving: false } : s))
      );
    }, 2500);
  };

  // Tasks actions
  const addTask = (text: string, subjectId: string) => {
    const newTask: MustWinTask = {
      id: "task_" + Date.now(),
      text,
      subjectId,
      completed: false,
      priority: "high",
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    try {
      localStorage.setItem(`bac_ypt_tasks_${todayStr}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    try {
      localStorage.setItem(`bac_ypt_tasks_${todayStr}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    try {
      localStorage.setItem(`bac_ypt_tasks_${todayStr}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const setTargetHours = (hours: number) => {
    const mins = hours * 60;
    setTargetMinutesState(mins);
    try {
      localStorage.setItem("bac_ypt_target_minutes", String(mins));
    } catch {
      // Ignore
    }
  };

  const setUserStream = (stream: string) => {
    setUserStreamState(stream);
    try {
      localStorage.setItem("bac_ypt_user_stream", stream);
    } catch {
      // Ignore
    }
  };

  const toggleCurriculumStage = (unitId: string, stageId: string) => {
    const key = `${unitId}_${stageId}`;
    const nextVal = !curriculumProgress[key];
    const updated = { ...curriculumProgress, [key]: nextVal };
    setCurriculumProgress(updated);
    try {
      localStorage.setItem("bac_ypt_curriculum_progress", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const selectedSubject = getSubjectById(selectedSubjectId);

  return (
    <TimerContext.Provider
      value={{
        mode,
        pomodoroPhase,
        pomodoroWorkMinutes,
        pomodoroBreakMinutes,
        seconds,
        isRunning,
        selectedSubjectId,
        selectedSubject,
        isFullscreen,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        switchMode,
        setPomodoroPreset,
        selectSubject,
        recordCurrentSession,
        setIsFullscreen,
        ambiance,
        volume,
        setAmbiance,
        setVolume,
        toggleAmbiance,
        activeSeat,
        userGoalNote,
        tableSeats,
        sitAtSeat,
        leaveSeat,
        sendFocusWave,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        slots,
        sessions,
        targetMinutes,
        setTargetHours,
        streakDays,
        userStream,
        curriculumProgress,
        setUserStream,
        toggleCurriculumStage,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
