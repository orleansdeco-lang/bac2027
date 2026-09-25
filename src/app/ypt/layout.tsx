import React from "react";
import type { Metadata } from "next";
import { TimerProvider } from "@/context/TimerContext";
import { YptNavbar } from "@/components/ypt/YptNavbar";

export const metadata: Metadata = {
  title: "يلا نقرا — YPT-BAC | نظام التركيز والمذاكرة الجماعية للبكالوريا",
  description:
    "المنظومة المتكاملة للتركيز والمذاكرة الجماعية لطلاب البكالوريا الجزائرية: عداد دقيق، خريطة حرارية 24 ساعة، طاولة دراسة افتراضية، تتبع المنهاج، ورسوم بيانية أسبوعية.",
};

export default function YptLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimerProvider>
      <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <YptNavbar />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </TimerProvider>
  );
}
