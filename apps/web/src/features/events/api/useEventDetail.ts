import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Event } from './useEvents';

export async function fetchEventDetail(id: string) {
    const res = await apiFetch(`/api/events/${id}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch event detail');
    }

    const result = await res.json();
    return result.data as Event;
}

export function useEventDetail(id: string) {
    return useQuery({
        queryKey: ['event', id],
        queryFn: () => fetchEventDetail(id),
        enabled: !!id,
        retry: false,
    });
}
