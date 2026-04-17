import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Category } from './useCategories';

export interface UserCategoryPreference {
    id: string;
    userId: string;
    categoryId: string;
    category: Category;
}

export async function fetchMyCategoryPreferences() {
    const res = await apiFetch('/api/users/categories/preferences');

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch category preferences');
    }

    const result = await res.json();
    // The backend returns { selectedCategories: Category[], allCategories: Category[] }
    return (result.data?.selectedCategories || []) as Category[];
}

export async function updateMyCategoryPreferences(categoryIds: string[]) {
    const res = await apiFetch('/api/users/categories/preferences', {
        method: 'POST',
        body: JSON.stringify({ categoryIds }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update category preferences');
    }

    const result = await res.json();
    // The backend returns { selectedCategories: Category[], allCategories: Category[] }
    return (result.data?.selectedCategories || []) as Category[];
}

export function useUserPreferences() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['user-category-preferences'],
        queryFn: () => fetchMyCategoryPreferences(),
    });

    const mutation = useMutation({
        mutationFn: (categoryIds: string[]) => updateMyCategoryPreferences(categoryIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-category-preferences'] });
        },
    });

    return {
        ...query,
        updatePreferences: mutation.mutateAsync,
        isUpdating: mutation.isPending,
    };
}
