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
        canvas: "#0B1020",
        dark: {
          bg: "#0B1020",
          surface: "#111827",
          card: "#162032",
          elevated: "#1E293B",
          border: "rgba(148, 163, 184, 0.12)",
        },
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6", // Primary Action Blue
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
          border: "#1E293B",
        },
        mind: {
          good: "#22C55E",
          normal: "#3B82F6",
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
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.35)",
        glow: "0 0 25px -5px rgba(59, 130, 246, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
