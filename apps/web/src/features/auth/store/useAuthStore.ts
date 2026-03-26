import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role =
    | 'ADMIN'
    | 'ORGANIZER'
    | 'STUDENT'
    | 'STAFF';

interface AuthProfile {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: Role | '';
    permissions: string[];
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    profile: AuthProfile | null;
    setAuth: (token: string, refreshToken: string, profile: AuthProfile) => void;
    clearAuth: () => void;
    logout: () => Promise<void>;
    hasRole: (role: Role) => boolean;
    hasAnyRole: (roles: Role[]) => boolean;
    hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null,
    refreshToken: typeof window !== 'undefined' ? localStorage.getItem('auth-refresh-token') : null,
    profile: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-profile') || 'null') : null,

    setAuth: (token, refreshToken, profile) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', token);
            localStorage.setItem('auth-refresh-token', refreshToken);
            localStorage.setItem('auth-profile', JSON.stringify(profile));
            // Also set cookies for the user's specific request
            document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
            document.cookie = `profile=${JSON.stringify(profile)}; path=/; max-age=3600; SameSite=Lax`;
        }
        set({ token, refreshToken, profile });
    },

    clearAuth: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-refresh-token');
            localStorage.removeItem('auth-profile');
            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ token: null, refreshToken: null, profile: null });
    },

    logout: async () => {
        const { token, clearAuth } = get();
        if (token) {
            try {
                // Import api dynamically or use it if available
                const { default: api } = await import('@/lib/axios');
                await api.post('/auth/logout');
            } catch (err) {
                console.error('Logout API call failed', err);
            }
        }
        clearAuth();
    },

    hasRole: (role: Role) => {
        const { profile } = get();
        return profile?.role === role;
    },

    hasAnyRole: (roles: Role[]) => {
        const { profile } = get();
        if (!profile?.role) return false;
        return roles.includes(profile.role as Role);
    },

    hasPermission: (permission: string) => {
        const { profile } = get();
        return profile?.permissions?.includes(permission) ?? false;
    }
}));
