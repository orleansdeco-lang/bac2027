import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "بنك التجارب والعِبر | نصائح وخبرات متفوقي ومعيدي البكالوريا الجزائرية",
  description:
    "بنك تجارب البكالوريا الجزائرية: نصائح عملية من متفوقي 16+ وقصص نجاح المعيدين، أكبر الفخاخ لتفاديها، والروتينات التي صنعت الفارق في تحصيل المعدل.",
  keywords: [
    "تجارب بكالوريا ناجحة",
    "نصائح متفوقي البكالوريا الجزائرية",
    "قصص نجاح المعيدين بكالوريا",
    "أخطاء البكالوريا",
    "روتين دراسة البكالوريا",
    "تجارب شعبة علوم تجريبية",
    "تجارب شعبة رياضيات",
  ],
  alternates: {
    canonical: "/experiences",
  },
  openGraph: {
    title: "بنك التجارب والعِبر | نصائح وخبرات متفوقي ومعيدي البكالوريا",
    description:
      "اقرأ تجارب حقيقية من متفوقين ومعيدين، وتعرف على أكبر الفخاخ التي كادت تسقطهم، والروتين الذي صنع الفارق.",
    type: "website",
  },
};

export default function ExperiencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "بنك التجارب والعِبر", url: "/experiences" },
        ]}
      />
      {children}
    </>
  );
}
