'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Bell, Search, User, LogOut, Settings, UserCircle, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
    const { profile, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!profile) return null;

    return (
        <div className="flex items-center justify-between w-full h-full px-2">
            {/* Left Side: Profile Info (Heart UI Style) */}
            <div className="relative" ref={menuRef}>
                <div
                    className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-blue-400 transition-colors">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900 leading-tight">
                                {profile.fullName.split(' ')[0]}
                            </span>
                            <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", isMenuOpen && "rotate-180")} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            {profile.role?.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-50 mb-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-sm font-bold text-gray-900">{profile.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                        </div>

                        <Link
                            href="/profile"
                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <UserCircle className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">My Profile</span>
                        </Link>

                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">Account Settings</span>
                        </Link>

                        <div className="mx-3 border-t border-gray-50 my-2"></div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-all text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-bold">Log out session</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: Language & Icons */}
            <div className="flex items-center gap-1 md:gap-4">
                {/* Search Bar (Condensed for premium look) */}
                <div className="hidden sm:flex items-center relative mr-2">
                    <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-32 md:w-48 pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 cursor-pointer transition-colors text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold hidden md:inline">English</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>

                <div className="h-6 w-px bg-gray-100 mx-1 hidden md:block" />

                <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-50 rounded-full">
                    <Bell className="w-5 h-5" />
                </Button>

                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 transition-colors cursor-pointer bg-white">
                    <UserCircle className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
