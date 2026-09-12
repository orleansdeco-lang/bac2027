"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth?mode=signup");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas text-theme-muted font-mono text-xs">
      BAC MASTERY...
    </div>
  );
}
