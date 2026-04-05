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
  Sparkles,
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
  Sparkles: Sparkles,
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

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole, clearAuth } = useAuthStore();

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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="font-brand flex items-center tracking-tighter">
            <span className="text-brand font-bold text-xl opacity-40 select-none">
              [
            </span>
            <span className="mx-1 text-2xl font-black bg-linear-to-r from-brand via-blue-500 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-brand transition-all duration-500">
              CEMS
            </span>
            <span className="text-brand font-bold text-xl opacity-40 select-none">
              ]
            </span>

            {/* Pulsing Live Indicator */}
            <div className="ml-2 flex items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="ml-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand/60 hidden sm:block">
                Live
              </span>
            </div>
          </div>
        </Link>
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
              pathname === item.to || pathname.startsWith(item.to + "/");

            return (
              <Link
                key={item.title}
                href={item.to}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold",
                  isActive
                    ? "bg-brand/10 text-brand border-l-4 border-brand shadow-[inset_0px_0px_0px_#e91e63]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-brand border-l-4 border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-brand"
                      : "text-gray-400 group-hover:text-brand",
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom: Logout (always pinned) ── */}
      <div className="shrink-0 p-4 border-t border-gray-100 space-y-3 bg-gray-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-lg px-3 transition-colors text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
