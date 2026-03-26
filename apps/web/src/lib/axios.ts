import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// Create the axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure the request interceptor — always attaches the current access token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// State for token refresh queuing
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

/** Read a cookie value by name */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const val = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return val ? decodeURIComponent(val.split('=')[1]) : null;
}

/** Get refresh token from store → localStorage → cookie */
function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
        useAuthStore.getState().refreshToken ||
        localStorage.getItem('auth-refresh-token') ||
        getCookie('auth-refresh-token')
    );
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip auth routes to prevent infinite loops
        if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/signup')
        ) {
            return Promise.reject(error);
        }

        // On 401, attempt a token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            const authStore = useAuthStore.getState();

            if (!refreshToken) {
                authStore.clearAuth();
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const refreshResponse = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                // Backend wraps response: { statusCode, data: { access_token, refresh_token } }
                const respData = refreshResponse.data?.data || refreshResponse.data;
                const newAccessToken = respData.access_token;
                const newRefreshToken = respData.refresh_token || refreshToken;

                // Update store + all storage locations
                authStore.setAuth(newAccessToken, newRefreshToken, authStore.profile!);

                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                authStore.clearAuth();
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
