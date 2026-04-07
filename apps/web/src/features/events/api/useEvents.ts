import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Category } from './useCategories';
import { MOCK_EVENTS } from './mock-data';

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
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    sessionType?: string;
    speakers?: {
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
}

export interface EventsResponse {
    data: Event[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
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
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch events');
    }

    return await res.json() as EventsResponse;
}

export function useEvents(queryParams: EventQueryParams = {}) {
    const query = useQuery({
        queryKey: ['events', queryParams],
        queryFn: () => fetchEvents(queryParams),
        retry: false,
    });

    let filteredMockData = [...MOCK_EVENTS];
    
    if (queryParams.search) {
        const s = queryParams.search.toLowerCase();
        filteredMockData = filteredMockData.filter(e => 
            e.title.toLowerCase().includes(s) || 
            e.description.toLowerCase().includes(s)
        );
    }
    
    if (queryParams.categoryId) {
        filteredMockData = filteredMockData.filter(e => 
            e.eventCategories.some(ec => ec.categoryId === queryParams.categoryId)
        );
    }

    const stableData = query.data && Array.isArray(query.data.data) 
        ? query.data 
        : { 
            data: filteredMockData, 
            meta: { 
                totalItems: filteredMockData.length, 
                itemCount: filteredMockData.length, 
                itemsPerPage: 10, 
                totalPages: 1, 
                currentPage: 1 
            } 
          };

    return {
        ...query,
        data: stableData,
        isLoading: query.isLoading && !query.data
    };
}
