"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { OpsSidebar } from "@/components/ops/OpsSidebar";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // In local development mode, allow access for testing if configured
    if (process.env.NODE_ENV !== "production") {
      setAuthorized(true);
      return;
    }

    if (!user) {
      setAuthorized(false);
      return;
    }

    // Check operator role
    fetch("/api/ops/overview")
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
        setAuthorized(false);
      });
  }, [user, isLoading]);

  if (isLoading || authorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Verifying operator authorization...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">403 — Unauthorized Access</h1>
            <p className="text-xs text-slate-400 mt-1">
              This area is restricted to authorized BAC Mastery operators and administrators.
              Student accounts are strictly forbidden from accessing the Operations Center.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased font-sans">
      <OpsSidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-slate-950 pb-16">
        {children}
      </main>
    </div>
  );
}
