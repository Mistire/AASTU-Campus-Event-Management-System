import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface RoleResponse {
    id: string;
    roleName: string;
    description: string | null;
    createdAt: string;
}

// Ensure you replace this with the actual backend URL from env vars
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchRoles(token: string) {
    const res = await fetch(`${API_URL}/role`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
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
        queryFn: () => fetchRoles(token!),
        enabled: !!token,
    });
}
