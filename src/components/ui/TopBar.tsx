"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSelector } from "./ThemeSelector";
import { Badge } from "./Badge";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";

export function TopBar() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);

  useEffect(() => {
    const p = getStrategicProfile();
    if (p) setProfile(p);
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: locale === "ar" ? "لوحة التحكم" : "Tableau de bord" },
    { href: "/roadmap", label: locale === "ar" ? "الخريطة" : "Feuille de route" },
    { href: "/error-lab", label: locale === "ar" ? "مختبر الأخطاء" : "Lab d'erreurs" },
    { href: "/progress", label: locale === "ar" ? "تقدمي" : "Progrès" },
    { href: "/account", label: locale === "ar" ? "حسابي" : "Mon compte" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-theme bg-surface/90 backdrop-blur-md transition-colors duration-200">
      <Container size="lg" className="flex h-16 items-center justify-between">
        {/* Left: Logo + Optional Profile Badge */}
        <div className="flex items-center gap-3">
          <Logo size="md" showTagline={false} />
          {profile && (
            <Badge
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-[10px] border-theme bg-card text-theme-secondary"
            >
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/25 shadow-sm"
                    : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Theme Selector + Language Switcher + Badge */}
        <div className="flex items-center gap-2">
          <ThemeSelector variant="compact" />
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
