import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مهمة تدريبية | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
