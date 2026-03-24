import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// Create the axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure the request interceptor
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Keep track of whether a refresh is happening
let isRefreshing = false;
// Queue failed requests to retry them after refresh completes
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Skip interceptor for auth routes to prevent loops
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, add the request to a queue to resolve later
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Start refresh process
            originalRequest._retry = true;
            isRefreshing = true;

            const authStore = useAuthStore.getState();
            const refreshToken = authStore.refreshToken;

            if (!refreshToken) {
                // If there's no refresh token, just log out right away
                authStore.clearAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Request a new access token using the refresh token
                const refreshResponse = await axios.post(
                    `${(api.defaults.baseURL)}/auth/refresh`,
                    { refreshToken }
                );

                const newAccessToken = refreshResponse.data.access_token;
                const newRefreshToken = refreshResponse.data.refresh_token;

                // Update the tokens in our Zustand store
                authStore.setAuth(newAccessToken, newRefreshToken, authStore.profile!);

                // Give the new token to axios defaults (not strictly necessary with the request interceptor, but safe)
                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

                // Retry the original request
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                // Process queued requests
                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (err) {
                // Refresh token failed (likely expired)
                processQueue(err, null);
                authStore.clearAuth();

                // Only redirect if we are not already on login
                if (!window.location.pathname.includes('/login')) {
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
