import React from "react";
import type { Metadata } from "next";
import { LandingView } from "@/components/landing/LandingView";

export const metadata: Metadata = {
  title: "منصة امتياز البكالوريا 2026/2027 | BAC Mastery - طريقك نحو الامتياز وفرحة الوالدين",
  description: "المنصة الجزائرية الأولى للتحضير الاستراتيجي لشهادة البكالوريا. خريطة تفاعلية ذكية، معمل الأخطاء لترميم الثغرات، تدريب على سلم التنقيط الوزاري، وتجربة مجانية كاملة لمدة 72 ساعة.",
  keywords: [
    "بكالوريا الجزائر",
    "BAC 2026",
    "BAC 2027",
    "امتياز البكالوريا",
    "معمل الأخطاء",
    "علوم تجريبية",
    "رياضيات",
    "تقني رياضي",
    "تسيير واقتصاد",
    "آداب وفلسفة",
    "لغات أجنبية",
    "كلية الطب",
    "ESI الجزائر",
  ],
  openGraph: {
    title: "منصة امتياز البكالوريا 2026/2027 | BAC Mastery",
    description: "طريقك نحو امتياز البكالوريا يبدأ من هنا. خريطة ذكية تكتشف ثغراتك وتصحح أخطاءك فوراً لترفع معدلك وتفرح والديك.",
    images: ["/illustrations/bac-success-joy.jpg"],
    type: "website",
  },
};

export default function HomePage() {
  return <LandingView />;
}
