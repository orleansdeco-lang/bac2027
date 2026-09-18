import React from "react";
import type { Metadata } from "next";
import { LandingView } from "@/components/landing/LandingView";

export const metadata: Metadata = {
  title: "الشاطر | SHATER — من مستواك الحالي، إلى جاهز للباك",
  description: "اكتشف منظومة الشاطر الذكية للبكالوريا الجزائرية. تشخيص دقيق، مسار مخصص بالمهارات، ومعمل أخطاء ذكي يوصلك جاهزاً للامتحان.",
  openGraph: {
    title: "الشاطر | SHATER — منظومة ذكية لبناء الكفاءة والجاهزية للبكالوريا",
    description: "ابدأ تجربتك الاستكشافية لمدة 72 ساعة الآن واكتشف خريطتك التعليمية المخصصة لشعبتك.",
    images: ["/illustrations/shater-hero.jpg"],
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingView />;
}
