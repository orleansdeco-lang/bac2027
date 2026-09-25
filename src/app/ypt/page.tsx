import React from "react";
import type { Metadata } from "next";
import { PersonalDeskView } from "@/components/ypt/PersonalDeskView";

export const metadata: Metadata = {
  title: "المكتب الشخصي — يلا نقرا (YPT-BAC) | بكالوريا 2027",
  description:
    "مكتبك الدراسي الشخصي الذكي للبكالوريا الجزائرية: عداد دقيق، خريطة حرارية لـ 24 ساعة (144 مكعباً)، قائمة مهام الحسم اليومية، ووضع التركيز الأقصى بدون تشتت.",
};

export default function PersonalDeskPage() {
  return <PersonalDeskView />;
}
