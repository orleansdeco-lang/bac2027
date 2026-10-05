"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  WifiOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { formatTrialCountdown } from "@/lib/access";

interface TodayHeaderProps {
  studentName: string;
  streamNameAr: string;
  streamNameFr: string;
  isAr: boolean;
  plannedTasksCount: number;
  totalPlannedMinutes: number;
  completedTasksCount: number;
  accessStatus?: string;
  remainingHours?: number;
  isOffline: boolean;
  rejectedReason?: string;
}

export function TodayHeader({
  studentName,
  streamNameAr,
  streamNameFr,
  isAr,
  plannedTasksCount,
  totalPlannedMinutes,
  completedTasksCount,
  accessStatus,
  remainingHours,
  isOffline,
  rejectedReason,
}: TodayHeaderProps) {
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12
    ? (isAr ? "صباح الخير" : "Bonjour")
    : (isAr ? "مساء الخير" : "Bonsoir");

  // Formatted Algerian Date
  const todayFormatted = new Date().toLocaleDateString(isAr ? "ar-DZ" : "fr-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isAllPlannedCompleted = plannedTasksCount > 0 && completedTasksCount >= plannedTasksCount;

  return (
    <header className="space-y-3" aria-label={isAr ? "ترويسة اليوم" : "En-tête de la journée"}>
      {/* 1. RESTRAINED SYSTEM STATUS BANNERS (ONLY WHEN NEEDED) */}
      {isOffline && (
        <div
          role="status"
          className="px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center gap-2 text-xs text-zinc-300 shadow-sm"
        >
          <WifiOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>
            {isAr
              ? "آخر بيانات محفوظة · غير متصل بالإنترنت (وضع القراءة فقط)"
              : "Données locales en cache · Hors ligne"}
          </span>
        </div>
      )}

      {accessStatus === "REJECTED" ? (
        <div
          data-testid="dashboard-rejected-banner"
          className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold text-rose-700 dark:text-rose-300 block">
                {isAr ? "تم رفض وصل الدفع المرسل" : "Reçu de paiement rejeté"}
              </span>
              <span className="text-rose-600/90 dark:text-rose-400/90 text-[11px]">
                {rejectedReason || (isAr ? "الوصل غير واضح أو لم يتم تأكيد التحويل" : "Reçu non confirmé")}
              </span>
            </div>
          </div>
          <Link
            href="/subscribe"
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
          >
            {isAr ? "إعادة إرسال الوصل" : "Renvoyer"}
          </Link>
        </div>
      ) : accessStatus === "TRIAL_EXPIRED" ? (
        <div
          data-testid="dashboard-trial-expired-banner"
          className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in"
        >
          <div className="space-y-0.5">
            <span className="font-bold text-amber-800 dark:text-amber-300 block">
              {isAr ? "انتهت الفترة التجريبية (72 ساعة)" : "Période d'essai terminée"}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px] block">
              {isAr
                ? "جميع بياناتك ومسارك محفوظ. جدد الاشتراك لمواصلة المهام المقررة."
                : "Vos données sont sauvegardées. Activez votre pass pour continuer."}
            </span>
          </div>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
          >
            <span>{isAr ? "تفعيل الاشتراك" : "Activer"}</span>
            <NextArrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : null}

      {/* 2. RESTRAINED OPERATING HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-xs">
        {/* Left: Subtle Greeting + Algerian Date + Stream Tag */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-theme-text tracking-tight font-sans">
              {timeGreeting}، {studentName}
            </h1>

            {/* Stream badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface border border-theme text-theme-secondary font-sans">
              {isAr ? streamNameAr : streamNameFr}
            </span>

            {/* Trial Active Pill */}
            {accessStatus === "TRIAL_ACTIVE" && remainingHours !== undefined && (
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
              >
                <Clock className="w-3 h-3 text-amber-500" />
                <span>
                  {isAr
                    ? `فترة التجربة: متبقي ${formatTrialCountdown(remainingHours, true)}`
                    : `Essai: reste ${formatTrialCountdown(remainingHours, false)}`}
                </span>
              </Link>
            )}

            {/* Subscribed Badge */}
            {accessStatus === "SUBSCRIBED" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{isAr ? "اشتراك مفعل" : "Pass Actif"}</span>
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-theme-muted font-sans">
            <Calendar className="w-3.5 h-3.5 text-theme-muted" />
            <span>اليوم: {todayFormatted}</span>
          </div>
        </div>

        {/* Right: Academic Status Pill */}
        <div className="self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-theme text-xs flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isAllPlannedCompleted
                  ? "bg-emerald-500"
                  : plannedTasksCount > 0
                  ? "bg-[var(--color-primary)]"
                  : "bg-zinc-400"
              }`}
            />
            <span className="font-medium text-theme-text text-[11px] sm:text-xs">
              {plannedTasksCount > 0
                ? isAr
                  ? `الخطة اليوم: ${plannedTasksCount} مهام · ${totalPlannedMinutes} دقيقة`
                  : `Programme : ${plannedTasksCount} tâches · ${totalPlannedMinutes} min`
                : isAr
                ? "لا توجد مهام مجدولة لليوم"
                : "Aucune tâche planifiée"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
