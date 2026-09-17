import React from "react";
import type { Metadata } from "next";
import { LandingView } from "@/components/landing/LandingView";

export const metadata: Metadata = {
  title: "انضم إلى نخبة بكالوريا 2026/2027 | BAC Mastery - تجربة مجانية 72 ساعة",
  description: "اكتشف منهجية الامتياز في البكالوريا الجزائرية. تشخيص فوري، خريطة تفاعلية ذكية، ومعمل الأخطاء لرفع معدلك وضمان كليات النخبة (الطب، الإعلام الآلي، والمدارس العليا).",
  openGraph: {
    title: "انضم إلى نخبة بكالوريا 2026/2027 | BAC Mastery",
    description: "ابدأ تجربتك المجانية لمدة 72 ساعة الآن واكتشف خريطتك التعليمية المخصصة لشعبتك.",
    images: ["/illustrations/bac-success-joy.jpg"],
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingView />;
}
