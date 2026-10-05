"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  HelpCircle,
  Zap,
  Target,
  Map,
  Wrench,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface QuickOperatingBarProps {
  isAr: boolean;
}

export function QuickOperatingBar({ isAr }: QuickOperatingBarProps) {
  const tools = [
    {
      title: isAr ? "المخطط" : "Planning",
      href: "/planner",
      icon: Calendar,
    },
    {
      title: isAr ? "المواضيع والامتحانات" : "Sujets & Examens",
      href: "/exam",
      icon: Target,
    },
    {
      title: isAr ? "الملخصات والدروس" : "Cours & Résumés",
      href: "/curriculum",
      icon: BookOpen,
    },
    {
      title: isAr ? "ديوان الأسئلة" : "Diwan Questions",
      href: "/diwan",
      icon: HelpCircle,
    },
    {
      title: isAr ? "مختبر الأخطاء" : "Lab d'erreurs",
      href: "/student/error-lab",
      icon: Wrench,
    },
    {
      title: isAr ? "الاسترجاع السريع" : "Rappel actif",
      href: "/student/arena/quick-recall",
      icon: Zap,
    },
    {
      title: isAr ? "خريطة الشعبة" : "Feuille de route",
      href: "/roadmap",
      icon: Map,
    },
  ];

  return (
    <nav
      aria-label={isAr ? "أدوات العمل والمراجعة" : "Outils rapides"}
      className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between border-b border-theme/60 pb-2">
        <span className="text-xs font-bold text-theme-muted uppercase tracking-wider font-mono">
          {isAr ? "أدوات العمل السريعة" : "OUTILS DE TRAVAIL"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-2.5 rounded-xl bg-surface border border-theme hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center gap-2 group transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-theme-muted group-hover:text-theme-text shrink-0 transition-colors" />
              <span className="text-xs font-medium text-theme-secondary group-hover:text-theme-text truncate transition-colors">
                {tool.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
