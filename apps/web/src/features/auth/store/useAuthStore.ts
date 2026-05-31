import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export type Role = "ADMIN" | "ORGANIZER" | "STUDENT" | "STAFF";

export interface AuthProfile {
  profileImage: string | Blob | undefined;
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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string, refreshToken: string, profile: AuthProfile) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const hybridStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name) || Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
    Cookies.set(name, value, { expires: 7, path: "/" });
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    Cookies.remove(name, { path: "/" });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      profile: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (token, refreshToken, profile) =>
        set({ token, refreshToken, profile }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      clearAuth: () => {
        set({ token: null, refreshToken: null, profile: null });
        Cookies.remove("auth-storage");
      },

      hasRole: (role: Role) => {
        const { profile } = get();
        if (!profile) return false;
        const target = role.toUpperCase();
        if (profile.role?.toUpperCase() === target) return true;
        if (profile.roles?.some((r) => r.toUpperCase() === target)) return true;
        if (
          profile.user_roles?.some((ur) => ur.role.name.toUpperCase() === target)
        )
          return true;
        return false;
      },

      hasAnyRole: (roles: Role[]) => {
        return roles.some((role) => get().hasRole(role));
      },

      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => hybridStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
