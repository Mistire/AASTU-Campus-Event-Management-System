import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export const useLogs = (query: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ['admin-audit-logs', query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query.page) params.append('page', query.page.toString());
            if (query.limit) params.append('limit', query.limit.toString());
            if (query.search) params.append('search', query.search);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const res = await apiFetch(`/api/audit-logs${queryString}`);
            if (!res.ok) throw new Error('Failed to fetch logs');
            
            const result = await res.json();
            // This hook now returns the full paginated object { data: [...], meta: ... }
            return result.data !== undefined ? result.data : result;
        },
    });
};

export const useLogDetail = (id: string | null) => {
    return useQuery({
        queryKey: ['admin-audit-log', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await apiFetch(`/api/audit-logs/${id}`);
            if (!res.ok) throw new Error('Failed to fetch log details');
            const result = await res.json();
            return result.data || result;
        },
        enabled: !!id,
    });
};
