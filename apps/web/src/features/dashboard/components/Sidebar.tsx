"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import mainPages from "@/data/main-pages.json";
import { useAuthStore, type Role } from "@/features/auth/store/useAuthStore";
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
  Layers,
  MapPin,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Icon Map for string identifiers in MAIN_MENU
const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Events: Calendar,
  Users: Users,
  Activity: Activity,
  Headset: Headset,
  AlertTriangle: AlertTriangle,
  FileDown: FileDown,
  Categories: Layers,
  Venues: MapPin,
  Compass: Compass,
};

interface MainPage {
  title: string;
  to: string;
  icon?: string;
  allowed: string[];
}

interface SidebarProps {
  onClose?: () => void;
}

import Logo from "@/components/ui/Logo";

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, hasAnyRole, clearAuth } = useAuthStore();

  const allowedMenu = (mainPages as MainPage[]).filter((item) =>
    hasAnyRole(item.allowed as Role[]),
  );

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-600">
      {/* ── Sidebar Header ── */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 shrink-0">
        <Logo />
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* ── Navigation (scrollable middle) ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <nav className="space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4">
            Main
          </p>
          {allowedMenu.map((item) => {
            const Icon =
              iconMap[item.title.split(" ")[0]] ||
              iconMap[item.icon ?? ""] ||
              LayoutDashboard;
            const isActive =
              item.to === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.to || pathname.startsWith(item.to + "/");

            return (
              <Link
                key={item.title}
                href={item.to}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold tracking-tight",
                  isActive
                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-brand",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-brand",
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom: User Profile (Premium Card) ── */}
      <div className="shrink-0 p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="group relative flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all duration-500">
          <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center border border-brand/10 shadow-sm group-hover:bg-brand/10 transition-colors">
            <Users className="text-brand w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0 mr-1">
            <p className="text-[11px] font-black text-gray-900 leading-tight truncate">
              {profile?.full_name || "Staff Member"}
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
              {profile?.email || "staff@aastu.edu.et"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
