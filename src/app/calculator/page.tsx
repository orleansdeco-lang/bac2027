import React from "react";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CalculatorClient } from "./CalculatorClient";

export const metadata: Metadata = {
  title: "حاسبة معدل البكالوريا 2027 | حساب فوري بالمعاملات الرسمية وتوقعات التوجيه الجامعي",
  description:
    "احسب معدل البكالوريا الجزائرية 2027 بدقة وفق المعاملات الوزارية الرسمية لجميع الشعب (علوم تجريبية، رياضيات، تقني رياضي، تسيير واقتصاد، آداب وفلسفة، لغات أجنبية) مع محاكي التوجيه الجامعي والمدارس العليا.",
  keywords: [
    "حاسبة معدل البكالوريا",
    "حساب معدل البكالوريا 2027",
    "معاملات البكالوريا في الجزائر",
    "حساب معدل بكالوريا علوم تجريبية",
    "حساب معدل بكالوريا رياضيات",
    "حساب معدل بكالوريا تقني رياضي",
    "تخصصات الجامعة حسب معدل البكالوريا",
    "معدل القبول في كلية الطب بالجزائر",
    "المعدل الموزون للبكالوريا",
  ],
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: "حاسبة معدل البكالوريا 2027 الرسمية | الشاطر SHATER",
    description:
      "أداة مجانية لحساب معدل شهادة البكالوريا مع احتساب المعاملات الرسمية ومحاكاة التخصصات والمدارس العليا المتاحة لك.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "حاسبة معدل البكالوريا 2027 - منصة الشاطر",
      },
    ],
    type: "website",
  },
};

export default function CalculatorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "حاسبة معدل البكالوريا", url: "/calculator" },
        ]}
      />
      <CalculatorClient />
    </>
  );
}
