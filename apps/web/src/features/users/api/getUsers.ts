import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';
import { UserRecord } from '../types';

interface RawUser {
    id: string;
    fullName: string;
    email: string;
    role?: {
        roleName: string;
    };
    isEmailVerified: boolean;
    createdAt: string;
}

export async function fetchUsers() {
    const res = await apiFetch(`/api/admin/users`, {
        method: 'GET',
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch users');
    }

    const result = await res.json();
    const data = result.data as RawUser[];
    
    // Map backend data to UserRecord format
    return data.map((user): UserRecord => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role?.roleName || 'STUDENT',
        status: user.isEmailVerified ? 'active' : 'pending',
        joined: new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
    }));
}

export function useUsers() {
    const { token, profile } = useAuthStore();
    const isAdmin = profile?.role === 'ADMIN';

    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        enabled: !!token && isAdmin,
    });
}
