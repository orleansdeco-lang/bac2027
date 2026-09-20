"use client";

import React from "react";
import { PlannerNotification, NotificationPreferences } from "@/lib/planner/types";
import { X, Bell, CheckCircle2, Compass } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in text-start">
      <div className="w-full max-w-md h-full shadow-2xl p-6 relative flex flex-col transition-all overflow-y-auto bg-card text-theme-text border-r border-theme">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-theme-text">
                التنبيهات والإشعارات
              </h3>
              <p className="text-[11px] text-theme-secondary font-medium">
                تذكيرات ذكية لجلساتك وأوقات تركيزك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spiritual Reminder Toggle */}
        <div className="p-3.5 rounded-2xl border border-theme bg-surface mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-theme-text">التذكير بالأدعية والأذكار</div>
              <div className="text-[10px] text-theme-secondary font-medium">نفحات إيمانية تزيدك بركة وهدوء</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSpiritual(!preferences.spiritual_reminders)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
              preferences.spiritual_reminders
                ? "bg-[var(--color-primary)] justify-end"
                : "bg-surface border border-theme justify-start"
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-theme-muted text-xs font-medium">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-primary)]" />
              <p>كل التنبيهات محدثة ولا توجد إشعارات جديدة.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isSpiritual = n.type === "spiritual";

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    n.is_read
                      ? "opacity-60 bg-surface/40 border-theme/40"
                      : isSpiritual
                      ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)]/30 shadow-xs"
                      : "bg-surface border-theme shadow-xs"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-theme-text">{n.title}</span>
                      {isSpiritual && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          روحي 🕌
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-theme-secondary leading-relaxed font-medium">
                      {n.message}
                    </p>
                    {n.scheduled_time && (
                      <span className="text-[10px] font-mono text-theme-muted block mt-1">
                        {n.scheduled_time}
                      </span>
                    )}
                  </div>

                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(n.id)}
                      className="p-1 text-theme-muted hover:text-emerald-600 transition-colors cursor-pointer"
                      title="تعليم كمقروء"
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
