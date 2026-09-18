import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "متابعة التقدم | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
