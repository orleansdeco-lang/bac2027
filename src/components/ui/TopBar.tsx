"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Badge } from "./Badge";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { Compass, Sparkles } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);

  useEffect(() => {
    const p = getStrategicProfile();
    if (p) setProfile(p);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: locale === "ar" ? "الرئيسية" : "Accueil" },
    { href: "/roadmap", label: locale === "ar" ? "الخريطة" : "Feuille de route" },
    { href: "/error-lab", label: locale === "ar" ? "مختبر الأخطاء" : "Lab d'erreurs" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1020]/90 backdrop-blur-md">
      <Container size="lg" className="flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" showTagline={false} />
          {profile && (
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-[10px] border-slate-700/60 bg-slate-900/60 text-slate-300">
              {profile.streamId === "sciences_exp"
                ? (locale === "ar" ? "علوم تجريبية" : "Sciences Exp.")
                : profile.streamId}
              {profile.targetScore ? ` · ${profile.targetScore.toFixed(1)}/20` : ""}
            </Badge>
          )}
        </div>

        {/* Center/Right Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Language Switcher + Badge */}
        <div className="flex items-center gap-2.5">
          <Badge variant="primary" size="sm" className="hidden lg:inline-flex text-[10px] font-mono">
            {locale === "ar" ? "المرحلة التجريبية" : "Version Pilote"}
          </Badge>
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
