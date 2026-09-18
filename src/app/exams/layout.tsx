import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "مواضيع وحلول البكالوريا الجزائرية السابقة مع التصحيح الوزاري | الشاطر",
  description:
    "بنك مواضيع شهادة البكالوريا الرسمية الصادرة عن الديوان الوطني للامتحانات والمسابقات (ONEC) مع الحلول النموذجية وسلالم التنقيط الوزارية من دورة 2015 إلى 2024 لجميع الشعب.",
  keywords: [
    "مواضيع بكالوريا سابقة مع الحل",
    "تصحيح بكالوريا رسمي ONEC",
    "حوليات البكالوريا الجزائرية",
    "بكالوريا علوم تجريبية مع الحل",
    "مواضيع بكالوريا رياضيات مع التصحيح",
    "مواضيع بكالوريا فيزياء مع الحل النموذجي",
    "بنك الامتحانات الرسمية الجزائر",
  ],
  alternates: {
    canonical: "/exams",
  },
  openGraph: {
    title: "مواضيع وحلول البكالوريا الجزائرية السابقة مع التصحيح الوزاري | الشاطر SHATER",
    description:
      "تصفح وحمل واطلع على مواضيع البكالوريا الرسمية السابقة مع التصحيح وسلم التنقيط لجميع المواد والشعب.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "مواضيع وحلول البكالوريا الجزائرية - الشاطر",
      },
    ],
    type: "website",
  },
};

export default function ExamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "مواضيع البكالوريا السابقة", url: "/exams" },
        ]}
      />
      {children}
    </>
  );
}
