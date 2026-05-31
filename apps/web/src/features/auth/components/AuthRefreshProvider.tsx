"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { scheduleProactiveRefresh } from "@/lib/api-client";


export function AuthRefreshProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !refreshToken) return;

    const cancel = scheduleProactiveRefresh();
    return () => {
      cancel?.();
    };
  }, [token, refreshToken, hasHydrated]);

  return <>{children}</>;
}
