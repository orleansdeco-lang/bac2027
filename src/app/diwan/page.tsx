"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { MajlisWorkspace } from "@/components/diwan/MajlisWorkspace";
import { ExperiencesView } from "@/components/experiences/ExperiencesView";
import { DiwanSharedSummariesTab } from "@/components/diwan/DiwanSharedSummariesTab";
import { useAuth } from "@/lib/auth/context";
import {
  Landmark,
  MessageSquareQuote,
  FileText,
  UserPlus,
  LogIn,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

export type DiwanSubTab = "majlis" | "experiences" | "summaries";

function DiwanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const tabParam = searchParams?.get("tab") as DiwanSubTab | null;
  const isInvite = searchParams?.get("invite") === "true";
  const [activeTab, setActiveTab] = useState<DiwanSubTab>(
    tabParam === "experiences" || tabParam === "summaries" || tabParam === "majlis"
      ? tabParam
      : "majlis"
  );
  const [showInviteBanner, setShowInviteBanner] = useState(isInvite && !user);

  useEffect(() => {
    if (tabParam && (tabParam === "experiences" || tabParam === "summaries" || tabParam === "majlis")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (isInvite && !user) {
      setShowInviteBanner(true);
    }
  }, [isInvite, user]);

  const handleTabChange = (tab: DiwanSubTab) => {
    setActiveTab(tab);
    router.replace(`/diwan?tab=${tab}`, { scroll: false });
  };

  const tabs: { id: DiwanSubTab; label: string; icon: React.ElementType; badge?: string }[] = [
    {
      id: "majlis",
      label: "مجالس العلم (3D Study Majlis)",
      icon: Landmark,
      badge: "3D تفاعلي",
    },
    {
      id: "experiences",
      label: "تجارب ونصائح الطلاب",
      icon: MessageSquareQuote,
      badge: "تجارب متفوقين",
    },
    {
      id: "summaries",
      label: "المواضيع والملخصات التشاركية",
      icon: FileText,
      badge: "مساهمات حصرية",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6" dir="rtl">
        {/* Friend Invite Authentication Gate Banner */}
        {showInviteBanner && !user && (
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-950/90 border border-blue-400/40 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center shrink-0 text-blue-300">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    دعوة دراسة خاصة 💌
                  </span>
                  <span className="text-xs text-blue-200">مجلس المذاكرة التفاعلي</span>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  يجب تسجيل الدخول للانضمام إلى مجلس المذاكرة مع زميلك 🏛️
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  احجز مقعدك على الطاولة، شارك زملاءك حل التمارين، وتنافس في كويزات المنهاج الوزاري.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Link
                href="/auth"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </Link>
              <Link
                href="/auth/register"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إنشاء حساب مجاني</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowInviteBanner(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top Hub Sub-Tabs Selector */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-theme shadow-md overflow-x-auto no-scrollbar max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                      : "text-theme-secondary hover:text-theme-text hover:bg-surface-elevated border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-surface-soft text-theme-muted border border-theme"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: مجالس العلم (3D Study Majlis) */}
        {activeTab === "majlis" && <MajlisWorkspace />}

        {/* Tab 2: تجارب ونصائح الطلاب */}
        {activeTab === "experiences" && (
          <div className="animate-in fade-in duration-200">
            <ExperiencesView embedded={true} />
          </div>
        )}

        {/* Tab 3: المواضيع والملخصات التشاركية */}
        {activeTab === "summaries" && (
          <div className="animate-in fade-in duration-200">
            <DiwanSharedSummariesTab />
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function DiwanPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex flex-col items-center justify-center min-h-[500px]" dir="rtl">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-theme-muted font-bold">جاري تحميل ديوان العلم...</p>
          </div>
        </AppShell>
      }
    >
      <DiwanContent />
    </Suspense>
  );
}
