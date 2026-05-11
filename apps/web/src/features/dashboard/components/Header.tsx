"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  User,
  Globe,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { useClickOutside } from "@/hooks/useClickOutside";
import { NotificationPopover } from "@/features/notifications/components/NotificationPopover";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotificationSocket";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  const { profile, clearAuth } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsProfileOpen(false));

  // Initialize real-time notifications
  useNotificationSocket();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between w-full h-full bg-white dark:bg-gray-900 px-2">
      <div className="flex items-center gap-3">
        <h1 className="font-brand font-black text-2xl tracking-tighter text-gray-900 dark:text-white border-l-4 border-brand pl-4 ml-4">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-colors cursor-pointer mr-2">
          <Globe size={14} />
          English
        </div>

        <NotificationPopover />

        <ThemeToggle className="w-8 h-8 rounded-lg" />

        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-1" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center border border-brand/10 shadow-sm group-hover:bg-brand/10 transition-colors overflow-hidden relative">
              {profile?.profileImage ? (
                <Image src={profile.profileImage as string} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="text-brand" size={20} />
              )}
            </div>
            <div className="hidden sm:block text-left mr-2 min-w-[80px]">
              <p className="text-xs font-black text-gray-900 dark:text-white leading-tight truncate">
                {profile?.full_name || "Staff Member"}
              </p>
              <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                {profile?.role || "ORGANIZER"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-gray-400 transition-transform duration-300",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-50 dark:border-gray-800 mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Authenticated As
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {profile?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)}>
                    <ProfileItem icon={User} label="Profile" onClick={() => {}} />
                  </Link>
                </div>
                
                <div className="h-px bg-gray-50 dark:bg-gray-800 my-1" />
                
                <div className="py-1">
                  <ProfileItem
                    icon={LogOut}
                    label="Sign Out"
                    danger
                    onClick={handleLogout}
                  />
                </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

const ProfileItem = ({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
      danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    )}
  >
    <Icon size={16} />
    {label}
  </button>
);
