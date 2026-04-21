import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface Tag {
    id: string;
    name: string;
    description?: string;
    _count?: {
        eventTags: number;
    };
}

export interface CreateTagDto {
    name: string;
}

export const useTags = (search?: string) => {
    return useQuery({
        queryKey: ['tags', search],
        queryFn: async (): Promise<Tag[]> => {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await apiFetch(`/api/tags${query}`);
            if (!res.ok) throw new Error('Failed to fetch tags');
            const data = await res.json();
            return (data.data || data) as Tag[];
        },
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dto: CreateTagDto) => {
            const res = await apiFetch('/api/tags', {
                method: 'POST',
                body: JSON.stringify(dto),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create tag');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/tags/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete tag');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};
