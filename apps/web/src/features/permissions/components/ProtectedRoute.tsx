"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTE_PERMISSIONS } from "../config/routes";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, token, hasAnyRole, _hasHydrated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    console.log("[ProtectedRoute] Checking:", pathname, "Role:", profile?.role);

    const isPublicRoute = 
      pathname === "/login" || 
      pathname === "/register" || 
      pathname === "/auth/telegram-onboarding" ||
      pathname.startsWith("/graduation") ||
      pathname.startsWith("/feedback") ||
      pathname.startsWith("/support");

    if (isPublicRoute) {
      if (token && (pathname === "/login" || pathname === "/register")) {
        const searchParams = new URLSearchParams(window.location.search);
        let redirectTo = searchParams.get("redirectTo");
        const isDashboardUser = profile?.role === "ADMIN" || profile?.role === "ORGANIZER" || profile?.role === "STAFF";
        
        if (!redirectTo) {
            redirectTo = isDashboardUser ? "/dashboard" : "/discovery";
        } else {
            // If user is being redirected to a public page, override it to their home base
            const isDashboardRoute = redirectTo.startsWith('/dashboard') || redirectTo.startsWith('/api');
            const isStudentRoute = redirectTo.startsWith('/discovery') || redirectTo.startsWith('/my-events') || redirectTo.startsWith('/profile');
            
            if (isDashboardUser && !isDashboardRoute) {
                redirectTo = "/dashboard";
            } else if (!isDashboardUser && !isStudentRoute) {
                redirectTo = "/discovery";
            }
        }
        router.push(redirectTo);
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    if (!token) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (pathname === "/dashboard" || pathname === "/") {
      setIsAuthorized(true);
      return;
    }

    const matchingRoutes = ROUTE_PERMISSIONS.filter((route) =>
      pathname.startsWith(route.path)
    ).sort((a, b) => b.path.length - a.path.length);

    const currentRouteConfig = matchingRoutes[0];

    if (currentRouteConfig) {
      if (hasAnyRole(currentRouteConfig.allowedRoles)) {
        setIsAuthorized(true);
      } else {
        console.warn(
          `Unauthorized access attempt to ${pathname} by ${profile?.role}`
        );
        setIsAuthorized(false);
        router.push("/unauthorized");
      }
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, profile, token, hasAnyRole, router, _hasHydrated]);

  if (!_hasHydrated || isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
        <p className="text-sm font-medium animate-pulse">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
