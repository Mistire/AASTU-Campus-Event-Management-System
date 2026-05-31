import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

interface DashboardStats {
    // Admin stats
    users?: number;
    events?: number;
    registrations?: number;
    venues?: number;
    categories?: number;
    approvedRegistrations?: number;
    pendingRegistrations?: number;
    // Organizer stats
    totalEvents?: number;
    totalRegistrations?: number;
    pendingApprovals?: number;
    totalAttendance?: number;
}

export async function fetchDashboardStats(role: string) {
    const endpoint = role === 'ADMIN' ? '/api/admin/stats' : '/api/analytics/organizer/overview';
    
    const res = await apiFetch(endpoint, {
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
    const role = profile?.role || 'STUDENT';
    const isAuthorized = role === 'ADMIN' || role === 'ORGANIZER';

    return useQuery({
        queryKey: ['dashboard-stats', role],
        queryFn: () => fetchDashboardStats(role),
        enabled: !!token && isAuthorized,
    });
}
