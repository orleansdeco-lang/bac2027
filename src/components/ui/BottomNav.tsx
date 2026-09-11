"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Compass, Map, Target, BarChart3 } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useTranslation();

  const navItems = [
    {
      href: "/",
      label: locale === "ar" ? "الرئيسية" : "Accueil",
      icon: Compass,
      matches: (p: string) => p === "/",
    },
    {
      href: "/roadmap",
      label: locale === "ar" ? "الخريطة" : "La Route",
      icon: Map,
      matches: (p: string) => p.startsWith("/roadmap"),
    },
    {
      href: "/roadmap#now",
      label: locale === "ar" ? "المهمات" : "Missions",
      icon: Target,
      matches: (p: string) => p.startsWith("/mission"),
    },
    {
      href: "/error-lab",
      label: locale === "ar" ? "تقدمي" : "Progrès",
      icon: BarChart3,
      matches: (p: string) => p.startsWith("/error-lab"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0B1020]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5"
    >
      <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.matches(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200 active:text-blue-400"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none font-sans">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
