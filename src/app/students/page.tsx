import React, { Suspense } from "react";
import { Metadata } from "next";
import { StudentsLandingView } from "@/components/landing/StudentsLandingView";

export const metadata: Metadata = {
  title: "نهار النتائج... وين حاب تكون؟ | طلاب البكالوريا 2026/2027 | الشاطر",
  description: "حدد هدفك الجامعي، واعرف معدلك الموزون الرسمي، وادخل مجالس العلم الحية مع زملاء شعبتك بدون مشتتات.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "نهار النتائج... وين حاب تكون؟ | الشاطر للبكالوريا 2026/2027",
    description: "منظومة المذاكرة الذكية لطلاب البكالوريا في الجزائر: مستكشف التوجيه، مجالس العلم، ومعمل الأخطاء.",
    locale: "ar_DZ",
    type: "website",
  },
};

export default function StudentsLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14]" />}>
      <StudentsLandingView />
    </Suspense>
  );
}
