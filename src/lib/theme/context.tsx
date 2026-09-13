"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "focus" | "bloom" | "edge" | "pure";

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
  focus: {
    id: "focus",
    label_ar: "فوكس (Focus)",
    label_fr: "Focus",
    icon: "☀️",
    tagline_ar: "دافئ، أنيق، ولمسة هادئة ومريحة",
    tagline_fr: "Chaleureux, pastel et confiant",
    colorScheme: "light",
    accentColor: "#EE7B62",
    isPremium: false,
  },
  bloom: {
    id: "bloom",
    label_ar: "بلوم (Bloom)",
    label_fr: "Bloom",
    icon: "✨",
    tagline_ar: "أناقة فاخرة، درجات البنفسجي والمرجان",
    tagline_fr: "Élégant, prune & lavande éditoriale",
    colorScheme: "dark",
    accentColor: "#C084FC",
    isPremium: true,
  },
  edge: {
    id: "edge",
    label_ar: "إيدج (Edge)",
    label_fr: "Edge",
    icon: "⚡",
    tagline_ar: "طموح، حديث، أزرق داكن وسيان علمي",
    tagline_fr: "Ambitieux, moderne & bleu nuit",
    colorScheme: "dark",
    accentColor: "#3B82F6",
    isPremium: true,
  },
  pure: {
    id: "pure",
    label_ar: "نقاء (Pure)",
    label_fr: "Pure",
    icon: "🌿",
    tagline_ar: "بساطة نقية، صفاء ذهني، وخفة",
    tagline_fr: "Minimaliste, sobre et universel",
    colorScheme: "light",
    accentColor: "#2563EB",
    isPremium: false,
  },
};

export const DEFAULT_THEME: Theme = "focus";

function normalizeTheme(val: any): Theme {
  if (val === "balance") return "bloom";
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
        t === "focus" ? "#F7F3EE" : t === "bloom" ? "#181126" : t === "edge" ? "#0A0F1D" : "#FBFBFA"
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
