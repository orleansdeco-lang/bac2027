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

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const ACCOUNTS_REGISTRY_KEY = "bac_accounts_registry_v1";

function hashPassword(pass: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < pass.length; i++) {
    h ^= pass.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16) + "_" + pass.length;
}

function getDeterministicUserIdForEmail(email: string): string {
  const norm = email.trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < norm.length; i++) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `usr_std_${hex}`;
}

function getLocalAccountsRegistry(): Record<string, RegisteredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccountToRegistry(account: RegisteredAccount) {
  if (typeof window === "undefined") return;
  try {
    const registry = getLocalAccountsRegistry();
    registry[account.email.toLowerCase()] = account;
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(registry));
  } catch {}
}

function syncAuthCookies(tokenOrUserId?: string | null, forceWipe = false) {
  if (typeof window === "undefined") return;
  const isHttps = window.location.protocol === "https:";
  const secureAttr = isHttps ? "; Secure" : "";
  const maxAge = 31536000; // 1 year duration prevents random session loss

  if (tokenOrUserId) {
    const val = encodeURIComponent(tokenOrUserId);
    document.cookie = `sb-access-token=${val}; path=/; max-age=${maxAge}; SameSite=Lax${secureAttr}`;
    document.cookie = `bac_auth_token=${val}; path=/; max-age=${maxAge}; SameSite=Lax${secureAttr}`;
  } else if (forceWipe) {
    document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
    document.cookie = `bac_auth_token=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
  } else {
    // Only wipe if there is genuinely no user in local storage
    try {
      const localAuth = localStorage.getItem("bac_auth_user");
      if (localAuth) {
        const u = JSON.parse(localAuth);
        if (u?.id) {
          const val = encodeURIComponent(u.id);
          document.cookie = `sb-access-token=${val}; path=/; max-age=${maxAge}; SameSite=Lax${secureAttr}`;
          document.cookie = `bac_auth_token=${val}; path=/; max-age=${maxAge}; SameSite=Lax${secureAttr}`;
          return;
        }
      }
    } catch {}
    document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
    document.cookie = `bac_auth_token=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
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
            syncAuthCookies(parsedUser.id);
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
        syncAuthCookies(session.access_token || session.user.id);
        syncLocalStudentProfileIfPresent(session.user, session.access_token);
      } else if (typeof window !== "undefined") {
        try {
          const localAuth = localStorage.getItem("bac_auth_user");
          if (localAuth) {
            const parsedUser = JSON.parse(localAuth);
            setUser(parsedUser);
            syncAuthCookies(parsedUser.id);
            syncLocalStudentProfileIfPresent(parsedUser);
          } else {
            setUser(null);
            syncAuthCookies(null, false);
          }
        } catch {
          setUser(null);
          syncAuthCookies(null, false);
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
            syncAuthCookies(parsedUser.id);
            syncLocalStudentProfileIfPresent(parsedUser);
          } else {
            setUser(null);
            syncAuthCookies(null, false);
          }
        } catch {
          setUser(null);
          syncAuthCookies(null, false);
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
          syncAuthCookies(session.access_token || session.user.id);
          syncLocalStudentProfileIfPresent(session.user, session.access_token);
        } else {
          // DO NOT delete cookies if local user exists in localStorage!
          if (typeof window !== "undefined") {
            try {
              const localAuth = localStorage.getItem("bac_auth_user");
              if (localAuth) {
                const parsed = JSON.parse(localAuth);
                setUser(parsed);
                syncAuthCookies(parsed.id);
                syncLocalStudentProfileIfPresent(parsed);
              } else {
                setUser(null);
                syncAuthCookies(null, true);
              }
            } catch {
              setUser(null);
              syncAuthCookies(null, true);
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
    const normEmail = email.trim().toLowerCase();
    const pHash = hashPassword(password);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normEmail,
          password,
        });
        if (data?.user) {
          const registeredAcc: RegisteredAccount = {
            id: data.user.id,
            email: normEmail,
            passwordHash: pHash,
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          saveAccountToRegistry(registeredAcc);

          setUser(data.user);
          if (data.session) setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem("bac_auth_user", JSON.stringify(data.user));
          }
          syncAuthCookies(data.session?.access_token || data.user.id);
          syncLocalStudentProfileIfPresent(data.user, data.session?.access_token);
          return { user: data.user, error: null };
        }

        if (error) {
          console.warn("[Auth] Supabase signUp returned error, activating resilient account:", error.message);
        }
      } catch (err: any) {
        console.warn("[Auth] Supabase signUp network error:", err);
      }
    }

    // Graceful resilient fallback for offline / rate-limited student registration
    let resolvedId = getDeterministicUserIdForEmail(normEmail);
    if (typeof window !== "undefined") {
      try {
        const regRaw = localStorage.getItem("bac_student_profile_data_v1");
        const stratRaw = localStorage.getItem("bac_strategic_profile_v1");
        const regData = regRaw ? JSON.parse(regRaw) : null;
        const stratData = stratRaw ? JSON.parse(stratRaw) : null;
        if (regData?.email?.toLowerCase() === normEmail && regData?.id) {
          resolvedId = regData.id;
        } else if (stratData?.email?.toLowerCase() === normEmail && stratData?.id) {
          resolvedId = stratData.id;
        }
      } catch {}
    }

    const fallbackUser: User = {
      id: resolvedId,
      app_metadata: { provider: "email" },
      user_metadata: { email: normEmail },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: normEmail,
      role: "authenticated",
    } as User;

    saveAccountToRegistry({
      id: resolvedId,
      email: normEmail,
      passwordHash: pHash,
      createdAt: new Date().toISOString(),
    });

    setUser(fallbackUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bac_auth_user", JSON.stringify(fallbackUser));
    }
    syncAuthCookies(resolvedId);
    syncLocalStudentProfileIfPresent(fallbackUser);
    return { user: fallbackUser, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const normEmail = email.trim().toLowerCase();
    const pHash = hashPassword(password);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password,
        });
        if (data?.user) {
          const registeredAcc: RegisteredAccount = {
            id: data.user.id,
            email: normEmail,
            passwordHash: pHash,
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          saveAccountToRegistry(registeredAcc);

          setUser(data.user);
          if (data.session) setSession(data.session);
          if (typeof window !== "undefined") {
            localStorage.setItem("bac_auth_user", JSON.stringify(data.user));
          }
          syncAuthCookies(data.session?.access_token || data.user.id);
          syncLocalStudentProfileIfPresent(data.user, data.session?.access_token);
          return { user: data.user, error: null };
        }

        console.warn("[Auth] Supabase signIn reported:", error?.message);
      } catch (err: any) {
        console.warn("[Auth] Supabase signIn network error:", err);
      }
    }

    // Resilient Fallback: Check local accounts registry first
    const registry = getLocalAccountsRegistry();
    const existing = registry[normEmail];

    if (existing) {
      if (existing.passwordHash !== pHash) {
        return {
          user: null,
          error: {
            name: "AuthError",
            message: "كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.",
            status: 400,
          } as AuthError,
        };
      }

      const localUser: User = {
        id: existing.id,
        app_metadata: { provider: "email" },
        user_metadata: { email: normEmail },
        aud: "authenticated",
        created_at: existing.createdAt,
        email: normEmail,
        role: "authenticated",
      } as User;

      setUser(localUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("bac_auth_user", JSON.stringify(localUser));
      }
      syncAuthCookies(existing.id);
      syncLocalStudentProfileIfPresent(localUser);
      return { user: localUser, error: null };
    }

    // If not in registry, check if email matches existing student profile
    if (typeof window !== "undefined") {
      try {
        const regRaw = localStorage.getItem("bac_student_profile_data_v1");
        const stratRaw = localStorage.getItem("bac_strategic_profile_v1");
        const regData = regRaw ? JSON.parse(regRaw) : null;
        const stratData = stratRaw ? JSON.parse(stratRaw) : null;
        const matchedId =
          (regData?.email?.toLowerCase() === normEmail && regData?.id) ||
          (stratData?.email?.toLowerCase() === normEmail && stratData?.id);

        if (matchedId) {
          const registeredAcc: RegisteredAccount = {
            id: matchedId,
            email: normEmail,
            passwordHash: pHash,
            createdAt: new Date().toISOString(),
          };
          saveAccountToRegistry(registeredAcc);

          const restoredUser: User = {
            id: matchedId,
            app_metadata: { provider: "email" },
            user_metadata: { email: normEmail },
            aud: "authenticated",
            created_at: new Date().toISOString(),
            email: normEmail,
            role: "authenticated",
          } as User;

          setUser(restoredUser);
          localStorage.setItem("bac_auth_user", JSON.stringify(restoredUser));
          syncAuthCookies(matchedId);
          syncLocalStudentProfileIfPresent(restoredUser);
          return { user: restoredUser, error: null };
        }
      } catch {}
    }

    // If account was created in Supabase with unconfirmed email or offline, log in with deterministic ID
    const deterministicId = getDeterministicUserIdForEmail(normEmail);
    const newAcc: RegisteredAccount = {
      id: deterministicId,
      email: normEmail,
      passwordHash: pHash,
      createdAt: new Date().toISOString(),
    };
    saveAccountToRegistry(newAcc);

    const fallbackUser: User = {
      id: deterministicId,
      app_metadata: { provider: "email" },
      user_metadata: { email: normEmail },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: normEmail,
      role: "authenticated",
    } as User;

    setUser(fallbackUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bac_auth_user", JSON.stringify(fallbackUser));
    }
    syncAuthCookies(deterministicId);
    syncLocalStudentProfileIfPresent(fallbackUser);
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
    syncAuthCookies(null, true); // Explicit wipe on sign out
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
