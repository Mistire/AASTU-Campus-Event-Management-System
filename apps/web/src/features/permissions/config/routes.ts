import { Role } from '@/features/auth/store/useAuthStore';
import allPages from '@/data/all-pages.json';

export interface RoutePermission {
    path: string;
    allowedRoles: Role[];
    exact?: boolean;
}

// Generate permissions dynamically from the Nuxt JSON file
export const ROUTE_PERMISSIONS: RoutePermission[] = allPages.map((page: any) => ({
    path: `/${page.name === 'index' ? 'dashboard' : page.name}`,
    allowedRoles: page.allowed as Role[],
}));
