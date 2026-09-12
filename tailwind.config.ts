import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-bg-base)",
        surface: "var(--color-bg-surface)",
        card: "var(--color-bg-card)",
        "card-hover": "var(--color-bg-card-hover)",
        "card-muted": "var(--color-bg-card-muted)",
        "card-elevated": "var(--color-bg-elevated)",

        "theme-border": "var(--color-border-subtle)",
        "theme-border-hover": "var(--color-border-hover)",
        "theme-border-strong": "var(--color-border-strong)",

        "theme-text": "var(--color-text-primary)",
        "theme-secondary": "var(--color-text-secondary)",
        "theme-muted": "var(--color-text-muted)",

        "theme-primary": "var(--color-primary)",
        "theme-primary-hover": "var(--color-primary-hover)",
        "theme-primary-active": "var(--color-primary-active)",
        "theme-accent": "var(--color-accent)",

        dark: {
          bg: "var(--color-bg-base)",
          surface: "var(--color-bg-surface)",
          card: "var(--color-bg-card)",
          elevated: "var(--color-bg-elevated)",
          border: "var(--color-border-subtle)",
        },
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        brand: {
          blue: "#3B82F6",
          green: "#22C55E",
          cyan: "#22D3EE",
          purple: "#8B5CF6",
          yellow: "#FACC15",
          red: "#EF4444",
        },
        academic: {
          navy: "#0F172A",
          slate: "#334155",
          muted: "#94A3B8",
          border: "var(--color-border-subtle)",
        },
        mind: {
          good: "#22C55E",
          normal: "var(--color-primary)",
          tired: "#FACC15",
          stressed: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-ibm-arabic)",
          "var(--font-jakarta)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
