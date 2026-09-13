"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../supabase/client";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (typeof window !== "undefined") {
        try {
          const localAuth = localStorage.getItem("bac_auth_user");
          if (localAuth) setUser(JSON.parse(localAuth));
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
      } else if (typeof window !== "undefined") {
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
      setIsLoading(false);
    }).catch(() => {
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
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else if (typeof window !== "undefined") {
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
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: new Error("Supabase is not configured") as unknown as AuthError };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: new Error("Supabase is not configured") as unknown as AuthError };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
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
