import React from "react";
import type { Metadata } from "next";
import { ScientificCalculatorClient } from "./ScientificCalculatorClient";

export const metadata: Metadata = {
  title: "الآلة الحاسبة العلمية ثلاثية الأبعاد (Casio FX 3D) | BAC 2027",
  description:
    "آلة حاسبة علمية ثلاثية الأبعاد بتصميم واقعي مجسم (Casio ClassWiz fx-991) لطلاب البكالوريا: حساب الدوال المثلثية، اللوغاريتم، الاحتمالات، وثوابت الفيزياء والكيمياء الرسمية.",
  keywords: [
    "آلة حاسبة علمية",
    "آلة حاسبة كاسيو اونلاين",
    "casio fx 991 online",
    "حاسبة علمية بكالوريا",
    "scientific calculator 3d",
    "حساب اللوغاريتم والدوال المثلثية",
  ],
  alternates: {
    canonical: "/scientific-calculator",
  },
};

export default function ScientificCalculatorPage() {
  return <ScientificCalculatorClient />;
}
