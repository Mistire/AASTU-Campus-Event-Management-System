'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PendingInvitationsModal } from '@/features/events/components/organizers/PendingInvitationsModal';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex bg-gray-100 min-h-screen font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 md:hidden transition-all duration-500 animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100/50 shadow-[20px_0_40px_rgba(0,0,0,0.02)] transition-all duration-500 md:translate-x-0 outline-none",
                    isCollapsed ? "w-24" : "w-72",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar 
                    onClose={() => setIsSidebarOpen(false)} 
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </aside>

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-col flex-1 min-w-0 transition-all duration-500",
                isCollapsed ? "md:pl-24" : "md:pl-72"
            )}>
                <header className="sticky top-0 z-40 flex h-20 items-center bg-white border-b border-gray-100 px-6 md:px-10 transition-all duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-6 md:hidden text-gray-900 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
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
            </div>
        </div>
    );
}
