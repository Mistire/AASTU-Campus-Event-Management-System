import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export const useTickets = () => {
    return useQuery({
        queryKey: ['admin-support-tickets'],
        queryFn: async () => {
            const res = await apiFetch('/api/support/tickets');
            if (!res.ok) throw new Error('Failed to fetch support tickets');
            const result = await res.json();
            return result.data || result;
        },
    });
};
