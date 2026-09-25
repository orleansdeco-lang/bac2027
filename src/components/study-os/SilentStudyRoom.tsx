"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";

/**
 * SilentStudyRoom (Deprecated)
 * Deprecated in favor of the unified "مجالس العلم" under /diwan.
 * Automatically forwards users to /diwan?tab=majlis.
 */
export function SilentStudyRoom() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/diwan?tab=majlis");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center" dir="rtl">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
        <Landmark className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-theme-text mb-1">
        جاري تحويلك إلى مجالس العلم المحدثة...
      </h3>
      <p className="text-xs text-theme-muted">
        تم دمج غرف الدراسة في ديوان العلم بتصميم عصري ثلاثي الأبعاد.
      </p>
    </div>
  );
}

export default SilentStudyRoom;
