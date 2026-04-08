import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface RecentRegistration {
    id: string;
    registrationDate: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        profileImage?: string;
    };
    event: {
        id: string;
        title: string;
    };
    status: {
        id: string;
        name: string;
    };
}

export async function fetchRecentRegistrations(role: string) {
    const endpoint = role === 'ADMIN' 
        ? '/api/admin/registrations/recent' 
        : '/api/analytics/organizer/registrations/recent';

    const res = await apiFetch(endpoint, {
        method: 'GET',
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch recent registrations');
    }

    const result = await res.json();
    return result.data as RecentRegistration[];
}

export function useRecentRegistrations() {
    const { token, profile } = useAuthStore();
    const role = (profile?.role || 'STUDENT').toUpperCase();
    const isAuthorized = role === 'ADMIN' || role === 'ORGANIZER';

    return useQuery({
        queryKey: ['recent-registrations', role],
        queryFn: () => fetchRecentRegistrations(role),
        enabled: !!token && isAuthorized,
    });
}
