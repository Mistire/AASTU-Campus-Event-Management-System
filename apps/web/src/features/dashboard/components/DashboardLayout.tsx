'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-[#FBFBFE] min-h-screen font-sans">
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
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100/50 shadow-[20px_0_40px_rgba(0,0,0,0.02)] transition-all duration-500 md:translate-x-0 outline-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 md:pl-72 min-w-0 transition-colors duration-500">
                <header className="sticky top-0 z-40 flex h-20 items-center bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 transition-all duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-6 md:hidden text-gray-900 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                    <div className="flex-1 w-full">
                        <Header />
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 lg:p-10 w-full overflow-x-hidden">
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
