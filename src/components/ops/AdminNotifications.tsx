"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  UserPlus,
  CreditCard,
  Truck,
  Volume2,
  VolumeX,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";

export interface NotificationItem {
  id: string;
  type: "NEW_STUDENT_SIGNUP" | "NEW_PAYMENT_ORDER" | "NEW_COD_ORDER";
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorPhone?: string;
  amount?: number;
  wilaya?: string;
  actionUrl: string;
}

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

const ALERTED_STORAGE_KEY = "shater_ops_alerted_notif_ids";

function getAlertedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ALERTED_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveAlertedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(ids).slice(-200); // retain last 200 IDs
    localStorage.setItem(ALERTED_STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setBrowserNotifEnabled(perm === "granted");
      if (perm === "granted") {
        new Notification("الشاطر - مركز العمليات", {
          body: "تم تفعيل الإشعارات الفورية للمدير بنجاح 🚀",
          icon: "/icon.svg",
        });
      }
    }
  };

  const fetchNotifications = async (initial: boolean = false) => {
    try {
      const res = await opsFetch("/api/ops/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.notifications)) {
        const list: NotificationItem[] = data.notifications;
        setNotifications(list);
        setUnreadCount(data.unreadCount || 0);

        const alerted = getAlertedIds();

        if (initial) {
          // Mark all existing notifications as alerted on startup/refresh
          list.forEach((item) => alerted.add(item.id));
          saveAlertedIds(alerted);
        } else if (list.length > 0) {
          // Strictly alert for fresh events (< 3 minutes old) not yet alerted
          const freshNewItems = list.filter((item) => {
            if (alerted.has(item.id)) return false;
            const diffMs = Date.now() - new Date(item.timestamp).getTime();
            return diffMs >= 0 && diffMs < 3 * 60 * 1000;
          });

          if (freshNewItems.length > 0) {
            const newest = freshNewItems[0];
            if (soundEnabled) {
              playNotificationChime();
            }
            if (typeof window !== "undefined" && Notification.permission === "granted") {
              new Notification(newest.title, {
                body: `${newest.description} (${newest.actorName})`,
                icon: "/icon.svg",
              });
            }

            freshNewItems.forEach((item) => alerted.add(item.id));
            saveAlertedIds(alerted);
          }
        }
      }
    } catch {}
  };

  // Initial fetch and polling every 12 seconds
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
        title="إشعارات الإدارة"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono font-black text-[10px] flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          dir="rtl"
          className="absolute left-0 sm:right-auto mt-2 w-80 sm:w-96 rounded-2xl bg-[#0B132B]/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl z-50 overflow-hidden text-slate-200 text-xs"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">إشعارات الإدارة الحية</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold">
                {notifications.length} إشعار
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={soundEnabled ? "كتم صوت التنبيه" : "تفعيل صوت التنبيه"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {!browserNotifEnabled && (
                <button
                  type="button"
                  onClick={requestBrowserPermission}
                  className="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 font-semibold text-[10px] transition-all"
                  title="تفعيل إشعارات المتصفح"
                >
                  إشعارات المتصفح
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-1">
                <Bell className="w-6 h-6 mx-auto opacity-30" />
                <p>لا توجد إشعارات بعد</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl}
                  onClick={() => setIsOpen(false)}
                  className="p-3 flex items-start gap-3 hover:bg-slate-800/50 transition-colors block"
                >
                  <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-slate-900 border border-slate-800">
                    {n.type === "NEW_STUDENT_SIGNUP" && (
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                    )}
                    {n.type === "NEW_PAYMENT_ORDER" && (
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    )}
                    {n.type === "NEW_COD_ORDER" && (
                      <Truck className="w-4 h-4 text-purple-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white text-xs truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatRelativeTime(n.timestamp)}</span>
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                      {n.description}
                    </p>

                    {n.actorPhone && (
                      <span className="text-[10px] text-cyan-400 font-mono block" dir="ltr">
                        {n.actorPhone}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
