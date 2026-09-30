import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "مركز تحكم الشاطر | SHATER Control Center",
  description: "المنظومة الإدارية والتشغيلية الموحدة لمنصة الشاطر - بكالوريا الجزائر",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
