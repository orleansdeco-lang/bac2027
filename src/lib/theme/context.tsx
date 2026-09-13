"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "freemium" | "girls" | "boys";

export interface ThemeInfo {
  id: Theme;
  label_ar: string;
  label_fr: string;
  icon: string;
  tagline_ar: string;
  tagline_fr: string;
  colorScheme: "dark" | "light";
  accentColor: string;
  isPremium?: boolean;
}

export const THEMES: Record<Theme, ThemeInfo> = {
  freemium: {
    id: "freemium",
    label_ar: "بسيط (Freemium)",
    label_fr: "Simple (Freemium)",
    icon: "🌿",
    tagline_ar: "تصميم بسيط وعالي الوضوح بدون أي تشتيت",
    tagline_fr: "Minimaliste, sobre, rapide et gratuit",
    colorScheme: "light",
    accentColor: "#2563EB",
    isPremium: false,
  },
  girls: {
    id: "girls",
    label_ar: "بنات (Girls 3D)",
    label_fr: "Filles (Girls 3D)",
    icon: "✨",
    tagline_ar: "ألوان اللافندر والوردي الفاخرة مع شخصية الطالبة 3D",
    tagline_fr: "Élégant, prune, rose poudré et illustration 3D",
    colorScheme: "dark",
    accentColor: "#C084FC",
    isPremium: true,
  },
  boys: {
    id: "boys",
    label_ar: "ذكور (Boys 3D)",
    label_fr: "Garçons (Boys 3D)",
    icon: "⚡",
    tagline_ar: "أزرق داكن وسيان علمي حديث مع شخصية الطالب 3D",
    tagline_fr: "Dynamique, bleu nuit, cyan et illustration 3D",
    colorScheme: "dark",
    accentColor: "#3B82F6",
    isPremium: true,
  },
};

export const DEFAULT_THEME: Theme = "freemium";

function normalizeTheme(val: any): Theme {
  if (val === "girls" || val === "bloom" || val === "balance") return "girls";
  if (val === "boys" || val === "edge") return "boys";
  if (val === "freemium" || val === "pure" || val === "focus") return "freemium";
  if (val && THEMES[val as Theme]) return val as Theme;
  return DEFAULT_THEME;
}

interface ThemeContextType {
  theme: Theme;
  themeInfo: ThemeInfo;
  setTheme: (theme: Theme) => void;
  themes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = (t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", t);
    const meta = THEMES[t] || THEMES[DEFAULT_THEME];
    root.style.colorScheme = meta.colorScheme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        t === "freemium" ? "#F8FAFC" : t === "girls" ? "#1F1530" : "#0B132B"
      );
    }
  };

  const setTheme = (newTheme: Theme) => {
    const validTheme = normalizeTheme(newTheme);
    setThemeState(validTheme);
    applyThemeToDOM(validTheme);
    try {
      localStorage.setItem("bac_mastery_theme", validTheme);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("bac_mastery_theme");
      const normalized = normalizeTheme(saved);
      setThemeState(normalized);
      applyThemeToDOM(normalized);
      return;
    } catch {}
    applyThemeToDOM(initialTheme);
  }, [initialTheme]);

  const currentThemeInfo = THEMES[theme] || THEMES[DEFAULT_THEME];
  const allThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeInfo: currentThemeInfo,
        setTheme,
        themes: allThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
