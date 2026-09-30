"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch, useAdminSession } from "@/lib/admin/client";
import {
  MessageSquare,
  Users,
  Lock,
  Unlock,
  Archive,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface StudyRoom {
  id: string;
  name: string;
  topic?: string;
  subject?: string;
  host_name?: string;
  participant_count: number;
  max_participants: number;
  is_locked: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminStudyRoomsPage() {
  const { hasPermission } = useAdminSession();
  const canManage = hasPermission("study_rooms.manage");

  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/study-rooms");
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        setError(data.error || "تعذر جلب غرف مجلس العلم");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const toggleRoomLock = async (roomId: string, currentLocked: boolean) => {
    if (!canManage) return;
    try {
      const res = await adminFetch("/api/admin/study-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          updates: { is_locked: !currentLocked },
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRooms();
      } else {
        alert(data.error || "فشل تعديل حالة القفل");
      }
    } catch (err: any) {
      alert(err?.message || "خطأ في العملية");
    }
  };

  const archiveRoom = async (roomId: string) => {
    if (!canManage) return;
    if (!confirm("هل أنت متأكد من إنهاء وأرشفة هذه الغرفة؟")) return;
    try {
      const res = await adminFetch("/api/admin/study-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          updates: { is_active: false },
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRooms();
      } else {
        alert(data.error || "فشل أرشفة الغرفة");
      }
    } catch (err: any) {
      alert(err?.message || "خطأ في العملية");
    }
  };

  const activeRooms = rooms.filter((r) => r.is_active);
  const totalParticipants = rooms.reduce((sum, r) => sum + (r.participant_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>إدارة غرف المذاكرة الحية (مجلس العلم)</span>
          </h2>
          <p className="text-xs text-slate-400">
            مراقبة غرف المذاكرة الجماعية اللحظية، ضبط السلوك، وإدارة صلاحيات الانضمام.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeRooms.length} غرفة نشطة
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {totalParticipants} مشارك لحظي
          </span>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري فحص غرف مجلس العلم...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد غرف نشطة حالياً في مجلس العلم.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">اسم الغرفة / الموضوع</th>
                  <th className="p-4">المادة</th>
                  <th className="p-4">المضيف</th>
                  <th className="p-4">المشاركون</th>
                  <th className="p-4">الحالة</th>
                  {canManage && <th className="p-4">إدارة الغرفة</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{room.name}</div>
                      <div className="text-[11px] text-slate-400">{room.topic || "مذاكرة عامة"}</div>
                    </td>
                    <td className="p-4 text-slate-300">{room.subject || "عام"}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {room.host_name || "طالب شاطر"}
                    </td>
                    <td className="p-4 font-mono">
                      <span className="text-emerald-400 font-bold">{room.participant_count}</span>
                      <span className="text-slate-500"> / {room.max_participants || 50}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {room.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            نشطة
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            مؤرشفة
                          </span>
                        )}
                        {room.is_locked && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>مقفلة</span>
                          </span>
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRoomLock(room.id, room.is_locked)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title={room.is_locked ? "فتح الغرفة" : "قفل الغرفة لمنع الانضمام"}
                          >
                            {room.is_locked ? (
                              <Unlock className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                          {room.is_active && (
                            <button
                              onClick={() => archiveRoom(room.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="إنهاء وأرشفة الغرفة"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
