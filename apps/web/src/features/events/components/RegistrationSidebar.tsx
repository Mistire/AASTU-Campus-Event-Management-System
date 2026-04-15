"use client";

import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RegistrationSidebarProps {
  isRegistering: boolean;
  isFull: boolean;
  capacityPercent: number;
  handleRegister: () => void;
  organizerName?: string;
}

export function RegistrationSidebar({
  isRegistering,
  isFull,
  capacityPercent,
  handleRegister,
  organizerName = "AASTU Events Official",
}: RegistrationSidebarProps) {
  return (
    <div className="sticky top-32 space-y-8">
      {/* Registration Card */}
      <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-xl shadow-brand/5 relative overflow-hidden">
        {/* Bg Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight leading-none text-gray-900">
              Register <span className="text-brand">Now</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em]">
              Limited spots available
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
              <span>Capacity</span>
              <span className={cn(isFull ? "text-red-500" : "text-brand")}>
                {capacityPercent}% full
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${capacityPercent}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000 shadow-sm",
                  isFull ? "bg-red-500" : "bg-brand"
                )}
              />
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isRegistering || isFull}
            className={cn(
              "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all flex items-center justify-center gap-3",
              isFull
                ? "bg-gray-100 text-gray-400 shadow-none hover:bg-gray-100"
                : "bg-brand hover:bg-brand-hover text-white shadow-brand/20 active:scale-95"
            )}
          >
            {isRegistering ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isFull ? (
              "Event is Full"
            ) : (
              <>
                Register for Entry <UserPlus size={18} />
              </>
            )}
          </Button>

          <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest leading-relaxed">
            By registering, you agree to our <br />
            <span className="text-gray-900 underline underline-offset-4 decoration-brand/30">
              Campus Event Policies
            </span>
          </p>
        </div>
      </div>

      {/* Host Quick Profile */}
      <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Organized By
        </h4>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center">
            <CheckCircle2 className="text-brand" size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{organizerName}</p>
            <p className="text-xs text-gray-500 font-medium">
              Verified Organizer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
