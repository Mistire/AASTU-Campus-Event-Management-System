import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "ORGANIZER" | "STUDENT" | "STAFF";

interface AuthProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role | "";
  roles: Role[];
  user_roles: { role: { name: Role } }[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  profile: AuthProfile | null;
  setAuth: (token: string, refreshToken: string, profile: AuthProfile) => void;
  clearAuth: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      profile: null,

      setAuth: (token, refreshToken, profile) =>
        set({ token, refreshToken, profile }),

      clearAuth: () => set({ token: null, refreshToken: null, profile: null }),

      hasRole: (role: Role) => {
        const { profile } = get();
        if (!profile) return false;
        if (profile.role === role) return true;
        if (profile.roles?.includes(role)) return true;
        if (profile.user_roles?.some((ur) => ur.role.name === role))
          return true;
        return false;
      },

      hasAnyRole: (roles: Role[]) => {
        return roles.some((role) => get().hasRole(role));
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
