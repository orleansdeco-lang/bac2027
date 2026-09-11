"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, Direction, Locale, SUPPORTED_LOCALES } from "./config";
import { dictionaries, Dictionary } from "./dictionaries";

interface I18nContextType {
  locale: Locale;
  direction: Direction;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("bac_mastery_locale", newLocale);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bac_mastery_locale") as Locale;
      if (saved && SUPPORTED_LOCALES[saved]) {
        setLocaleState(saved);
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const meta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
  const direction = meta.dir;
  const t = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", locale);
  }, [direction, locale]);

  return (
    <I18nContext.Provider value={{ locale, direction, t, setLocale }}>
      <div dir={direction} className="min-h-screen">
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
