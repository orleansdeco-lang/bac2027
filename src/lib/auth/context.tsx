"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { purgeUserAndLegacyStorage, purgeUserScopedStorage, purgeLegacyGlobalStorage } from "../onboarding/profile";
import { StudentRepository } from "../repositories/student-repository";
import { clearAllMissionData } from "../mission/storage";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function syncAuthCookies(token?: string | null) {
  if (typeof window === "undefined") return;
  const isHttps = window.location.protocol === "https:";
  const secureAttr = isHttps ? "; Secure" : "";
  if (token) {
    document.cookie = `sb-access-token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
  } else {
    document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
  }
}

function syncLocalStudentProfileIfPresent(userObj?: User | null, token?: string | null) {
  if (typeof window === "undefined") return;
  try {
    const regRaw = localStorage.getItem("bac_student_profile_data_v1");
    const stratRaw = localStorage.getItem("bac_strategic_profile_v1");
    const regData = regRaw ? JSON.parse(regRaw) : null;
    const stratData = stratRaw ? JSON.parse(stratRaw) : null;

    const uid = userObj?.id || regData?.id || stratData?.id;
    if (!uid) return;

    const payload = {
      id: uid,
      email: userObj?.email || regData?.email,
      fullName: regData?.studentName || stratData?.studentName,
      studentPhone: regData?.studentPhone || stratData?.studentPhone,
      streamId: regData?.streamId || stratData?.streamId,
      wilayaName: regData?.wilayaName || stratData?.wilayaName,
      communeName: regData?.communeName || stratData?.communeName,
      source: "session_restore"
    };

    fetch("/api/student/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.student && typeof window !== "undefined") {
          const s = data.student;
          const targetKey = `bac_mastery_strategic_profile:${uid}`;
          try {
            const currentRaw = localStorage.getItem(targetKey);
            const current = currentRaw ? JSON.parse(currentRaw) : {};
            const updated = {
              ...current,
              access_status: s.accessStatus,
              plan: s.plan,
              subscription_started_at: s.subscriptionStartedAt,
              subscription_expires_at: s.subscriptionExpiresAt,
              rejection_reason: s.rejectionReason,
              isServerAuthoritativePaid: s.accessStatus === "PAID",
            };
            localStorage.setItem(targetKey, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent("bac_student_access_updated", { detail: updated }));
          } catch {}
        }
      })
      .catch(() => {});
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (typeof window !== "undefined") {
        try {
          const localAuth = localStorage.getItem("bac_auth_user");
          if (localAuth) {
            const parsedUser = JSON.parse(localAuth);
            setUser(parsedUser);
            syncLocalStudentProfileIfPresent(parsedUser);
          }
        } catch {}
      }
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        syncAuthCookies(session.access_token);
        syncLocalStudentProfileIfPresent(session.user, session.access_token);
      } else if (typeof window !== "undefined") {
        try {
          const localAuth = localStorage.getItem("bac_auth_user");
          if (localAuth) {
            const parsedUser = JSON.parse(localAuth);
            setUser(parsedUser);
            syncLocalStudentProfileIfPresent(parsedUser);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch(() => {
      if (typeof window !== "undefined") {
        try {
          const localAuth = localStorage.getItem("bac_auth_user");
          if (localAuth) {
            const parsedUser = JSON.parse(localAuth);
            setUser(parsedUser);
            syncLocalStudentProfileIfPresent(parsedUser);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          syncAuthCookies(session.access_token);
          syncLocalStudentProfileIfPresent(session.user, session.access_token);
        } else {
          syncAuthCookies(null);
          if (typeof window !== "undefined") {
            try {
              const localAuth = localStorage.getItem("bac_auth_user");
              if (localAuth) setUser(JSON.parse(localAuth));
              else setUser(null);
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (data?.user) {
          setUser(data.user);
          if (data.session) setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem("bac_auth_user", JSON.stringify(data.user));
          }
          return { user: data.user, error: null };
        }
        if (error) {
          return { user: null, error };
        }
      } catch (err: any) {
        console.warn("[Auth] Supabase signUp network error:", err);
      }
    }

    // Graceful fallback for offline / local student resilience
    const fallbackId = "usr_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    const fallbackUser: User = {
      id: fallbackId,
      app_metadata: {},
      user_metadata: { email },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email,
      role: "authenticated",
    } as User;

    setUser(fallbackUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bac_auth_user", JSON.stringify(fallbackUser));
    }
    return { user: fallbackUser, error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (data?.user) {
          setUser(data.user);
          if (data.session) setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem("bac_auth_user", JSON.stringify(data.user));
          }
          return { user: data.user, error: null };
        }
        if (error) {
          return { user: null, error };
        }
      } catch (err: any) {
        console.warn("[Auth] Supabase signIn network error:", err);
      }
    }

    // Graceful fallback for offline / local student resilience
    const fallbackId = "usr_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    const fallbackUser: User = {
      id: fallbackId,
      app_metadata: {},
      user_metadata: { email },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email,
      role: "authenticated",
    } as User;

    setUser(fallbackUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bac_auth_user", JSON.stringify(fallbackUser));
    }
    return { user: fallbackUser, error: null };
  };

  const signOut = async () => {
    const currentUid = user?.id;
    if (currentUid) {
      purgeUserScopedStorage(currentUid);
      purgeUserAndLegacyStorage(currentUid);
      StudentRepository.clearMemoryCache(currentUid);
    }
    purgeLegacyGlobalStorage();
    clearAllMissionData();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("bac_auth_user");
    }
    syncAuthCookies(null);
    return { error: null };
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
    }),
    [user, session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
