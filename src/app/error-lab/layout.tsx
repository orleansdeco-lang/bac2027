import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "معمل الأخطاء | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ErrorLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
