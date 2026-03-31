'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import mainPages from '@/data/main-pages.json';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRoles } from '@/features/permissions/api/getRoles';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Activity,
    Headset,
    AlertTriangle,
    FileDown,
    LogOut,
    X,
    Settings,
    ShieldCheck,
    Layers,
    MapPin,
    Shield,
    Heart,
    MessageSquare,
    ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Icon Map for string identifiers in MAIN_MENU
const iconMap: Record<string, React.ElementType> = {
    Dashboard: LayoutDashboard,
    Events: Calendar,
    Users: Users,
    Activity: Activity,
    Headset: Headset,
    AlertTriangle: AlertTriangle,
    FileDown: FileDown,
    Layers: Layers,
    MapPin: MapPin,
    Shield: Shield,
    Heart: Heart,
    MessageSquare: MessageSquare,
    ClipboardCheck: ClipboardCheck,
};

interface SidebarProps {
    onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();
    const { clearAuth, profile } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    // Filter the JSON menu items based on the user's role
    const allowedMenu = mainPages.filter((item: any) =>
        profile && item.allowed.includes(profile.role)
    );

    return (
        <div className="flex flex-col h-full text-gray-300">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white uppercase letter-spacing-1">
                        AASTU <span className="text-blue-500">Events</span>
                    </span>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-gray-400 hover:text-white"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                <nav className="space-y-1">
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Main Navigation
                    </p>
                    {allowedMenu.map((item) => {
                        const Icon = iconMap[item.title.split(' ')[0]] || iconMap[item.icon] || LayoutDashboard;
                        const isActive = pathname === item.to || pathname.startsWith(item.to + '/');

                        return (
                            <Link
                                key={item.title}
                                href={item.to}
                                onClick={onClose}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                                        : "hover:bg-gray-800/50 hover:text-white"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-400"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info Section (Optional, nice touch) */}
                {profile && (
                    <div className="px-3 py-4 mt-auto rounded-2xl bg-gray-800/30 border border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <span className="text-blue-500 font-bold">{profile.fullName.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{profile.fullName}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{profile.role.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 bg-gray-900 border-t border-gray-800/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 font-medium hover:bg-red-500/10 hover:text-red-400 rounded-xl px-3 transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
