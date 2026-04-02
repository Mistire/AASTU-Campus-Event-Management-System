'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, Role } from '@/features/auth/store/useAuthStore';
import { ROUTE_PERMISSIONS } from '../config/routes';
import { ShieldAlert, Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { profile, token, hasAnyRole } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Handle public routes
        if (pathname === '/login' || pathname === '/register') {
            if (token) {
                router.push('/dashboard');
            } else {
                setIsAuthorized(true);
            }
            return;
        }

        // Redirect to login if no token
        if (!token) {
            router.push('/login');
            return;
        }

        // Special case for dashboard root
        if (pathname === '/dashboard' || pathname === '/') {
            setIsAuthorized(true);
            return;
        }

        // Find the permission configuration for the current route
        // We look for the most specific match (longest path prefix)
        const matchingRoutes = ROUTE_PERMISSIONS.filter(route => pathname.startsWith(route.path))
            .sort((a, b) => b.path.length - a.path.length);

        const currentRouteConfig = matchingRoutes[0];

        if (currentRouteConfig) {
            if (hasAnyRole(currentRouteConfig.allowedRoles)) {
                setIsAuthorized(true);
            } else {
                console.warn(`Unauthorized access attempt to ${pathname} by ${profile?.role}`);
                setIsAuthorized(false);
                router.push('/unauthorized');
            }
        } else {
            // Default policy: If not specified in all-pages.json, allow if authenticated
            // This can be changed to restrictive by setting setIsAuthorized(false)
            setIsAuthorized(true);
        }
    }, [pathname, profile, token, hasAnyRole, router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
                <p className="text-sm font-medium animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    if (isAuthorized === false) {
        return null; // Router redirect is happening
    }

    return <>{children}</>;
}
