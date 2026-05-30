import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from './useAuthStore';

const mockProfile = {
  id: 'user-1',
  full_name: 'Abebe Kebede',
  email: 'abebe@aastu.edu.et',
  phone: '0911000000',
  role: 'STUDENT' as const,
  roles: [],
  user_roles: [],
  profileImage: undefined,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });
  });

  describe('setAuth', () => {
    it('should store token, refreshToken and profile', () => {
      act(() => {
        useAuthStore.getState().setAuth('access-token', 'refresh-token', mockProfile);
      });

      const { token, refreshToken, profile } = useAuthStore.getState();
      expect(token).toBe('access-token');
      expect(refreshToken).toBe('refresh-token');
      expect(profile?.id).toBe('user-1');
      expect(profile?.email).toBe('abebe@aastu.edu.et');
    });
  });

  describe('clearAuth', () => {
    it('should reset token, refreshToken and profile to null', () => {
      act(() => {
        useAuthStore.getState().setAuth('access-token', 'refresh-token', mockProfile);
      });

      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const { token, refreshToken, profile } = useAuthStore.getState();
      expect(token).toBeNull();
      expect(refreshToken).toBeNull();
      expect(profile).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when role matches profile.role', () => {
      act(() => {
        useAuthStore.getState().setAuth('token', 'refresh', {
          ...mockProfile,
          role: 'ADMIN',
        });
      });

      expect(useAuthStore.getState().hasRole('ADMIN')).toBe(true);
      expect(useAuthStore.getState().hasRole('STUDENT')).toBe(false);
    });

    it('should return true when role exists in profile.roles array', () => {
      act(() => {
        useAuthStore.getState().setAuth('token', 'refresh', {
          ...mockProfile,
          role: '' as any,
          roles: ['ORGANIZER'],
        });
      });

      expect(useAuthStore.getState().hasRole('ORGANIZER')).toBe(true);
    });

    it('should return true when role exists in user_roles relation list', () => {
      act(() => {
        useAuthStore.getState().setAuth('token', 'refresh', {
          ...mockProfile,
          role: '' as any,
          roles: [],
          user_roles: [{ role: { name: 'STAFF' } }],
        });
      });

      expect(useAuthStore.getState().hasRole('STAFF')).toBe(true);
    });

    it('should return false when profile is null', () => {
      expect(useAuthStore.getState().hasRole('ADMIN')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if any role in the list matches', () => {
      act(() => {
        useAuthStore.getState().setAuth('token', 'refresh', {
          ...mockProfile,
          role: 'ORGANIZER',
        });
      });

      expect(useAuthStore.getState().hasAnyRole(['ADMIN', 'ORGANIZER'])).toBe(true);
    });

    it('should return false if none of the roles match', () => {
      act(() => {
        useAuthStore.getState().setAuth('token', 'refresh', {
          ...mockProfile,
          role: 'STUDENT',
        });
      });

      expect(useAuthStore.getState().hasAnyRole(['ADMIN', 'ORGANIZER', 'STAFF'])).toBe(false);
    });
  });
});
