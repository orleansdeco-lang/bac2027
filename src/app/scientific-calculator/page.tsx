import React from "react";
import type { Metadata } from "next";
import { ScientificCalculatorClient } from "./ScientificCalculatorClient";

export const metadata: Metadata = {
  title: "الآلة الحاسبة العلمية والبيانية (Casio fx-991 & NumWorks) | BAC 2027",
  description:
    "آلة حاسبة علمية وبيانية تفاعلية دقيقة (Casio ClassWiz fx-991 و NumWorks Graphing) لطلاب البكالوريا: رسم الدوال بيانياً، بايثون، حساب المثلثات، اللوغاريتم، الاحتمالات والإحصاء، والمميز دلتا.",
  keywords: [
    "آلة حاسبة علمية",
    "آلة حاسبة بيانية",
    "آلة حاسبة نيمووركس",
    "numworks online calculator",
    "numworks graphing simulator",
    "آلة حاسبة كاسيو اونلاين",
    "casio fx 991 online",
    "حاسبة علمية بكالوريا",
    "casio classwiz online",
    "رسم الدوال الرياضية اونلاين",
    "حساب اللوغاريتم والدوال المثلثية",
  ],
  alternates: {
    canonical: "/scientific-calculator",
  },
};

export default function ScientificCalculatorPage() {
  return <ScientificCalculatorClient />;
}
