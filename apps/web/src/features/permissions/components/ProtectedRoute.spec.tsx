import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { mockPush } from '../../../../vitest.setup';

// Mock ROUTE_PERMISSIONS with predictable routes
vi.mock('@/features/permissions/config/routes', () => ({
  ROUTE_PERMISSIONS: [
    { path: '/dashboard', allowedRoles: ['ADMIN', 'ORGANIZER', 'STAFF'] },
    { path: '/dashboard/users', allowedRoles: ['ADMIN'] },
    { path: '/dashboard/events', allowedRoles: ['ADMIN', 'ORGANIZER'] },
  ],
}));

// Mock usePathname separately for each test via the factory
let mockPathname = '/dashboard';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => ({ get: () => null }),
}));

// Helper to configure auth store state
function setStoreState({
  token = null,
  role = null,
  hydrated = true,
}: {
  token?: string | null;
  role?: string | null;
  hydrated?: boolean;
}) {
  act(() => {
    if (token && role) {
      useAuthStore.getState().setAuth(token, 'refresh', {
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@aastu.edu.et',
        phone: '',
        role: role as any,
        roles: [],
        user_roles: [],
        profileImage: undefined,
      });
    } else {
      useAuthStore.getState().clearAuth();
    }
    useAuthStore.setState({ _hasHydrated: hydrated });
  });
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/dashboard';
    act(() => {
      useAuthStore.getState().clearAuth();
    });
  });

  it('should show a loading spinner when store has not hydrated', () => {
    setStoreState({ hydrated: false });
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText(/Checking permissions/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect unauthenticated user to /login on a protected route', async () => {
    mockPathname = '/dashboard/events';
    setStoreState({ token: null, hydrated: true });
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/login?redirectTo=')
    );
  });

  it('should redirect logged-in ADMIN away from /login to /dashboard', async () => {
    mockPathname = '/login';
    setStoreState({ token: 'admin-token', role: 'ADMIN', hydrated: true });
    render(<ProtectedRoute><div>Login Page</div></ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect logged-in STUDENT away from /login to /discovery', async () => {
    mockPathname = '/login';
    setStoreState({ token: 'student-token', role: 'STUDENT', hydrated: true });
    render(<ProtectedRoute><div>Login Page</div></ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith('/discovery');
  });

  it('should render children for an ADMIN on /dashboard/events', () => {
    mockPathname = '/dashboard/events';
    setStoreState({ token: 'admin-token', role: 'ADMIN', hydrated: true });
    render(<ProtectedRoute><div>Events Page</div></ProtectedRoute>);
    expect(screen.getByText('Events Page')).toBeInTheDocument();
  });

  it('should redirect to /unauthorized for a STUDENT on /dashboard/users', () => {
    mockPathname = '/dashboard/users';
    setStoreState({ token: 'student-token', role: 'STUDENT', hydrated: true });
    render(<ProtectedRoute><div>Users Page</div></ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    expect(screen.queryByText('Users Page')).not.toBeInTheDocument();
  });
});
