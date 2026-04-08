'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { AuthRefreshProvider } from '@/features/auth/components/AuthRefreshProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthRefreshProvider>
                {children}
            </AuthRefreshProvider>
        </QueryClientProvider>
    );
}
