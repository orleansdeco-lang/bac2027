"use client";

/**
 * SHATER Control Center — Client-Side Administrative Session & Utilities
 * 
 * Provides authenticated client fetch, session state inspection, and permission helpers.
 * Note: All authorization decisions are strictly enforced by the server;
 * client helpers are strictly for UI rendering / conditional view ergonomics.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { UserRole } from "@/lib/operations/types";
import { AdminPermission, hasPermission, hasAnyPermission } from "./permissions";
import { supabase } from "@/lib/supabase/client";

export interface AdminClientUser {
  id: string;
  email: string | null;
  role: UserRole;
  isOwner: boolean;
  permissions: AdminPermission[];
}

export interface AdminSessionState {
  user: AdminClientUser | null;
  loading: boolean;
  authorized: boolean;
  error: string | null;
  hasPermission: (permission: AdminPermission) => boolean;
  hasAnyPermission: (permissions: AdminPermission[]) => boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

export async function getAdminClientToken(): Promise<string | null> {
  // 1. Check active Supabase session
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch {}
  }

  // 2. Check localStorage
  if (typeof window !== "undefined") {
    try {
      const direct = localStorage.getItem("ops_auth_token") || localStorage.getItem("admin_auth_token");
      if (direct) return direct;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("-auth-token") || key.includes("sb-"))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.access_token) return parsed.access_token;
              if (Array.isArray(parsed) && parsed[0]) return parsed[0];
            } catch {}
          }
        }
      }
    } catch {}
  }

  // 3. Check document.cookie
  if (typeof document !== "undefined") {
    const opsMatch = document.cookie.match(/(?:^|; )ops_auth_token=([^;]*)/);
    if (opsMatch && opsMatch[1]) return decodeURIComponent(opsMatch[1]);
    const sbMatch = document.cookie.match(/(?:^|; )sb-access-token=([^;]*)/);
    if (sbMatch && sbMatch[1]) return decodeURIComponent(sbMatch[1]);
  }

  return null;
}

/**
 * Authenticated Fetch wrapper for Admin API endpoints
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getAdminClientToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}

const AdminSessionContext = createContext<AdminSessionState | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/verify");
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.user) {
          setUser(data.user);
          setAuthorized(true);
        } else {
          setUser(null);
          setAuthorized(false);
        }
      } else {
        setUser(null);
        setAuthorized(false);
        if (res.status === 401) {
          setError("يرجى تسجيل الدخول إلى مركز التحكم");
        } else if (res.status === 403) {
          setError("غير مصرح: حسابك لا يملك صلاحيات إدارية");
        }
      }
    } catch (err: any) {
      setUser(null);
      setAuthorized(false);
      setError(err?.message || "خطأ أثناء التحقق من الصلاحيات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("ops_auth_token");
      localStorage.removeItem("admin_auth_token");
      document.cookie = "ops_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    setUser(null);
    setAuthorized(false);
    window.location.href = "/ops/login";
  }, []);

  const checkPerm = useCallback(
    (permission: AdminPermission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  const checkAnyPerm = useCallback(
    (permissions: AdminPermission[]) => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions);
    },
    [user]
  );

  const value: AdminSessionState = {
    user,
    loading,
    authorized,
    error,
    hasPermission: checkPerm,
    hasAnyPermission: checkAnyPerm,
    refetch: checkSession,
    logout: handleLogout,
  };

  return React.createElement(AdminSessionContext.Provider, { value }, children);
}

export function useAdminSession(): AdminSessionState {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within an AdminSessionProvider");
  }
  return context;
}
