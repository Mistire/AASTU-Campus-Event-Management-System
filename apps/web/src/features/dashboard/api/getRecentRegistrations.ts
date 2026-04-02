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

export async function fetchRecentRegistrations(token: string) {
    const res = await fetch(`${API_URL}/api/admin/registrations/recent`, {
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
    const isAdmin = profile?.role === 'ADMIN';

    return useQuery({
        queryKey: ['recent-registrations'],
        queryFn: () => fetchRecentRegistrations(token!),
        enabled: !!token && isAdmin,
    });
}
