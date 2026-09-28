"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

interface MajlisReport {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  reported_user_name?: string;
  room_id?: string;
  reason: string;
  details?: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";
  action_taken?: string;
  created_at: string;
}

export default function OpsMajlisModerationPage() {
  const [reports, setReports] = useState<MajlisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingOfficialRoom, setIsSubmittingOfficialRoom] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form for creating official scheduled room
  const [officialTitle, setOfficialTitle] = useState("مجلس المساء الرسمي — مراجعة المتتاليات والدوال");
  const [officialStream, setOfficialStream] = useState("sciences_exp");
  const [officialSubject, setOfficialSubject] = useState("math");
  const [officialLesson, setOfficialLesson] = useState("المتتاليات العددية ودراسة الدوال");
  const [officialRecurringTime, setOfficialRecurringTime] = useState("20:00");

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await opsFetch("/api/campus/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreateOfficialRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOfficialRoom(true);
    setStatusMessage(null);
    try {
      const res = await opsFetch("/api/campus/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: officialTitle,
          stream: officialStream,
          subjectId: officialSubject,
          lesson: officialLesson,
          mode: "PAPER_PRACTICE",
          capacity: 6,
          isOfficial: true,
          recurringTime: officialRecurringTime,
        }),
      });

      if (res.ok) {
        setStatusMessage("✅ تم إنشاء وتثبيت المجلس الرسمي المجدول بنجاح!");
      } else {
        const data = await res.json();
        setStatusMessage(`❌ حدث خطأ: ${data.message || data.error}`);
      }
    } catch (err) {
      setStatusMessage("❌ تعذر الاتصال بالخادم.");
    } finally {
      setIsSubmittingOfficialRoom(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              إدارة ورقابة مجالس العلم (Diwan Ops & Moderation)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مركز مراجعة بلاغات الطلاب، جدولة المجالس الرسمية، وتأمين بيئة دراسية محترمة 100%.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>تحديث البلاغات</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold">
          {statusMessage}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Moderation Reports (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl p-5 border border-white/[0.08] bg-[#0B1222]/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">بلاغات الطلاب المعلقة</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {reports.length} بلاغ مسجل
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              جاري فحص قاعدة البيانات...
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <p className="text-xs font-bold text-slate-300">
                لا توجد أي بلاغات حالياً. بيئة مجالس العلم نظيفة وهادئة 🌟
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">
                      المبلّغ عنه: {report.reported_user_name || report.reported_user_id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono">
                      {report.reason}
                    </span>
                  </div>
                  {report.details && (
                    <p className="text-slate-300 text-[11px] leading-relaxed bg-black/20 p-2 rounded-xl">
                      {report.details}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>
                      تاريخ البلاغ: {new Date(report.created_at).toLocaleString("ar-DZ")}
                    </span>
                    <span className="font-bold text-amber-400">
                      الحالة: {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Schedule Official Majlis Table Tool (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl p-5 border border-white/[0.08] bg-[#0B1222]/90 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">جدولة مجلس رسمي للمنصة</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            أنشئ مجلساً رسمياً مجدولاً لشعبة معينة في موعد محدد (مثل المساء 20:00). يجتمع الطلاب في نفس الوقت فتمتلئ الطاولة دون وهم.
          </p>

          <form onSubmit={handleCreateOfficialRoom} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عنوان المجلس الرسمي
              </label>
              <input
                type="text"
                required
                value={officialTitle}
                onChange={(e) => setOfficialTitle(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الشعبة
                </label>
                <select
                  value={officialStream}
                  onChange={(e) => setOfficialStream(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white"
                >
                  <option value="sciences_exp">علوم تجريبية</option>
                  <option value="math">رياضيات</option>
                  <option value="technique_math">تقني رياضي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الموعد المتكرر
                </label>
                <input
                  type="time"
                  required
                  value={officialRecurringTime}
                  onChange={(e) => setOfficialRecurringTime(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الدرس والموضوع
              </label>
              <input
                type="text"
                required
                value={officialLesson}
                onChange={(e) => setOfficialLesson(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingOfficialRoom}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isSubmittingOfficialRoom ? "جاري الإنشاء..." : "إنشاء المجلس الرسمي"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
