"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signOut as serviceSignOut } from "@/lib/auth/service";
import {
  type AccountSummary,
  type AppRole,
  isProfileComplete,
} from "@/lib/auth/account";

interface AuthContextValue {
  account: AccountSummary | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAccount: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  initialAccount?: AccountSummary | null;
  children: React.ReactNode;
}

export function AuthProvider({
  initialAccount = null,
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const [account, setAccount] = React.useState<AccountSummary | null>(initialAccount);
  const [prevInitial, setPrevInitial] = React.useState(initialAccount);
  const [isLoading, setIsLoading] = React.useState(!initialAccount && isSupabaseConfigured());

  // Sync state if initialAccount prop changes during server re-render
  if (initialAccount !== prevInitial) {
    setPrevInitial(initialAccount);
    setAccount(initialAccount);
  }

  const loadAccount = React.useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccount(null);
        return;
      }

      const [profileRes, roleRes, regRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role, is_active")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("registrations")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const profile = profileRes.data;
      const roleData = roleRes.data;
      const regData = regRes.data;

      const fullName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      const metadataName =
        (typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === "string" &&
          user.user_metadata.name) ||
        "";

      const displayName =
        fullName ||
        metadataName ||
        (user.email ? user.email.split("@")[0] : "") ||
        "Member";

      setAccount({
        id: user.id,
        email: user.email ?? "",
        displayName,
        role: (roleData?.role as AppRole) ?? null,
        isActive: roleData?.is_active ?? true,
        registrationStatus: regData?.status ?? null,
        profileComplete: isProfileComplete(profile),
      });
    } catch {
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAccount = React.useCallback(() => {
    void loadAccount();
    router.refresh();
  }, [loadAccount, router]);

  const handleSignOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await serviceSignOut();
      setAccount(null);
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Load account client-side on mount if not provided by server
  React.useEffect(() => {
    if (!initialAccount) {
      void loadAccount();
    }

    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        void loadAccount();
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialAccount, loadAccount, router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      account,
      isLoading,
      signOut: handleSignOut,
      refreshAccount,
    }),
    [account, isLoading, handleSignOut, refreshAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
