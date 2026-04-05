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

export function DiscoveryNavbar() {
  const { profile, clearAuth } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Branding & Nav Links */}
        <div className="flex items-center gap-10">
          <Link href="/discovery" className="flex items-center gap-2 group">
             <div className="font-brand flex items-center tracking-tighter">
                <span className="text-brand/30 font-bold text-2xl select-none">[</span>
                <span className="mx-1 text-2xl font-black bg-linear-to-r from-brand via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  CEMS
                </span>
                <span className="text-brand/30 font-bold text-2xl select-none">]</span>
             </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
             <NavItem href="/discovery" label="Discovery" icon={LayoutGrid} active />
             <NavItem href="/my-events" label="My Events" icon={Calendar} />
          </div>
        </div>

        {/* Center: Search (Visible on md+) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
           <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search events, organizers, or tags..."
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 rounded-2xl py-2 pl-12 pr-4 text-sm font-medium transition-all"
              />
           </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-brand rounded-xl">
             <Bell size={20} />
          </button>
          
          <div className="h-6 w-px bg-gray-100 mx-2" />

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="w-8 h-8 rounded-xl bg-brand/5 flex items-center justify-center border border-brand/10">
                 <User className="text-brand" size={16} />
              </div>
              <div className="hidden sm:block text-left">
                 <p className="text-xs font-black text-gray-900 leading-none truncate max-w-[100px]">{profile?.full_name}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Student</p>
              </div>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
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
                     <DropdownItem icon={User} label="My Profile" />
                     <DropdownItem icon={Settings} label="Preferences" />
                     {(profile?.role === "ADMIN" || profile?.role === "ORGANIZER") && (
                       <DropdownItem 
                         icon={LayoutGrid} 
                         label="Go to Dashboard" 
                         onClick={() => {
                           window.location.href = "/dashboard";
                         }}
                       />
                     )}
                     <div className="h-px bg-gray-50 my-1" />
                     <DropdownItem 
                        icon={LogOut} 
                        label="Sign Out" 
                        variant="danger" 
                        onClick={() => {
                          clearAuth();
                          window.location.href = "/login";
                        }}
                     />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-brand/5 text-brand" 
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      )}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}

function DropdownItem({ icon: Icon, label, variant, onClick }: { icon: any; label: string; variant?: "danger"; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors text-left",
        variant === "danger" 
          ? "text-red-500 hover:bg-red-50" 
          : "text-gray-600 hover:bg-gray-50 hover:text-brand"
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
