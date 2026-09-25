"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { CampusAccessGate } from "@/components/campus/CampusAccessGate";
import { Interactive3DTable } from "@/components/campus/Interactive3DTable";
import { CampusService } from "@/lib/campus/campus-service";
import { MajlisTable } from "@/types/campus";
import { useAuth } from "@/lib/auth/context";
import { useLearningAccessGate } from "@/lib/hooks";
import { StreamId } from "@/types/education";
import { Button } from "@/components/ui/Button";
import { ArrowRight, AlertCircle, Users } from "lucide-react";

export default function SingleTablePage() {
  const params = useParams();
  const router = useRouter();
  const tableId = typeof params?.tableId === "string" ? params.tableId : "";

  const { user } = useAuth();
  const gate = useLearningAccessGate({ redirectToAuth: false });

  const studentStream: StreamId =
    gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp";
  const studentName =
    gate.profile?.firstName || (user?.user_metadata as any)?.first_name || "طالب بكالوريا";
  const studentId = user?.id || "guest-student";
  const studentAvatar = "👨‍🎓";

  const [table, setTable] = useState<MajlisTable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tableId) {
      setIsLoading(false);
      return;
    }
    const found = CampusService.getTableById(tableId);
    if (found) {
      setTable(found);
      setIsLoading(false);
    } else {
      CampusService.fetchRemoteTables().then((remoteTables) => {
        const remoteFound = remoteTables.find((t) => t.id === tableId);
        setTable(remoteFound || null);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [tableId]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[500px]" dir="rtl">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-theme-muted font-bold">جاري تحميل طاولة مجلس العلم...</p>
        </div>
      </AppShell>
    );
  }

  if (!table) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-surface border border-theme text-center" dir="rtl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-base font-black text-theme-text mb-2">الطاولة غير موجودة أو انتهت الجلسة</h2>
          <p className="text-xs text-theme-muted mb-6">
            قد تكون هذه الجلسة اكتملت أو أن الرابط غير صحيح. يمكنك استكشاف الطاولات النشطة حالياً.
          </p>
          <Link href="/campus/tables">
            <Button variant="primary" size="md" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الطاولات</span>
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CampusAccessGate requiredStream={table.stream} isTableSession={true}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6" dir="rtl">
          <Interactive3DTable
            table={table}
            currentUserId={studentId}
            currentUserName={studentName}
            currentUserAvatar={studentAvatar}
            currentUserStream={studentStream}
            onTableUpdate={(updated) => setTable(updated)}
          />
        </div>
      </CampusAccessGate>
    </AppShell>
  );
}
