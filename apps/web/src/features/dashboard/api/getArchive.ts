import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface ArchivedEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    totalRegistrations: number;
    attendanceCount: number;
    attendanceRate: number;
    averageRating: number;
    organizerName?: string;
}

export async function fetchArchive(role: string) {
    const endpoint = role === 'ADMIN' 
        ? '/api/analytics/admin/archive' 
        : '/api/analytics/organizer/archive';

    const res = await apiFetch(endpoint, {
        method: 'GET',
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch archived events');
    }

    const result = await res.json();
    return result.data as ArchivedEvent[];
}

export function useArchive() {
    const { token, profile } = useAuthStore();
    const role = profile?.role || 'STUDENT';
    const isAuthorized = role === 'ADMIN' || role === 'ORGANIZER';

    return useQuery({
        queryKey: ['archive', role],
        queryFn: () => fetchArchive(role),
        enabled: !!token && isAuthorized,
    });
}
