"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/register");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas text-theme-muted font-mono text-xs">
      جاري التحويل إلى صفحة التسجيل...
    </div>
  );
}
