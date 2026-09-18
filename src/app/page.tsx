import React from "react";
import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "الشاطر | SHATER — من مستواك الحالي، إلى جاهز للباك",
  description: "الشاطر: منظومة ذكية للتعلم والتدريب وبناء الكفاءة. اعرف مستواك، أصلح نقاط ضعفك، وتدرب على المهارات حتى الجاهزية التامة مع SHATER BAC.",
  keywords: [
    "الشاطر",
    "SHATER",
    "SHATER BAC",
    "بكالوريا الجزائر",
    "BAC 2026",
    "BAC 2027",
    "علوم تجريبية",
    "رياضيات",
    "تقني رياضي",
    "تسيير واقتصاد",
    "آداب وفلسفة",
    "لغات أجنبية",
    "معمل الأخطاء",
    "كلية الطب",
    "المدارس العليا الجزائر",
  ],
  openGraph: {
    title: "الشاطر | SHATER — من مستواك الحالي، إلى جاهز للباك",
    description: "منظومة ذكية تساعدك على معرفة أين أنت، ماذا ينقصك، وما الذي يجب أن تفعله الآن لتصل جاهزاً للبكالوريا.",
    images: ["/illustrations/shater-hero.jpg"],
    type: "website",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
