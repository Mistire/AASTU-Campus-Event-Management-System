"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { 
  User, 
  Search, 
  Bell, 
  Calendar, 
  LayoutGrid,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { useClickOutside } from "@/hooks/useClickOutside";
import Image from "next/image";

export function DiscoveryNavbar() {
  const { profile, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsProfileOpen(false));

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        <div className="flex items-center gap-10">
          <Logo />

          <div className="h-8 w-px bg-gray-100 hidden md:block" />

          <div className="hidden md:flex flex-col">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Current View</p>
             <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {pathname === "/discovery" ? "Event Discovery" : 
                 pathname === "/my-events" ? "My Schedule" : 
                 pathname === "/my-events/past" ? "Event History" :
                 pathname === "/my-events/bookmarks" ? "Saved Events" :
                 pathname === "/profile" ? "User Profile" : "Campus Events"}
             </h2>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-brand rounded-xl">
             <Bell size={20} />
          </button>
          
          <div className="h-6 w-px bg-gray-100 mx-2" />

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="w-8 h-8 rounded-xl bg-brand/5 flex items-center justify-center border border-brand/10 overflow-hidden relative">
                 {profile?.profileImage ? (
                   <Image src={profile.profileImage as string} alt="Profile" fill className="object-cover" />
                 ) : (
                   <User className="text-brand" size={16} />
                 )}
              </div>
              <div className="hidden sm:block text-left">
                 <p className="text-xs font-black text-gray-900 leading-none truncate max-w-[100px]">{profile?.full_name}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Student</p>
              </div>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-2xl p-2 z-50 overflow-hidden"
                >
                   <div className="p-3 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated as</p>
                      <p className="text-[11px] font-bold text-gray-900 truncate">{profile?.email || "student@aastu.edu.et"}</p>
                   </div>
                   <Link href="/profile" onClick={() => setIsProfileOpen(false)}>
                      <ProfileItem icon={User} label="My Profile" onClick={() => {}} />
                   </Link>
                     {(profile?.role === "ADMIN" || profile?.role === "ORGANIZER") && (
                       <ProfileItem 
                         icon={LayoutGrid} 
                         label="Go to Dashboard" 
                         onClick={() => {
                           window.location.href = "/dashboard";
                         }}
                       />
                     )}
                     <div className="h-px bg-gray-50 my-1" />
                     <ProfileItem 
                        icon={LogOut} 
                        label="Sign Out" 
                        danger
                        onClick={() => {
                          clearAuth();
                          window.location.href = "/login";
                        }}
                     />
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}


interface ProfileItemProps {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const ProfileItem = ({ icon: Icon, label, onClick, danger }: ProfileItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
      danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);
