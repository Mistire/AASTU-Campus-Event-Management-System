import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface DashboardStats {
    users: number;
    events: number;
    registrations: number;
    venues: number;
    categories: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchDashboardStats(token: string) {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch dashboard stats');
    }

    const result = await res.json();
    return result.data as DashboardStats;
}

export function useDashboardStats() {
    const { token, profile } = useAuthStore();

    // Only fetch if admin (or according to your permission logic)
    const isAdmin = profile?.role === 'ADMIN';

    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => fetchDashboardStats(token!),
        enabled: !!token && isAdmin,
    });
}
