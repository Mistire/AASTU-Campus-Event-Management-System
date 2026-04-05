import { useAuthStore } from "@/features/auth/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<void> | null = null;

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;

  const getHeaders = () => {
    const store = useAuthStore.getState();
    const h = new Headers(fetchOptions.headers);
    if (!skipAuth && store.token) {
      h.set("Authorization", `Bearer ${store.token}`);
    }
    if (!h.has("Content-Type")) {
      h.set("Content-Type", "application/json");
    }
    return h;
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let response = await fetch(url, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  if (response.status === 401 && !skipAuth) {
    const store = useAuthStore.getState();
    const refreshToken = store.refreshToken;

    if (!refreshToken) {
      handleUnauthorized();
      return response;
    }

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const res = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              handleUnauthorized();
            }
            throw new Error(`Refresh failed: ${res.status}`);
          }

          const data = await res.json();
          useAuthStore
            .getState()
            .setTokens(data.access_token, data.refresh_token);
        })().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      return await fetch(url, {
        ...fetchOptions,
        headers: getHeaders(),
      });
    } catch (error) {
      console.error("Auth refresh failed:", error);
    }
  }

  return response;
}

function handleUnauthorized() {
  const store = useAuthStore.getState();
  store.clearAuth();

  if (typeof window !== "undefined") {
    window.location.href = "/login?reason=expired";
  }
}
