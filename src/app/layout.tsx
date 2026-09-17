import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { ThemeProvider } from "@/lib/theme/context";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

export const metadata: Metadata = {
  title: "BAC Mastery — ماشي واش تقرا. كيفاش توصل.",
  description:
    "النظام الدراسي المتكامل لطلبة البكالوريا في الجزائر: من مستواك الحالي إلى معدل أحلامك عبر مسار مخصص مع الحفاظ على طاقتك وراحتك.",
  keywords: [
    "BAC Algérie",
    "بكالوريا الجزائر",
    "منهجية البكالوريا",
    "علوم تجريبية",
    "رياضيات",
    "تقني رياضي",
    "تسيير واقتصاد",
    "آداب وفلسفة",
    "لغات أجنبية",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#080D1A",
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
              <VisitorTracker />
              {children}
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
