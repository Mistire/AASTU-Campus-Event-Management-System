'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ROUTE_PERMISSIONS } from '../config/routes';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { profile, token, hasAnyRole } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // If no token, redirect to login unless on public route
        if (!token && !pathname.includes('/login')) {
            router.push('/login');
            return;
        }

        if (pathname.includes('/login')) {
            setIsAuthorized(true);
            return;
        }

        // Find the permission configuration for the current route
        const currentRouteConfig = ROUTE_PERMISSIONS.find(route => pathname.startsWith(route.path));

        if (currentRouteConfig) {
            if (hasAnyRole(currentRouteConfig.allowedRoles)) {
                setIsAuthorized(true);
            } else {
                router.push('/unauthorized'); // or redirect to a default allowed page
            }
        } else {
            // If no specific route config is found, we might want to allow it or deny it.
            // Defaulting to allow for now, but in production, we might want to restrict this.
            setIsAuthorized(true);
        }
    }, [pathname, profile, token, hasAnyRole, router]);

    if (!isAuthorized) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a proper loading spinner
    }

    return <>{children}</>;
}
