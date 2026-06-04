'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { AuthRefreshProvider } from '@/features/auth/components/AuthRefreshProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { TelegramAuthHandler } from '@/features/auth/components/TelegramAuthHandler';
import { useNotificationSocket } from '@/features/notifications/hooks/useNotificationSocket';

function SocketInitializer() {
    useNotificationSocket();
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthRefreshProvider>
                <ThemeProvider>
                    <TelegramAuthHandler>
                        <SocketInitializer />
                        {children}
                    </TelegramAuthHandler>
                </ThemeProvider>
            </AuthRefreshProvider>
        </QueryClientProvider>
    );
}
