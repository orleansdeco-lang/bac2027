"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DashboardOrderDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  useEffect(() => {
    if (id) {
      router.replace(`/orders/track/${encodeURIComponent(id)}`);
    } else {
      router.replace("/dashboard/orders");
    }
  }, [id, router]);

  return (
    <div className="py-20 text-center text-sm font-bold text-slate-400" dir="rtl">
      جاري التوجيه إلى مسار تتبع الطلب...
    </div>
  );
}
