import React from "react";
import type { Metadata } from "next";
import { BacCurriculumTrackerView } from "@/components/ypt/BacCurriculumTrackerView";

export const metadata: Metadata = {
  title: "برنامج البكالوريا — متتبع المنهاج | يلا نقرا (YPT-BAC)",
  description:
    "تتبع تغطية دروس ووحدات البكالوريا لجميع الشعب الجزائرية عبر 4 مراحل إنجاز دقيقة مع احتساب نسب الجاهزية والتقدم الحقيقي.",
};

export default function BacCurriculumPage() {
  return <BacCurriculumTrackerView />;
}
