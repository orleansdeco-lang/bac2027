import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
      colors: {
        canvas: "var(--color-bg-base)",
        surface: "var(--color-bg-surface)",
        card: "var(--color-bg-card)",
        "card-hover": "var(--color-bg-card-hover)",
        "card-muted": "var(--color-bg-card-muted)",
        "card-elevated": "var(--color-bg-elevated)",
        sidebar: "var(--color-sidebar)",

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
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          soft: "var(--color-primary-soft)",
          50: "#F4F8F7",
          100: "#E5EFEF",
          200: "#DCE9E4",
          300: "#AFC8BD",
          400: "#85A99F",
          500: "#5F8F86",
          600: "#527D75",
          700: "#456B64",
          800: "#385853",
          900: "#26302F",
          950: "#17201E",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          soft: "var(--color-secondary-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "#C99558",
          soft: "var(--color-accent-soft)",
          muted: "var(--color-accent-muted)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-soft)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          soft: "var(--color-error-soft)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          soft: "var(--color-info-soft)",
        },
        brand: {
          teal: "#5F8F86",
          sage: "#AFC8BD",
          honey: "#D7A66A",
          terracotta: "#C8796B",
          graphite: "#26302F",
          sand: "#EFE9DC",
          blue: "#5F8F86", // backwards compatibility mapped to teal
          green: "#6E9B7B",
          purple: "#AFC8BD",
          yellow: "#D7A66A",
          red: "#C8796B",
        },
        academic: {
          navy: "#26302F",
          slate: "#65706D",
          muted: "#8C9691",
          border: "var(--color-border-subtle)",
        },
        mind: {
          good: "var(--color-success)",
          normal: "var(--color-primary)",
          tired: "var(--color-warning)",
          stressed: "var(--color-error)",
        },
      },
      fontFamily: {
        sans: [
          "Cairo",
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
        sm: "10px",
        md: "14px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
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
