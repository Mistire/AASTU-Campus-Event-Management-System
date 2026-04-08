import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Category } from './useCategories';

export interface EventTag {
    id: string;
    tagId: string;
    tag: {
        id: string;
        name: string;
    };
}

export interface EventCategory {
    id: string;
    categoryId: string;
    category: Category;
}

export interface EventSession {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location?: string;
    sessionType?: string;
    speakers: {
        id: string;
        speaker: {
            id: string;
            fullName: string;
            bio?: string;
            profileImage?: string;
            title?: string;
        };
    }[];
}

export interface Event {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    capacity: number;
    requiresApproval: boolean;
    status: {
        id: string;
        statusName: string;
    };
    eventType: {
        id: string;
        name: string;
    };
    venue: {
        id: string;
        name: string;
        location?: string;
        capacity?: number;
    };
    tags: EventTag[];
    eventCategories: EventCategory[];
    sessions: EventSession[];
    _count: {
        registrations: number;
    };
    thumbnail?: string;
    media: {
        id: string;
        fileUrl: string;
        mediaType: string;
    }[];
}

export interface EventsResponse {
    data: Event[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface EventQueryParams {
    search?: string;
    date?: string;
    department?: string;
    sortBy?: 'date' | 'popularity' | 'newest';
    status?: string;
    eventType?: string;
    tag?: string;
    categoryId?: string;
    venueId?: string;
    page?: number;
    limit?: number;
}

export async function fetchEvents(queryParams: EventQueryParams = {}) {
    const query = new URLSearchParams();
    
    if (queryParams.page !== undefined) query.append('page', queryParams.page.toString());
    if (queryParams.limit !== undefined) query.append('limit', queryParams.limit.toString());
    if (queryParams.search) query.append('search', queryParams.search);
    if (queryParams.categoryId) query.append('categoryId', queryParams.categoryId);
    if (queryParams.status) query.append('status', queryParams.status);
    if (queryParams.venueId) query.append('venueId', queryParams.venueId);

    const res = await apiFetch(`/api/events?${query.toString()}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch events');
    }

    const result = await res.json();
    return result.data as EventsResponse;
}

export function useEvents(queryParams: EventQueryParams = {}) {
    const query = useQuery({
        queryKey: ['events', queryParams],
        queryFn: () => fetchEvents(queryParams),
        retry: false,
    });

    return {
        ...query,
        data: query.data,
        isLoading: query.isLoading && !query.data
    };
}
