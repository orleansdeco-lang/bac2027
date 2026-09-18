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

export const THEMES: Record<string, ThemeInfo> = {
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
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme] = useState<Theme>("bac-mastery");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", "bac-mastery");
    root.style.colorScheme = "light";

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#F7F3EA");
    }
  }, []);

  const currentThemeInfo = THEMES["bac-mastery"];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeInfo: currentThemeInfo,
        setTheme: () => {},
        themes: [currentThemeInfo],
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
      theme: "bac-mastery" as Theme,
      themeInfo: THEMES["bac-mastery"],
      setTheme: () => {},
      themes: [THEMES["bac-mastery"]],
    };
  }
  return context;
}
