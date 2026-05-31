import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
    FeedbackAnswerPayload,
    FeedbackFormData,
    FeedbackResponsesPage,
    FeedbackTemplate,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Admin: legacy feedback list ──────────────────────────────────────────────
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

// ─── Public: resolve feedback form (no auth) ──────────────────────────────────
export const useFeedbackForm = (token: string | null) => {
    return useQuery<FeedbackFormData>({
        queryKey: ['feedback-form', token],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/feedback/form/${encodeURIComponent(token!)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load feedback form');
            return data.data ?? data;
        },
        retry: false,
    });
};

// ─── Public: submit feedback (no auth) ───────────────────────────────────────
export const useSubmitFeedback = (token: string | null) => {
    return useMutation({
        mutationFn: async (answers: FeedbackAnswerPayload[]) => {
            const res = await fetch(`${API_URL}/api/feedback/submit/${encodeURIComponent(token!)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Submission failed');
            return data;
        },
    });
};

// ─── Admin: all structured responses ─────────────────────────────────────────
export const useAllFeedbackResponses = (page = 1, limit = 20) => {
    return useQuery<FeedbackResponsesPage>({
        queryKey: ['admin-feedback-responses', page, limit],
        queryFn: async () => {
            const res = await apiFetch(`/api/feedback/responses?page=${page}&limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch responses');
            const result = await res.json();
            return result.data ?? result;
        },
    });
};

// ─── Organizer: responses for their events ────────────────────────────────────
export const useMyEventsFeedbackResponses = (page = 1, limit = 20) => {
    return useQuery<FeedbackResponsesPage>({
        queryKey: ['organizer-feedback-responses', page, limit],
        queryFn: async () => {
            const res = await apiFetch(`/api/feedback/responses/my-events?page=${page}&limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch responses');
            const result = await res.json();
            return result.data ?? result;
        },
    });
};

// ─── Organizer/Admin: responses for a specific event ─────────────────────────
export const useEventFeedbackResponses = (eventId: string | null) => {
    return useQuery({
        queryKey: ['event-feedback-responses', eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const res = await apiFetch(`/api/feedback/responses/event/${eventId}`);
            if (!res.ok) throw new Error('Failed to fetch event responses');
            const result = await res.json();
            return result.data ?? result;
        },
    });
};

// ─── Templates ────────────────────────────────────────────────────────────────
export const useFeedbackTemplates = () => {
    return useQuery<FeedbackTemplate[]>({
        queryKey: ['feedback-templates'],
        queryFn: async () => {
            const res = await apiFetch('/api/feedback/templates');
            if (!res.ok) throw new Error('Failed to fetch templates');
            const result = await res.json();
            return result.data ?? result;
        },
    });
};

export const useCreateTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; questions: any[] }) => {
            const res = await apiFetch('/api/feedback/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create template');
            return data.data ?? data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback-templates'] }),
    });
};

export const useUpdateTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: { name: string; questions: any[] } }) => {
            const res = await apiFetch(`/api/feedback/templates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update template');
            return data.data ?? data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback-templates'] }),
    });
};

export const useDeleteTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/feedback/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete template');
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback-templates'] }),
    });
};

export const useAttachTemplate = () => {
    return useMutation({
        mutationFn: async ({ templateId, eventId }: { templateId: string; eventId: string }) => {
            const res = await apiFetch(`/api/feedback/templates/${templateId}/attach/${eventId}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to attach template');
            return data.data ?? data;
        },
    });
};
