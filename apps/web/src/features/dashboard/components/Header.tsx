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

import { useClickOutside } from "@/hooks/useClickOutside";

export function Header() {
  const { profile, clearAuth } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsProfileOpen(false));

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between w-full h-full bg-white px-2">
      <div className="flex items-center gap-3">
        <h1 className="font-brand font-black text-2xl tracking-tighter text-gray-900 border-l-4 border-brand pl-4 ml-4">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-colors cursor-pointer mr-2">
          <Globe size={14} />
          English
        </div>

        <button className="p-2 text-gray-400 hover:text-brand rounded-xl transition-colors">
          <Bell size={20} />
        </button>

        <div className="h-8 w-px bg-gray-100 mx-1" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center border border-brand/10 shadow-sm group-hover:bg-brand/10 transition-colors">
              <User className="text-brand" size={20} />
            </div>
            <div className="hidden sm:block text-left mr-2 min-w-[80px]">
              <p className="text-xs font-black text-gray-900 leading-tight truncate">
                {profile?.full_name || "Staff Member"}
              </p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
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
            <div className="absolute right-0 mt-3 w-60 rounded-xl bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-50 mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Authenticated As
                  </p>
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {profile?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)}>
                    <ProfileItem icon={User} label="Profile" onClick={() => {}} />
                  </Link>
                  <ProfileItem icon={Settings} label="Preferences" onClick={() => {}} />
                </div>
                
                <div className="h-px bg-gray-50 my-1" />
                
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
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
      danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <Icon size={16} />
    {label}
  </button>
);
