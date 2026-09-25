"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  LogIn,
  LogOut,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  Tag,
  Share2,
  Calendar,
  Check,
  X,
  Plus,
} from "lucide-react";
import { PlannerStorage, getTodayDateString } from "@/lib/planner/storage";
import { useAuth } from "@/lib/auth/context";
import { formatStopwatch } from "./CozyMajlisDesk";

interface MajlisInspectorPanelProps {
  topic?: string;
  description?: string;
  tags?: string[];
  members?: {
    name: string;
    avatar: string;
    subject: string;
    subjectColor: string;
  }[];
  onJoin?: () => void;
  onLeave?: () => void;
  isJoined?: boolean;
  userElapsedSeconds?: number;
  currentUser?: {
    name: string;
    avatar: string;
    subject: string;
  } | null;
}

export function MajlisInspectorPanel({
  topic = "المتتاليات",
  description = "نناقش اليوم: حل التمارين + مراجعة الدرس - مواضيع البكالوريا",
  tags = ["رياضيات", "البكالوريا"],
  members = [
    {
      name: "سارة",
      avatar: "/illustrations/characters/sarah.jpg",
      subject: "علوم طبيعية",
      subjectColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "ياسين",
      avatar: "/illustrations/characters/yassine.jpg",
      subject: "رياضيات",
      subjectColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      name: "علي",
      avatar: "/illustrations/characters/ali.jpg",
      subject: "فيزياء",
      subjectColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
    {
      name: "مريم",
      avatar: "/illustrations/characters/mariam.jpg",
      subject: "فلسفة",
      subjectColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      name: "أمين",
      avatar: "/illustrations/characters/yassine.jpg",
      subject: "تاريخ",
      subjectColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
  ],
  onJoin,
  onLeave,
  isJoined = false,
  userElapsedSeconds = 0,
  currentUser = null,
}: MajlisInspectorPanelProps) {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState(`مجلس مذاكرة: ${topic} مع الزملاء`);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleTime, setScheduleTime] = useState("19:30");
  const [scheduleDuration, setScheduleDuration] = useState(45);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareTable = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/diwan?tab=majlis&tableId=${encodeURIComponent(
        topic
      )}&invite=true`;
      navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      showToast("تم نسخ رابط المجلس لدعوة زملائك! 🔗");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = user?.id || "demo-user";
    const now = new Date().toISOString();

    try {
      await PlannerStorage.saveEvent({
        id: `majlis-schedule-${Date.now()}`,
        userId: effectiveUserId,
        user_id: effectiveUserId,
        title: scheduleTitle,
        type: "STUDY",
        event_type: "study",
        date: scheduleDate,
        startTime: scheduleTime,
        start_time: scheduleTime,
        durationMinutes: scheduleDuration,
        duration_minutes: scheduleDuration,
        priority: "HIGH",
        status: "TODO",
        notes: `مجلس مذاكرة تفاعلي في ديوان العلم حول موضوع: ${topic}`,
        description: `مجلس مذاكرة تفاعلي في ديوان العلم حول موضوع: ${topic}`,
        source: "STUDY_MAJLIS",
        createdAt: now,
        created_at: now,
        updatedAt: now,
        updated_at: now,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("planner-events-changed"));
        window.dispatchEvent(new CustomEvent("must-win-updated"));
      }

      setIsScheduleModalOpen(false);
      showToast("تمت برمجة هذا المجلس بنجاح! سيظهر في مخططك اليومي ومركز القيادة 📅");
    } catch (err) {
      console.error("Failed to schedule majlis event:", err);
      showToast("حدث خطأ أثناء حفظ موعد المجلس في المخطط");
    }
  };

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl backdrop-blur-xl flex flex-col justify-between"
      style={{
        background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
      }}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Top Header Row with Status */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-300">معلومات المجلس</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>نشط الآن</span>
          </span>
        </div>

        {/* Topic Title */}
        <div className="mt-4">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {topic}
          </h3>
          <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[11px] font-semibold"
            >
              <Tag className="w-3 h-3 text-blue-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons: Join/Leave & Share & Schedule */}
        <div className="mt-5 space-y-2">
          {/* Primary Seat Action */}
          {isJoined ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      أنت جالس على الطاولة 🪑
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      جلسة المذاكرة جارية الآن
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatStopwatch(userElapsedSeconds)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLeave}
                className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>مغادرة المجلس (وحفظ وقت المذاكرة)</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onJoin}
              className="w-full py-3 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5 text-white" />
              <span>الانضمام إلى المجلس</span>
            </button>
          )}

          {/* Secondary Actions Row: Share Table & Schedule Majlis */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleShareTable}
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="مشاركة رابط المجلس مع الزملاء"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>مشاركة المجلس 🔗</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="برمجة موعد هذا المجلس في المخطط الدراسي"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>برمجة موعد 📅</span>
            </button>
          </div>
        </div>

        {/* Members List Sub-Section */}
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-300">أعضاء المجلس</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {members.length + (isJoined ? 1 : 0)} طلاب
            </span>
          </div>

          <div className="space-y-2 max-h-[190px] overflow-y-auto no-scrollbar pr-0.5">
            {/* If user joined, render user at the top */}
            {isJoined && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0">
                    <Image
                      src={currentUser?.avatar || "/illustrations/characters/ali.jpg"}
                      alt="أنت"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {currentUser?.name || "أنت (طالب بكالوريا)"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {formatStopwatch(userElapsedSeconds)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  أنت 🌟
                </span>
              </div>
            )}

            {members.map((mem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-400/80 shrink-0">
                    <Image
                      src={mem.avatar}
                      alt={mem.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {mem.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mem.subjectColor}`}
                >
                  {mem.subject}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Majlis Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(180deg, #0B1222 0%, #070B14 100%)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  برمجة موعد هذا المجلس في المخطط 📅
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان الجلسة</label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الوقت</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المدة (بالدقائق)</label>
                <select
                  value={scheduleDuration}
                  onChange={(e) => setScheduleDuration(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-[#101B33] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value={30}>30 دقيقة</option>
                  <option value={45}>45 دقيقة (افتراضي)</option>
                  <option value={60}>60 دقيقة (ساعة كاملة)</option>
                  <option value={90}>90 دقيقة (جلسة مكثفة)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  حفظ في المخطط الدراسي 📅
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 text-slate-300 font-bold text-xs hover:bg-white/15 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
