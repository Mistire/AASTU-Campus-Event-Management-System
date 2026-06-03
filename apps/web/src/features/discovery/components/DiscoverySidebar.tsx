"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Calendar, 
  History, 
  Bookmark,
  Sparkles,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const SIDEBAR_ITEMS = [
  {
    label: "Discovery",
    href: "/discovery",
    icon: LayoutGrid,
    description: "Explore campus events"
  },
  {
    label: "My Events",
    href: "/my-events",
    icon: Calendar,
    description: "Your active schedule"
  },
  {
    label: "Past Events",
    href: "/my-events/past",
    icon: History,
    description: "Your event history"
  },
  {
    label: "Bookmarks",
    href: "/my-events/bookmarks",
    icon: Bookmark,
    description: "Saved for later"
  },
    {
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "My profile"
  }
];

export function DiscoverySidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="fixed top-[80px] w-72 z-40 space-y-6">
        {/* Main Navigation Card */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-lg p-4 shadow-sm">
          <div className="px-4 py-2 mb-4">
             <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Menu</p>
          </div>
          
          <nav className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-500",
                    isActive 
                      ? "bg-brand text-white shadow-xl shadow-brand/20 scale-[1.02]" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg dark:hover:shadow-none hover:text-brand dark:hover:text-brand"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-500",
                    isActive ? "bg-white/20" : "bg-gray-50 dark:bg-gray-800 group-hover:bg-brand/5 dark:group-hover:bg-brand/10"
                  )}>
                    <Icon size={20} className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-brand"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-black tracking-tight">{item.label}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-60",
                      isActive ? "text-white/80" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
