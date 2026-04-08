import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Event } from './useEvents';

import { MOCK_EVENTS } from './mock-data';

export async function fetchEventDetail(id: string) {
    // If it's a mock ID, return from mock data directly
    if (id.startsWith('mock-')) {
        const mock = MOCK_EVENTS.find(e => e.id === id);
        if (mock) return mock;
    }

    const res = await apiFetch(`/api/events/${id}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch event detail');
    }

    const result = await res.json();
    return result.data as Event;
}

export function useEventDetail(id: string) {
    const query = useQuery({
        queryKey: ['event', id],
        queryFn: () => fetchEventDetail(id),
        enabled: !!id,
        retry: false,
    });

    // Fallback logic for UI stability during development/mocking
    const stableEvent = query.data 
        ? query.data 
        : MOCK_EVENTS.find(e => e.id === id);

    return {
        ...query,
        data: stableEvent,
        isLoading: query.isLoading && !query.data
    };
}
