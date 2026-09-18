import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "دروس وملخصات البكالوريا الجزائرية 2027 | المنهاج الرسمي — الشاطر",
  description:
    "استكشف دروس، ملخصات، وفيديوهات شرح منهاج البكالوريا الجزائرية 2027 في العلوم الطبيعية، الرياضيات، الفيزياء، الفلسفة، والأدب العربي لجميع الشعب مع منصة الشاطر.",
  keywords: [
    "دروس البكالوريا الجزائرية",
    "ملخصات البكالوريا 2027",
    "منهاج البكالوريا وزارة التربية الوطنية",
    "دروس العلوم الطبيعية بكالوريا",
    "دروس الرياضيات بكالوريا",
    "دروس الفيزياء بكالوريا",
    "مقالات فلسفية بكالوريا",
  ],
  alternates: {
    canonical: "/curriculum",
  },
  openGraph: {
    title: "دروس وملخصات البكالوريا الجزائرية 2027 | الشاطر SHATER",
    description: "فهرس تفاعلي شامل لدروس وملخصات البكالوريا وفق التدرج السنوي الوزاري.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "دروس وملخصات البكالوريا - الشاطر",
      },
    ],
    type: "website",
  },
};

export default function CurriculumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المنهاج والدروس", url: "/curriculum" },
        ]}
      />
      {children}
    </>
  );
}
