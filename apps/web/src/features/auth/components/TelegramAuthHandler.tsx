"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export function TelegramAuthHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, profile, setAuth, _hasHydrated } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasCheckedTelegram, setHasCheckedTelegram] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    // Check if running inside Telegram Mini App
    if (typeof window === "undefined") return;
    
    // Safety check to ensure Telegram library is loaded
    const telegram = (window as any).Telegram;
    if (!telegram?.WebApp) {
      setHasCheckedTelegram(true);
      return;
    }

    const webApp = telegram.WebApp;
    webApp.ready();
    webApp.expand();

    const initData = webApp.initData;

    // Helper to perform deep link redirection using start_param
    const handleDeepLink = () => {
      const startParam = webApp.initDataUnsafe?.start_param;
      if (startParam) {
        const eventId = startParam.startsWith("event_") ? startParam.replace("event_", "") : startParam;
        if (eventId) {
          router.push(`/events/${eventId}`);
          return true; // Deep linked!
        }
      }
      return false; // No deep link
    };

    const redirectUser = (role: string) => {
      if (handleDeepLink()) return;

      const upperRole = role.toUpperCase();
      const isDashboardUser = upperRole === "ADMIN" || upperRole === "ORGANIZER" || upperRole === "STAFF";
      const dest = isDashboardUser ? "/dashboard" : "/discovery";
      if (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname === "/register") {
        router.push(dest);
      }
    };

    if (!initData) {
      setHasCheckedTelegram(true);
      return;
    }

    if (token) {
      setHasCheckedTelegram(true);
      if (profile?.role) {
        redirectUser(profile.role);
      }
      return;
    }

    // Attempt Telegram Auto-Login
    const performTelegramLogin = async () => {
      setIsAuthenticating(true);
      try {
        const response = await apiFetch("/api/auth/telegram/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ initData }),
          skipAuth: true,
        });

        if (!response.ok) {
          throw new Error("Telegram auth failed");
        }

        const data = await response.json();

        if (data.onboardingRequired) {
          // Redirect to onboarding page, passing the original path as redirect query
          router.push(`/auth/telegram-onboarding?redirectTo=${encodeURIComponent(pathname)}`);
        } else {
          // Success! Map user data to local AuthProfile schema
          const userProfile = {
            id: data.user.id,
            full_name: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone || "",
            role: data.user.role,
            roles: [data.user.role],
            user_roles: [{ role: { name: data.user.role } }],
            profileImage: data.user.profileImage || undefined,
          };

          setAuth(data.access_token, data.refresh_token, userProfile);
          redirectUser(data.user.role);
        }
      } catch (error) {
        console.error("Auto-login via Telegram WebApp failed:", error);
      } finally {
        setIsAuthenticating(false);
        setHasCheckedTelegram(true);
      }
    };

    performTelegramLogin();
  }, [_hasHydrated, token, setAuth, router, pathname]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-400 font-brand">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium animate-pulse text-gray-200">
          Connecting to Campus Events via Telegram...
        </p>
      </div>
    );
  }

  // Allow children rendering if we aren't authenticating
  return <>{children}</>;
}
