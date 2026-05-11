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
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  Tags: Hash,
};

interface MainPage {
  title: string;
  to: string;
  icon?: string;
  allowed: string[];
  section?: string;
}

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

import Logo from "@/components/ui/Logo";
import { LayoutGrid, MessageSquare, ClipboardCheck } from "lucide-react";

// Update iconMap
const extendedIconMap: Record<string, React.ElementType> = {
  ...iconMap,
  Departments: LayoutGrid,
  Feedback: MessageSquare,
  Attendance: ClipboardCheck,
};

export function Sidebar({ onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { profile, hasAnyRole, clearAuth } = useAuthStore();

  const allowedMenu = (mainPages as MainPage[]).filter((item) =>
    hasAnyRole(item.allowed as Role[]),
  );

  // Group items by section
  const sections = allowedMenu.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MainPage[]>);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-all duration-500">
      {/* ── Sidebar Header ── */}
      <div className={cn(
        "flex items-center justify-between h-20 px-6 border-b border-gray-100 dark:border-gray-800 shrink-0",
        isCollapsed && "px-4 justify-center"
      )}>
        {!isCollapsed && <Logo />}
        
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-400 dark:text-gray-500 hover:text-brand dark:hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 rounded-lg transition-all"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          )}

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Navigation (scrollable middle) ── */}
      <div className={cn(
        "flex-1 overflow-y-auto py-6 px-4 scrollbar-hide",
        isCollapsed && "px-2"
      )}>
        <nav className="space-y-8">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-4">
                  {sectionName}
                </p>
              )}
              {items.map((item) => {
                const Icon =
                  extendedIconMap[item.title] ||
                  extendedIconMap[item.icon ?? ""] ||
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
                      "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-bold tracking-tight",
                      isCollapsed && "px-0 justify-center h-12 w-12 mx-auto",
                      isActive
                        ? "bg-brand text-white shadow-lg shadow-brand/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-white",
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors shrink-0",
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-brand",
                      )}
                    />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Bottom: User Profile (Premium Card) ── */}
      <div className={cn(
        "shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900",
        isCollapsed && "p-2"
      )}>
        <div className={cn(
          "group relative flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-brand/20 dark:hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-500",
          isCollapsed && "p-0 h-14 w-14 mx-auto justify-center"
        )}>
          <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center border border-brand/10 shadow-sm group-hover:bg-brand/10 transition-colors shrink-0 overflow-hidden relative">
            {profile?.profileImage ? (
              <Image src={profile.profileImage as string} alt="Profile" fill className="object-cover" />
            ) : (
              <Users className="text-brand w-5 h-5" />
            )}
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 mr-1">
                <p className="text-[11px] font-black text-gray-900 dark:text-white leading-tight truncate">
                  {profile?.full_name || "Staff Member"}
                </p>
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 truncate">
                  {profile?.email || "staff@aastu.edu.et"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
