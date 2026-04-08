import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';
import { Event } from './useEvents';

export async function fetchRecommendations(userId: string, n: number = 5) {
    const res = await apiFetch(`/api/recommendations/user/${userId}?n=${n}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch recommendations');
    }

    const result = await res.json();
    return result.data as Event[];
}

export async function fetchSimilarEvents(eventId: string, n: number = 5) {
    const res = await apiFetch(`/api/recommendations/similar/${eventId}?n=${n}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch similar events');
    }

    const result = await res.json();
    return result.data as Event[];
}

export function useRecommendations(n: number = 5) {
    const { profile } = useAuthStore();
    const userId = profile?.id;

    const query = useQuery({
        queryKey: ['recommendations', userId, n],
        queryFn: () => fetchRecommendations(userId!, n),
        enabled: !!userId,
        retry: false,
    });

    return {
        ...query,
        data: query.data,
    };
}

export function useSimilarEvents(eventId: string, n: number = 5) {
    const query = useQuery({
        queryKey: ['similar-events', eventId, n],
        queryFn: () => fetchSimilarEvents(eventId, n),
        enabled: !!eventId,
        retry: false,
    });

    return {
        ...query,
        data: query.data,
    };
}
