import React, { Suspense } from "react";
import { Metadata } from "next";
import { ParentsLandingView } from "@/components/landing/ParentsLandingView";

export const metadata: Metadata = {
  title: "لأولياء أمور طلبة البكالوريا 2026/2027 | راحة بالكم ومرافقة أبنائكم | الشاطر",
  description: "دليل أولياء أمور طلبة البكالوريا: بيئة دراسية آمنة بدون مشتتات، تشخيص بيداغوجي دقيق، وتوصيل كود التفعيل والدفع عند الاستلام لـ 58 ولاية.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "لأولياء أمور طلبة البكالوريا | منصة الشاطر",
    description: "راحة بالكم وتفوق أبنائكم: بيئة تعليمية آمنة خالية من المشتتات وشبكات التواصل، مع تجربة مجانية 7 أيام ودفع عند الاستلام.",
    locale: "ar_DZ",
    type: "website",
  },
};

export default function ParentsLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14]" />}>
      <ParentsLandingView />
    </Suspense>
  );
}
