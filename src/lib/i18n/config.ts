export type Locale = "ar" | "fr";

export type Direction = "rtl" | "ltr";

export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeName: string;
  dir: Direction;
}

export const SUPPORTED_LOCALES: Record<Locale, LocaleMeta> = {
  ar: {
    code: "ar",
    label: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
  fr: {
    code: "fr",
    label: "French",
    nativeName: "Français",
    dir: "ltr",
  },
};

export const DEFAULT_LOCALE: Locale = "ar";
