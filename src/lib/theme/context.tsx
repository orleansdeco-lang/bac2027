"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "bac-mastery" | "freemium" | "girls" | "boys";

export interface ThemeInfo {
  id: Theme;
  label_ar: string;
  label_fr: string;
  icon: string;
  tagline_ar: string;
  tagline_fr: string;
  colorScheme: "light" | "dark";
  accentColor: string;
  isPremium?: boolean;
}

export const THEMES: Record<Theme, ThemeInfo> = {
  "boys": {
    id: "boys",
    label_ar: "نمط الشباب (داكن وعصري)",
    label_fr: "Thème Homme (Sombre & Dynamique)",
    icon: "⚡",
    tagline_ar: "كحلي عميق، تركواز هادئ، وانضباط عالي للتركيز والإنجاز",
    tagline_fr: "Dark navy, slate, muted cyan et discipline d'acier",
    colorScheme: "dark",
    accentColor: "#0EA5E9",
    isPremium: false,
  },
  "girls": {
    id: "girls",
    label_ar: "نمط البنات (هادئ وملهم)",
    label_fr: "Thème Fille (Doux & Inspirant)",
    icon: "🌸",
    tagline_ar: "عاجي دافئ، وردي ناعم، وبنفسجي لطيف لأجواء دراسية مريحة",
    tagline_fr: "Warm off-white, soft rose, mauve délicat et sérénité",
    colorScheme: "light",
    accentColor: "#E879A8",
    isPremium: false,
  },
  "bac-mastery": {
    id: "bac-mastery",
    label_ar: "الهوية الموحدة (الشاطر | SHATER)",
    label_fr: "Identité Unifiée (SHATER)",
    icon: "🌿",
    tagline_ar: "تصميم دافئ، هادئ ومريح للعين مع شخصيات 3D موحدة",
    tagline_fr: "Design calme, chaleureux et moderne",
    colorScheme: "light",
    accentColor: "#5F8F86",
    isPremium: false,
  },
  "freemium": {
    id: "freemium",
    label_ar: "الوضع الافتراضي",
    label_fr: "Mode Standard",
    icon: "✨",
    tagline_ar: "الوضع المتوازن الكلاسيكي",
    tagline_fr: "Thème équilibré classique",
    colorScheme: "light",
    accentColor: "#5F8F86",
    isPremium: false,
  },
};

export const DEFAULT_THEME: Theme = "bac-mastery";

interface ThemeContextType {
  theme: Theme;
  themeInfo: ThemeInfo;
  setTheme: (theme: Theme) => void;
  themes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme || DEFAULT_THEME);

  // Initialize theme from localStorage if available, ensuring default is authentic bac-mastery
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("shater_theme") as Theme | null;
      if (stored === "boys" || stored === "girls") {
        // Reset previously forced boys/girls theme back to authentic bac-mastery
        setThemeState("bac-mastery");
        localStorage.setItem("shater_theme", "bac-mastery");
      } else if (stored && THEMES[stored]) {
        setThemeState(stored);
      } else {
        setThemeState("bac-mastery");
        localStorage.setItem("shater_theme", "bac-mastery");
      }
    } catch {}
  }, []);

  // Synchronize document attribute and meta color
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    const info = THEMES[theme] || THEMES["bac-mastery"];
    root.style.colorScheme = info.colorScheme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "boys" ? "#0F172A" : theme === "girls" ? "#FFF7F9" : "#F7F3EA"
      );
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("shater_theme", newTheme);
      } catch {}
    }
  };

  const currentThemeInfo = THEMES[theme] || THEMES["boys"];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeInfo: currentThemeInfo,
        setTheme,
        themes: [THEMES["boys"], THEMES["girls"], THEMES["bac-mastery"]],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "boys" as Theme,
      themeInfo: THEMES["boys"],
      setTheme: () => {},
      themes: [THEMES["boys"], THEMES["girls"], THEMES["bac-mastery"]],
    };
  }
  return context;
}
