import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التشخيص الأكاديمي | الشاطر SHATER",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DiagnosticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
