"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "focus" | "balance" | "pure";

export interface ThemeInfo {
  id: Theme;
  label_ar: string;
  label_fr: string;
  icon: string;
  tagline_ar: string;
  tagline_fr: string;
  colorScheme: "dark" | "light";
  accentColor: string;
}

export const THEMES: Record<Theme, ThemeInfo> = {
  focus: {
    id: "focus",
    label_ar: "تركيز",
    label_fr: "Focus",
    icon: "⚡",
    tagline_ar: "طاقة، تركيز، وإنجاز مباشر",
    tagline_fr: "Énergie, focus et rigueur",
    colorScheme: "dark",
    accentColor: "#3B82F6",
  },
  balance: {
    id: "balance",
    label_ar: "توازن",
    label_fr: "Balance",
    icon: "✨",
    tagline_ar: "ثقة هادئة، أناقة، وراحة بال",
    tagline_fr: "Confiance sereine, élégance et motivation",
    colorScheme: "dark",
    accentColor: "#A855F7",
  },
  pure: {
    id: "pure",
    label_ar: "نقاء",
    label_fr: "Pur",
    icon: "🌿",
    tagline_ar: "صفاء ذهني، بساطة، ومسار نقي",
    tagline_fr: "Clarté d'esprit, minimalisme et fraîcheur",
    colorScheme: "light",
    accentColor: "#0D9488",
  },
};

export const DEFAULT_THEME: Theme = "focus";

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

    // Update meta theme-color tag dynamically if present
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        t === "focus" ? "#070B16" : t === "balance" ? "#120A1C" : "#F8FAFC"
      );
    }
  };

  const setTheme = (newTheme: Theme) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem("bac_mastery_theme", newTheme);
    } catch {
      // Ignore local storage errors in restricted contexts
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("bac_mastery_theme") as Theme;
      if (saved && THEMES[saved]) {
        setThemeState(saved);
        applyThemeToDOM(saved);
        return;
      }
    } catch {
      // Fallback to initial
    }
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
