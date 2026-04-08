import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface Category {
    id: string;
    name: string;
    description?: string;
    _count?: {
        eventCategories: number;
    };
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
}

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async (): Promise<Category[]> => {
            const res = await apiFetch('/api/categories');
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to fetch categories');
            }
            const result = await res.json();
            return result.data as Category[];
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dto: CreateCategoryDto) => {
            const res = await apiFetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify(dto),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create category');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete category');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
