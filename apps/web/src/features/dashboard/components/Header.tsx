'use client'

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
    const { profile } = useAuthStore();

    return (
        <div className="flex items-center justify-between w-full">
            {/* Search Bar Placeholder (Premium touch) */}
            <div className="hidden lg:flex items-center relative max-w-md w-full ml-4">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search events, users, or logs..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end hidden md:flex">
                        <p className="text-sm font-semibold text-gray-900 leading-none">
                            {profile?.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">
                            {profile?.role?.replace('_', ' ') || 'Guest'}
                        </p>
                    </div>

                    <Button variant="ghost" className="p-0.5 rounded-full border border-gray-200 hover:border-blue-500/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-sm">
                            <span className="text-xs font-bold uppercase">
                                {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                            </span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
