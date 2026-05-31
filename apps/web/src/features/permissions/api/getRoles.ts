import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

interface RoleResponse {
    id: string;
    roleName: string;
    description: string | null;
    createdAt: string;
}

export async function fetchRoles() {
    const res = await apiFetch(`/role`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch roles');
    }

    const result = await res.json();
    return result.data as RoleResponse[];
}

export function useRoles() {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ['roles'],
        queryFn: fetchRoles,
        enabled: !!token,
    });
}
