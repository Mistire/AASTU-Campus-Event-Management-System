import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string, refreshToken: string, profile: AuthProfile) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
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
      storage: createJSONStorage(() => hybridStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
