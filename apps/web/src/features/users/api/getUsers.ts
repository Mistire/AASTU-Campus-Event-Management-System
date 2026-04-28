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

interface PaginatedUsersResponse {
    data: RawUser[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UserQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export async function fetchUsers(query: UserQuery) {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.append('page', query.page.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.search) searchParams.append('search', query.search);

    const res = await apiFetch(`/api/admin/users?${searchParams.toString()}`, {
        method: 'GET',
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch users');
    }

    const result = await res.json();
    const dataWrapper = result.data as PaginatedUsersResponse;
    const rawUsers = dataWrapper.data;
    
    // Map backend data to UserRecord format
    const mappedUsers = rawUsers.map((user): UserRecord => ({
        id: user.id,
        name: user.fullName || user.email?.split('@')[0] || 'Unknown',
        email: user.email,
        role: user.role?.roleName || 'STUDENT',
        status: user.isEmailVerified ? 'active' : 'pending',
        joined: new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
    }));

    return {
        data: mappedUsers,
        meta: dataWrapper.meta,
    };
}

export function useUsers(query: UserQuery = {}) {
    const { token, hasAnyRole } = useAuthStore();
    const isAdmin = hasAnyRole(['ADMIN']);

    return useQuery({
        queryKey: ['admin-users', query],
        queryFn: () => fetchUsers(query),
        enabled: !!token && isAdmin,
        staleTime: 30_000,
    });
}
