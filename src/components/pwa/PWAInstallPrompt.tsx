"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_STORAGE_KEY = "bac_pwa_install_dismissed_at";
const DISMISS_DURATION_DAYS = 7;

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // 2. Check if user dismissed recently
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedAt) {
        const diffMs = Date.now() - Number(dismissedAt);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < DISMISS_DURATION_DAYS) {
          return;
        }
      }

      // 3. Listen for beforeinstallprompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      // 4. Listen for appinstalled
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsVisible(false);
        setDeferredPrompt(null);
      };

      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsVisible(false);
      } else {
        // User dismissed the browser prompt
        handleDismiss();
      }
    } catch (err) {
      console.error("Installation prompt error:", err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
    }
  };

  if (!isVisible || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div
      data-testid="pwa-install-banner"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-6 sm:bottom-6 z-50 max-w-md animate-slide-up"
      dir="rtl"
    >
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-[#0F172A]/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl text-white space-y-3">
        {/* Clay ambient glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">
                  تثبيت تطبيق BAC Mastery على هاتفك
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  تطبيق أصيل
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تجربة أسرع بدون متصفح، وصول فوري لدروسك ومهماتك اليومية من الشاشة الرئيسية.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
            aria-label="إغلاق إشعار التثبيت"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 pt-1">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1 font-bold rounded-xl py-2.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalling ? "جاري التثبيت..." : "تثبيت الآن"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className="rounded-xl py-2.5 px-4 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
          >
            <span>لاحقاً</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
