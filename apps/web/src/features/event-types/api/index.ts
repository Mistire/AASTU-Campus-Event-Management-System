import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { EventTypeRecord, CreateEventTypeDTO } from '../types';

export const useEventTypes = () => {
    return useQuery({
        queryKey: ['event-types'],
        queryFn: async (): Promise<EventTypeRecord[]> => {
            const res = await apiFetch('/api/event-types');
            if (!res.ok) throw new Error('Failed to fetch event types');
            const result = await res.json();
            return (result.data?.data || result.data || result || []) as EventTypeRecord[];
        },
    });
};

export const useCreateEventType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dto: CreateEventTypeDTO) => {
            const res = await apiFetch('/api/event-types', {
                method: 'POST',
                body: JSON.stringify(dto),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create event type');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-types'] });
        },
    });
};

export const useDeleteEventType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/event-types/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete event type');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-types'] });
        },
    });
};
