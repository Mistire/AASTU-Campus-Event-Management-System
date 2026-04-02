'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 md:pl-72 min-w-0">
                <header className="sticky top-0 z-30 flex h-16 items-center bg-white border-b border-gray-200 px-4 md:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-4 md:hidden text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                    <div className="flex-1">
                        <Header />
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-none w-full">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
