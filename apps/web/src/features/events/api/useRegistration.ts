import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export async function registerForEvent(eventId: string) {
    const res = await apiFetch('/api/registrations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to register for event');
    }

    const result = await res.json();
    return result.data;
}

export function useRegistration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => registerForEvent(eventId),
        onSuccess: (_, eventId) => {
            // Invalidate queries to refresh registration status
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
        },
    });
}
