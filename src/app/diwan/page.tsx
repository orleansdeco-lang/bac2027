"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { MajlisWorkspace } from "@/components/diwan/MajlisWorkspace";
import { ExperiencesView } from "@/app/experiences/page";
import { ExamsView } from "@/app/exams/page";
import { Landmark, MessageSquareQuote, FileText, Sparkles } from "lucide-react";

export type DiwanSubTab = "majlis" | "experiences" | "exams";

function DiwanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get("tab") as DiwanSubTab | null;
  const [activeTab, setActiveTab] = useState<DiwanSubTab>(
    tabParam === "experiences" || tabParam === "exams" || tabParam === "majlis"
      ? tabParam
      : "majlis"
  );

  useEffect(() => {
    if (tabParam && (tabParam === "experiences" || tabParam === "exams" || tabParam === "majlis")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      label: "بنك التجارب والنصائح",
      icon: MessageSquareQuote,
      badge: "تجارب متفوقين",
    },
    {
      id: "exams",
      label: "المواضيع والملخصات",
      icon: FileText,
      badge: "رسمي 2008-2024",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6" dir="rtl">
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

        {/* Tab 2: بنك التجارب والنصائح (Original Intact Repository) */}
        {activeTab === "experiences" && (
          <div className="animate-in fade-in duration-200">
            <ExperiencesView embedded={true} />
          </div>
        )}

        {/* Tab 3: المواضيع والملخصات (Official Summaries and Exams) */}
        {activeTab === "exams" && (
          <div className="animate-in fade-in duration-200">
            <ExamsView embedded={true} />
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
