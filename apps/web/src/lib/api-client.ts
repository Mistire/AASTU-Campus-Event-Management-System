import { useAuthStore } from "@/features/auth/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const store = useAuthStore.getState();
    const refreshToken = store.refreshToken;

    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      const payload = data?.data ?? data;

      if (!payload?.access_token || !payload?.refresh_token) return false;

      useAuthStore
        .getState()
        .setTokens(payload.access_token, payload.refresh_token);

      return true;
    } catch (err) {
      console.error("[api-client] Token refresh network error:", err);
      return false;
    }
  })();

  refreshPromise.finally(() => {
    setTimeout(() => {
      refreshPromise = null;
    }, 2000);
  });

  return refreshPromise;
}

function handleUnauthorized() {
  const store = useAuthStore.getState();
  store.clearAuth();

  if (typeof window !== "undefined") {
    window.location.href = "/login?reason=expired";
  }
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;

  const buildHeaders = () => {
    const store = useAuthStore.getState();
    const h = new Headers(fetchOptions.headers);
    if (!skipAuth && store.token) {
      h.set("Authorization", `Bearer ${store.token}`);
    }
    if (!h.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
      h.set("Content-Type", "application/json");
    }
    return h;
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(),
  });
  if (response.status !== 401 || skipAuth) {
    return response;
  }

  const refreshed = await doRefresh();

  if (!refreshed) {
    handleUnauthorized();
    return response;
  }
    
  return fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(),
  });
}

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

export function scheduleProactiveRefresh(): (() => void) | null {
  const store = useAuthStore.getState();
  if (!store.token || !store.refreshToken) return null;

  const exp = getTokenExpiry(store.token);
  if (!exp) return null;

  const now = Math.floor(Date.now() / 1000);
  const remaining = exp - now;

  if (remaining <= 0) {
    doRefresh().then((ok) => {
      if (!ok) handleUnauthorized();
    });
    return null;
  }

  const refreshIn = Math.max(remaining * 0.75, 30);
  const ms = refreshIn * 1000;

  const timerId = setTimeout(async () => {
    const ok = await doRefresh();
    if (ok) {
      scheduleProactiveRefresh();
    }
  }, ms);

  return () => clearTimeout(timerId);
}
