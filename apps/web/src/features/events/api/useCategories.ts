import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { MOCK_CATEGORIES } from './mock-data';

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export async function fetchCategories() {
    const res = await apiFetch('/api/events/categories');

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch categories');
    }

    return await res.json() as Category[];
}

export function useCategories() {
    const query = useQuery({
        queryKey: ['categories'],
        queryFn: () => fetchCategories(),
        retry: false,
    });

    return {
        ...query,
        data: query.data && query.data.length > 0 ? query.data : MOCK_CATEGORIES,
    };
}
