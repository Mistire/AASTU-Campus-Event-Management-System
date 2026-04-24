import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export const useLogs = () => {
    return useQuery({
        queryKey: ['admin-audit-logs'],
        queryFn: async () => {
            const res = await apiFetch('/api/audit-logs');
            if (!res.ok) throw new Error('Failed to fetch logs');
            const result = await res.json();
            return result.data || result;
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
