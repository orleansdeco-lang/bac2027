import React from "react";
import type { Metadata } from "next";
import { SilentStudyRoom } from "@/components/study-os";

export const metadata: Metadata = {
  title: "طاولة المذاكرة الصامتة (Body Doubling) — SHATER Study OS | بكالوريا 2027",
  description:
    "طاولة دراسة افتراضية هادئة بحد أقصى 6 مقاعد لطلاب البكالوريا بنظام Body Doubling: نقرا مع ناس آخرين، بصمت. اختر مقعدك، ثبّت هدفك، وشجّع زملاءك بكوب قهوة ☕.",
};

export default function VirtualStudyTablePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <SilentStudyRoom />
    </div>
  );
}
