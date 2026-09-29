import React from "react";
import type { Metadata } from "next";
import { ScientificCalculatorClient } from "./ScientificCalculatorClient";

export const metadata: Metadata = {
  title: "الآلة الحاسبة العلمية التفاعلية (Casio ClassWiz fx-991) | BAC 2027",
  description:
    "آلة حاسبة علمية تفاعلية دقيقة (Casio ClassWiz fx-991) لطلاب البكالوريا: حساب الدوال المثلثية، اللوغاريتم، الاحتمالات، وثوابت الفيزياء والكيمياء الرسمية.",
  keywords: [
    "آلة حاسبة علمية",
    "آلة حاسبة كاسيو اونلاين",
    "casio fx 991 online",
    "حاسبة علمية بكالوريا",
    "casio classwiz online",
    "حساب اللوغاريتم والدوال المثلثية",
  ],
  alternates: {
    canonical: "/scientific-calculator",
  },
};

export default function ScientificCalculatorPage() {
  return <ScientificCalculatorClient />;
}
