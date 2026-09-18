import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { ThemeProvider } from "@/lib/theme/context";
import { ProgressProvider } from "@/lib/progress/progress-context";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shater.dz"),
  title: {
    default: "الشاطر SHATER | منصة البكالوريا الجزائرية 2027",
    template: "%s | الشاطر SHATER",
  },
  description:
    "الشاطر SHATER منصة للبكالوريا في الجزائر: دروس، ملخصات، تمارين، مواضيع وحلول، مع تشخيص ذكي يساعدك تعرف واش ناقصك وكيفاش تخدم عليه.",
  keywords: [
    "الشاطر",
    "SHATER",
    "SHATER BAC",
    "بكالوريا 2027 الجزائر",
    "BAC 2027",
    "دروس البكالوريا",
    "ملخصات البكالوريا",
    "تمارين البكالوريا",
    "مواضيع البكالوريا مع الحل",
    "حاسبة معدل البكالوريا",
    "علوم تجريبية",
    "رياضيات",
    "تقني رياضي",
    "تسيير واقتصاد",
    "آداب وفلسفة",
    "لغات أجنبية",
  ],
  authors: [{ name: "فريق الشاطر للتعليم الذكي" }],
  creator: "SHATER",
  publisher: "SHATER EdTech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://shater.dz",
    siteName: "الشاطر | SHATER",
    title: "الشاطر SHATER | منصة البكالوريا الجزائرية 2027",
    description:
      "الشاطر SHATER منصة للبكالوريا في الجزائر: دروس، ملخصات، تمارين، مواضيع وحلول، مع تشخيص ذكي يساعدك تعرف واش ناقصك وكيفاش تخدم عليه.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "الشاطر — منصة البكالوريا الجزائرية 2027",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الشاطر SHATER | منصة البكالوريا الجزائرية 2027",
    description:
      "دروس، ملخصات، تمارين ومواضيع البكالوريا، مع تشخيص ذكي يساعدك تعرف واش ناقصك وكيفاش تخدم عليه.",
    images: ["/illustrations/shater-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shater.dz";

  return (
    <html lang="ar" dir="rtl" className="h-full bg-canvas text-theme-text" data-theme="focus">
      <body className="min-h-screen antialiased bg-canvas text-theme-text selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)]">
        <OrganizationJsonLd siteUrl={siteUrl} />
        <WebSiteJsonLd siteUrl={siteUrl} />
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ProgressProvider>
                <VisitorTracker />
                <ServiceWorkerRegister />
                {children}
                <PWAInstallPrompt />
              </ProgressProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
