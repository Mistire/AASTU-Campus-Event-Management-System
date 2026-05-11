import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface TopOrganizer {
    userId: string;
    fullName: string;
    email: string;
    profileImage?: string;
    totalEvents: number;
    totalRegistrations: number;
}

import { apiFetch } from "@/lib/api-client";

export async function fetchTopOrganizer() {
    const res = await apiFetch("/api/analytics/top-organizer", {
        method: "GET",
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch top organizers');
    }

    const result = await res.json();
    return (result.data || []) as TopOrganizer[];
}

export function useTopOrganizer() {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ['top-organizer'],
        queryFn: fetchTopOrganizer,
        enabled: !!token,
    });
}
