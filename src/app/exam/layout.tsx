import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محاكي الامتحان الرسمي | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
