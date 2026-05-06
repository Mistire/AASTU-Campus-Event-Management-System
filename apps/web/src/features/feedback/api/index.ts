import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export const useFeedback = () => {
    return useQuery({
        queryKey: ['admin-feedback'],
        queryFn: async () => {
            const res = await apiFetch('/api/feedback');
            if (!res.ok) throw new Error('Failed to fetch feedback');
            const result = await res.json();
            return result.data || result;
        },
    });
};
