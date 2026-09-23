import React, { Suspense } from "react";
import type { Metadata } from "next";
import { MemorizeClient } from "./MemorizeClient";

export const metadata: Metadata = {
  title: "لعبة الحفظ الذكية والمسابقات (تواريخ وشخصيات) | BAC 2027",
  description:
    "احفظ وثبّت جميع التواريخ والشخصيات والمصطلحات المقررة في البكالوريا الجزائرية (تاريخ وجغرافيا) باستخدام تقنية التكرار المتباعد، بطاقات الفلاش، وتحديات السرعة والسؤال الفجائي التنشيطي.",
  keywords: [
    "شخصيات البكالوريا",
    "تواريخ البكالوريا",
    "مصطلحات التاريخ والجغرافيا بكالوريا",
    "لعبة حفظ التواريخ",
    "فلاش كارد بكالوريا",
    "كويز تاريخ وجغرافيا BAC",
  ],
  alternates: {
    canonical: "/memorize",
  },
};

export default function MemorizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
        </div>
      }
    >
      <MemorizeClient />
    </Suspense>
  );
}
