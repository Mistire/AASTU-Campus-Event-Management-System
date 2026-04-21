import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchRecentRegistrations(token: string, role: string) {
    const endpoint = role === 'ADMIN' 
        ? `${API_URL}/api/admin/registrations/recent` 
        : `${API_URL}/api/analytics/organizer/registrations/recent`;

    const res = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
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
    const role = profile?.role || 'STUDENT';
    const isAuthorized = role === 'ADMIN' || role === 'ORGANIZER';

    return useQuery({
        queryKey: ['recent-registrations', role],
        queryFn: () => fetchRecentRegistrations(token!, role),
        enabled: !!token && isAuthorized,
    });
}
