"use client";

import { useEffect, useState } from "react";
import { CategoryPicker } from "./CategoryPicker";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AnimatePresence } from "framer-motion";

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { profile } = useAuthStore();
  const [showPicker, setShowPicker] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only students get the onboarding flow
    const shouldShow = profile !== null && 
                      (profile.role === "STUDENT" || profile.roles?.includes("STUDENT")) && 
                      localStorage.getItem("cems_onboarded") !== "true";
    
    // Using a microtask to avoid synchronous setState trigger in render warning
    queueMicrotask(() => {
      if (shouldShow) setShowPicker(true);
      setIsReady(true);
    });
  }, [profile]);

  if (!isReady) return null;

  return (
    <>
      <AnimatePresence>
        {showPicker && (
          <CategoryPicker onComplete={() => setShowPicker(false)} />
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
