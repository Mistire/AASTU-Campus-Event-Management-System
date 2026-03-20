import Link from 'next/link';
import { usePathname } from 'next/navigation';
import mainPages from '@/data/main-pages.json';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRoles } from '@/features/permissions/api/getRoles';
import { LayoutDashboard, Building2, Users, Activity, Headset, AlertTriangle, FileDown, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Icon Map for string identifiers in MAIN_MENU
const iconMap: Record<string, React.ElementType> = {
    Dashboard: LayoutDashboard,
    Building2: Building2,
    Users: Users,
    Activity: Activity,
    Headset: Headset,
    AlertTriangle: AlertTriangle,
    FileDown: FileDown,
};

export function Sidebar() {
    const pathname = usePathname();
    const { hasAnyRole, clearAuth } = useAuthStore();
    const { data: systemRoles, isLoading: isLoadingRoles } = useRoles();

    // Filter the JSON menu items based on the user's role
    const allowedMenu = mainPages.filter((item: any) => hasAnyRole(item.allowed));

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col pt-4">
            <div className="px-6 py-4 flex items-center justify-center border-b border-gray-800 mb-4">
                <h1 className="text-xl font-bold tracking-tight text-white mb-2">Hearts Admin</h1>
            </div>

            <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                {allowedMenu.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    const isActive = pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.title}
                            href={item.to}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 mt-auto border-t border-gray-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => {
                        clearAuth();
                        window.location.href = '/login';
                    }}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
