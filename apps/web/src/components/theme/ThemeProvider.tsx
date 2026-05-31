"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, _hasHydrated]);

  // Prevent flash by waiting for hydration if needed, 
  // but usually we want to render children immediately.
  return <>{children}</>;
}
