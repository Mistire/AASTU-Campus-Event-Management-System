import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useTicketDetails = (id: string) => {
    return useQuery({
        queryKey: ['support-ticket', id],
        queryFn: async () => {
            const res = await apiFetch(`/api/support/tickets/${id}`);
            if (!res.ok) throw new Error('Failed to fetch ticket details');
            const result = await res.json();
            return result.data || result;
        },
        enabled: !!id,
    });
};

export const usePublicTicket = (id: string, email: string) => {
    return useQuery({
        queryKey: ['public-support-ticket', id, email],
        queryFn: async () => {
            const res = await apiFetch(`/api/support/tickets/public/${id}?email=${encodeURIComponent(email)}`, {
                skipAuth: true
            });
            if (!res.ok) throw new Error('Failed to fetch ticket. Please check your link.');
            const result = await res.json();
            return result.data || result;
        },
        enabled: !!id && !!email,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiFetch('/api/support/tickets', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create ticket');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
        },
    });
};

export const useReplyTicket = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (message: string) => {
            const res = await apiFetch(`/api/support/tickets/${ticketId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message }),
            });
            if (!res.ok) throw new Error('Failed to send reply');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
        },
    });
};

export const usePublicReply = (ticketId: string, email: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (message: string) => {
            const res = await apiFetch(`/api/support/tickets/public/${ticketId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message, email }),
                skipAuth: true
            });
            if (!res.ok) throw new Error('Failed to send reply');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-support-ticket', ticketId, email] });
        },
    });
};

export const useUpdateStatus = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: string) => {
            const res = await apiFetch(`/api/support/tickets/${ticketId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
        },
    });
};
