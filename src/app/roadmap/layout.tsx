import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "خطة التدريب الشخصية | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
