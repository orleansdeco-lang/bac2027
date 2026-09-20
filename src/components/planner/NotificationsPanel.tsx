"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerNotification, NotificationPreferences } from "@/lib/planner/types";
import { X, Bell, Moon, Sun, CheckCircle2, Heart, Sparkles, Clock, Compass } from "lucide-react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PlannerNotification[];
  preferences: NotificationPreferences;
  onToggleSpiritual: (enabled: boolean) => void;
  onMarkRead: (id: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  preferences,
  onToggleSpiritual,
  onMarkRead,
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md h-full shadow-2xl p-6 relative flex flex-col transition-all overflow-y-auto ${
          isGirls
            ? "bg-white text-[#4A2040]"
            : "bg-[#0F1B3B] text-slate-100 border-l border-[#1E3160]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isGirls
                  ? "bg-pink-100 text-[#E879A8]"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">
                Rappels & Notifications
              </h3>
              <p className="text-[11px] opacity-70">
                التنبيهات والمحفزات الذكية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full opacity-60 hover:opacity-100 transition-all hover:bg-slate-500/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spiritual Reminder Toggle */}
        <div
          className={`p-3.5 rounded-2xl border mb-5 flex items-center justify-between gap-3 ${
            isGirls
              ? "bg-pink-50/50 border-pink-200 text-pink-950"
              : "bg-[#142347] border-[#223668] text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold">التذكير بالأدعية والأذكار</div>
              <div className="text-[10px] opacity-70">نفحات إيمانية تزيدك بركة وهدوء</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSpiritual(!preferences.spiritual_reminders)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
              preferences.spiritual_reminders
                ? isGirls
                  ? "bg-[#E879A8]"
                  : "bg-[#0EA5E9]"
                : "bg-slate-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                preferences.spiritual_reminders ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Toutes les notifications sont à jour !</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isSpiritual = n.type === "spiritual";

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    n.is_read
                      ? "opacity-60 bg-slate-500/5 border-transparent"
                      : isSpiritual
                      ? isGirls
                        ? "bg-gradient-to-r from-pink-50/80 to-purple-50/80 border-pink-200 shadow-sm"
                        : "bg-gradient-to-r from-[#172750] to-[#1d274c] border-cyan-500/30 shadow-sm"
                      : isGirls
                      ? "bg-white border-pink-100 shadow-sm"
                      : "bg-[#16274e] border-[#223668] shadow-sm"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{n.title}</span>
                      {isSpiritual && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          روحي 🕌
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      {n.message}
                    </p>
                    {n.scheduled_time && (
                      <span className="text-[10px] font-mono opacity-50 block mt-1">
                        {n.scheduled_time}
                      </span>
                    )}
                  </div>

                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(n.id)}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                      title="Marquer comme lu"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
