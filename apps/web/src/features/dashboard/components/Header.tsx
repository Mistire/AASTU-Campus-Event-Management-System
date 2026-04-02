"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Plus, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { profile } = useAuthStore();

  return (
    <div className="flex items-center justify-between w-full h-full bg-white">
      {/* Logos and Title Block on Left */}
      <div className="flex items-center gap-3 ml-4">
        <div className="flex gap-2">
          <img src="/aastu-logo.png" alt="" className="h-8 w-auto object-contain invisible" /* Put your actual logos here if you have them */ />
        </div>
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
