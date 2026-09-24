import React from "react";
import type { Metadata } from "next";
import { YptClient } from "./YptClient";

export const metadata: Metadata = {
  title: "يلا نقرا - متتبع التركيز وغرفة المذاكرة الجماعية (YPT BAC) | BAC 2027",
  description:
    "غرفة دراسة افتراضية تفاعلية لطلاب البكالوريا مستوحاة من Yeolpumta: عداد تركيز دقيق، خريطة حرارية لـ 24 ساعة، قائمة مهام الحسم اليومية، ودراسة جماعية مباشرة مع زملائك.",
  keywords: [
    "YPT بكالوريا",
    "Yeolpumta الجزائر",
    "متتبع المذاكرة",
    "عداد بومودورو بكالوريا",
    "غرفة دراسة افتراضية",
    "دراسة جماعية اونلاين",
    "خريطة التركيز 24 ساعة",
  ],
  alternates: {
    canonical: "/ypt",
  },
};

export default function YptPage() {
  return <YptClient />;
}
