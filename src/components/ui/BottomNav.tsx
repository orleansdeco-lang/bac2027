"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Compass, Map, Wrench, BarChart3, Target, MessageSquareQuote } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useTranslation();

  const navItems = [
    {
      href: "/dashboard",
      label: locale === "ar" ? "الرئيسية" : "Accueil",
      icon: Compass,
      matches: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      href: "/experiences",
      label: locale === "ar" ? "التجارب" : "Témoignages",
      icon: MessageSquareQuote,
      matches: (p: string) => p.startsWith("/experiences"),
      highlight: true,
    },
    {
      href: "/roadmap",
      label: locale === "ar" ? "الخريطة" : "La Route",
      icon: Map,
      matches: (p: string) => p.startsWith("/roadmap"),
    },
    {
      href: "/error-lab",
      label: locale === "ar" ? "الأخطاء" : "Erreurs",
      icon: Wrench,
      matches: (p: string) => p.startsWith("/error-lab") || p.startsWith("/errors"),
    },
    {
      href: "/exam",
      label: locale === "ar" ? "الامتحان" : "Examen",
      icon: Target,
      matches: (p: string) => p.startsWith("/exam"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-theme px-2 py-1 transition-colors duration-200"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.matches(pathname);
          const Icon = item.icon;

          const isHighlight = Boolean((item as any).highlight);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? isHighlight
                    ? "text-amber-500 font-bold"
                    : "text-[var(--color-primary)] font-bold"
                  : isHighlight
                  ? "text-amber-500/80 hover:text-amber-500"
                  : "text-theme-muted hover:text-theme-text active:text-[var(--color-primary)]"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-sm ${
                      isHighlight ? "bg-amber-500 shadow-amber-500/50" : "bg-[var(--color-primary)]"
                    }`}
                  />
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
