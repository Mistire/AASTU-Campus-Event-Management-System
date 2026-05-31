'use client';

import { CemsSidebar } from '@/components/cems/CemsSidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PendingInvitationsModal } from '@/features/events/components/organizers/PendingInvitationsModal';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex bg-gray-100 dark:bg-background min-h-screen font-sans w-full">
                <CemsSidebar />
                <SidebarInset className="flex flex-col flex-1 min-w-0 transition-all duration-300">
                    <header className="sticky top-0 z-40 flex h-20 items-center bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 md:px-10 transition-all duration-300">
                        <div className="flex-1 w-full">
                            <Header />
                        </div>
                    </header>

                    <main className="flex-1 px-6 py-8 md:px-12 md:py-10 lg:px-16 lg:py-12 w-full overflow-y-visible max-w-[1450px] mx-auto">
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {children}
                        </div>
                    </main>
                    <PendingInvitationsModal />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
