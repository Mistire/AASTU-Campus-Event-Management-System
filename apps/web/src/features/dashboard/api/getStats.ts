import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

interface DashboardStats {
    users: number;
    events: number;
    registrations: number;
    venues: number;
    categories: number;
}

export async function fetchDashboardStats() {
    const res = await apiFetch(`/api/admin/stats`, {
        method: 'GET',
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
        queryFn: fetchDashboardStats,
        enabled: !!token && isAdmin,
    });
}
