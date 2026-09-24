"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Bell,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  Shield,
  BookOpen,
} from "lucide-react";
import { NotificationPreferences } from "@/types/recall";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import {
  isPushNotificationSupported,
  getPushPermissionState,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  triggerTestPushNotification,
} from "@/lib/notifications/web-push-client";

interface RecallTrainerSettingsCardProps {
  userId: string;
  className?: string;
  onPreferencesUpdated?: (prefs: NotificationPreferences) => void;
}

export function RecallTrainerSettingsCard({
  userId,
  className = "",
  onPreferencesUpdated,
}: RecallTrainerSettingsCardProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [pushSupported, setPushSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<string>("default");

  useEffect(() => {
    async function init() {
      setPushSupported(isPushNotificationSupported());
      const perm = await getPushPermissionState();
      setPermissionState(perm);

      try {
        const prefs = await RecallRepository.getNotificationPreferences(userId);
        setPreferences(prefs);
      } catch (err) {
        console.error("Failed to load recall preferences:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) init();
  }, [userId]);

  const handleToggleActive = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const nextActive = !preferences.is_active;

      if (nextActive && !preferences.push_subscription) {
        // Request subscription
        const res = await subscribeToPushNotifications(userId);
        if (res.success) {
          setPermissionState("granted");
          const updated = await RecallRepository.getNotificationPreferences(userId);
          setPreferences(updated);
          onPreferencesUpdated?.(updated);
        } else {
          setTestMessage({ text: res.error || "فشل الاشتراك في الإشعارات", isSuccess: false });
        }
      } else if (!nextActive) {
        await unsubscribeFromPushNotifications(userId);
        const updated = await RecallRepository.saveNotificationPreferences({
          user_id: userId,
          is_active: false,
        });
        setPreferences(updated);
        onPreferencesUpdated?.(updated);
      } else {
        const updated = await RecallRepository.saveNotificationPreferences({
          user_id: userId,
          is_active: nextActive,
        });
        setPreferences(updated);
        onPreferencesUpdated?.(updated);
      }
    } catch (err: any) {
      setTestMessage({ text: err?.message || "حدث خطأ أثناء حفظ الإعدادات", isSuccess: false });
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (frequency: 30 | 60 | 120) => {
    if (!preferences) return;
    setSaving(true);
    try {
      const updated = await RecallRepository.saveNotificationPreferences({
        user_id: userId,
        frequency_minutes: frequency,
      });
      setPreferences(updated);
      onPreferencesUpdated?.(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleHoursChange = async (start: string, end: string) => {
    if (!preferences) return;
    setSaving(true);
    try {
      const updated = await RecallRepository.saveNotificationPreferences({
        user_id: userId,
        active_hours_start: start,
        active_hours_end: end,
      });
      setPreferences(updated);
      onPreferencesUpdated?.(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSubject = async (subject: string) => {
    if (!preferences) return;
    const current = preferences.enabled_subjects || [];
    const next = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];

    setSaving(true);
    try {
      const updated = await RecallRepository.saveNotificationPreferences({
        user_id: userId,
        enabled_subjects: next,
      });
      setPreferences(updated);
      onPreferencesUpdated?.(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setTestMessage(null);
    try {
      const res = await triggerTestPushNotification(userId);
      setTestMessage({ text: res.message, isSuccess: res.success });
    } catch (err: any) {
      setTestMessage({ text: err?.message || "تعذر إرسال الإشعار التجريبي", isSuccess: false });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !preferences) {
    return (
      <Card className={`p-6 border border-theme bg-surface/50 animate-pulse ${className}`}>
        <div className="h-6 w-48 bg-theme-border/40 rounded mb-4" />
        <div className="h-4 w-full bg-theme-border/20 rounded mb-3" />
        <div className="h-10 w-32 bg-theme-border/30 rounded" />
      </Card>
    );
  }

  const allSubjects = ["تاريخ", "جغرافيا", "إسلامية", "فلسفة"];

  return (
    <Card className={`p-5 sm:p-6 border border-theme bg-surface/80 backdrop-blur-md relative overflow-hidden shadow-lg ${className}`}>
      {/* Decorative gradient banner */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-[var(--color-primary)] to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/20 shadow-inner">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-theme-text">المدرب الذكي للاسترجاع والتكرار المتباعد</h3>
              <Badge variant="primary" size="sm" className="font-mono">
                Active Recall
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
              إرسال أسئلة سريعة دورية عبر شاشة القفل والإشعارات لتثبيت معلومات البكالوريا ومنع النسيان.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <button
          onClick={handleToggleActive}
          disabled={saving}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            preferences.is_active
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-surface-elevated text-theme-muted border-theme-border hover:bg-surface-hover"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              preferences.is_active ? "bg-emerald-500 animate-ping" : "bg-zinc-400"
            }`}
          />
          <span>{preferences.is_active ? "المدرب مُفعّل ⚡" : "المدرب مُعطّل"}</span>
        </button>
      </div>

      {/* Frequency selector */}
      <div className="mb-6 bg-surface-elevated/40 p-4 rounded-xl border border-theme-border/50">
        <label className="block text-xs sm:text-sm font-semibold text-theme-text mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--color-primary)]" />
          <span>تكرار إرسال الأسئلة:</span>
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { value: 30, label: "كل 30 دقيقة", desc: "وتيرة مكثفة" },
            { value: 60, label: "كل ساعة (60د)", desc: "الموصى به", recommended: true },
            { value: 120, label: "كل ساعتين (120د)", desc: "وتيرة هادئة" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleFrequencyChange(item.value as 30 | 60 | 120)}
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                preferences.frequency_minutes === item.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold shadow-sm"
                  : "border-theme-border/60 hover:bg-surface-elevated text-theme-muted"
              }`}
            >
              <div className="text-xs sm:text-sm">{item.label}</div>
              <div className="text-[10px] text-theme-muted mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Hours Range */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-elevated/40 p-3.5 rounded-xl border border-theme-border/50">
          <label className="block text-xs font-semibold text-theme-muted mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-theme-muted" />
            <span>بداية فترة النشاط اليومي:</span>
          </label>
          <input
            type="time"
            value={preferences.active_hours_start}
            onChange={(e) => handleHoursChange(e.target.value, preferences.active_hours_end)}
            className="w-full bg-surface border border-theme-border rounded-lg px-3 py-1.5 text-sm font-mono text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="bg-surface-elevated/40 p-3.5 rounded-xl border border-theme-border/50">
          <label className="block text-xs font-semibold text-theme-muted mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-theme-muted" />
            <span>نهاية فترة النشاط اليومي:</span>
          </label>
          <input
            type="time"
            value={preferences.active_hours_end}
            onChange={(e) => handleHoursChange(preferences.active_hours_start, e.target.value)}
            className="w-full bg-surface border border-theme-border rounded-lg px-3 py-1.5 text-sm font-mono text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Enabled subjects checklist */}
      <div className="mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-theme-text mb-2.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
          <span>المواد المشمولة في الاسترجاع الدوري:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map((subj) => {
            const isChecked = (preferences.enabled_subjects || []).includes(subj);
            return (
              <button
                key={subj}
                type="button"
                onClick={() => handleToggleSubject(subj)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                  isChecked
                    ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary)]"
                    : "bg-surface-elevated/60 border-theme-border text-theme-muted hover:text-theme-text"
                }`}
              >
                <span>{isChecked ? "✓" : "+"}</span>
                <span>{subj}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Push status & Test button */}
      <div className="pt-4 border-t border-theme-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Bell className="w-4 h-4 text-theme-muted" />
          <span>حالة إذن الإشعارات:</span>
          {permissionState === "granted" ? (
            <Badge variant="success" size="sm">
              مفعّلة (مسموح)
            </Badge>
          ) : permissionState === "denied" ? (
            <Badge variant="danger" size="sm">
              محظورة من المتصفح
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              تتطلب الإذن
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTestNotification}
          disabled={testing || !preferences.is_active}
          className="gap-2 text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testing ? "جاري الإرسال..." : "إرسال إشعار تجريبي فوري ⚡"}</span>
        </Button>
      </div>

      {/* Test feedback banner */}
      {testMessage && (
        <div
          className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 border ${
            testMessage.isSuccess
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          }`}
        >
          {testMessage.isSuccess ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{testMessage.text}</span>
        </div>
      )}
    </Card>
  );
}
