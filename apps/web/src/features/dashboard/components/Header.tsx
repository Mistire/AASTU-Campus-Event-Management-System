"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Plus, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  const { profile } = useAuthStore();

  return (
    <div className="flex items-center justify-between w-full h-full bg-white">
      {/* Logos and Title Block on Left */}
      <div className="flex items-center gap-3 ml-4">
        <div className="flex gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="font-brand flex items-center tracking-tighter">
              <span className="text-brand font-bold text-xl opacity-40 select-none">[</span>
              <span className="mx-1 text-2xl font-black bg-linear-to-r from-brand via-blue-500 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-brand transition-all duration-500">
                CEMS
              </span>
              <span className="text-brand font-bold text-xl opacity-40 select-none">]</span>
              
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
        <h1 className="font-extrabold text-lg tracking-tight text-gray-900 border-l border-gray-200 pl-4">Dashboard</h1>
      </div>

      {/* Actions Block on Right */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-gray-600 cursor-pointer hover:text-brand mr-2">
          <Globe size={16} />
          English
        </div>

        <Button
          className="hidden md:flex bg-brand hover:bg-brand-hover text-white font-bold rounded-full text-xs uppercase px-5 py-2 h-9 items-center gap-1 shadow-sm shadow-brand/20 transition-all"
        >
          <Plus size={16} />
          Create Booking
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-2 py-1">
          <Button
            variant="outline"
            className="rounded-full border-gray-200 flex items-center justify-between gap-3 p-1.5 h-10 w-44 hover:bg-gray-50"
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex flex-col items-start pr-2 overflow-hidden w-full text-left">
              <span className="text-xs font-bold text-gray-900 truncate w-full">{profile?.full_name || "manager 4 name"}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate w-full">{profile?.role || "PROVIDER_ADMIN"}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
