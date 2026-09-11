import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";

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
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-[#0B1020]">
      <body className="min-h-screen antialiased bg-[#0B1020] text-slate-100 selection:bg-blue-600 selection:text-white">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
