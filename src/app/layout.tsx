import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { ThemeProvider } from "@/lib/theme/context";
import { ProgressProvider } from "@/lib/progress/progress-context";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shater.dz"),
  title: "الشاطر | SHATER — منظومة ذكية للتعلم والتدريب وبناء الكفاءة",
  description:
    "الشاطر: منظومة ذكية تساعدك على معرفة مستواك الحقيقي، سد ثغراتك، وبناء كفاءتك خطوة بخطوة. تبدأ مع SHATER BAC لطلبة البكالوريا في الجزائر.",
  keywords: [
    "الشاطر",
    "SHATER",
    "SHATER BAC",
    "بكالوريا الجزائر",
    "BAC Algérie",
    "منهجية البكالوريا",
    "علوم تجريبية",
    "رياضيات",
    "تقني رياضي",
    "تسيير واقتصاد",
    "آداب وفلسفة",
    "لغات أجنبية",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#5F8F86",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-canvas text-theme-text" data-theme="focus">
      <body className="min-h-screen antialiased bg-canvas text-theme-text selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)]">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ProgressProvider>
                <VisitorTracker />
                {children}
              </ProgressProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
