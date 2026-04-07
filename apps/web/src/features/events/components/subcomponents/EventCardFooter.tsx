import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventCardFooterProps {
  registrationsCount: number;
  capacity: number;
  isFull: boolean;
  isAlmostFull: boolean;
  capacityPercent: number;
}

export function EventCardFooter({
  registrationsCount,
  capacity,
  isFull,
  isAlmostFull,
  capacityPercent,
}: EventCardFooterProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">
              {registrationsCount} registered
            </span>
          </div>
          {isAlmostFull && (
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
              Almost Full!
            </span>
          )}
          {isFull && (
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
              Full
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${capacityPercent}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isFull ? "bg-red-500" : isAlmostFull ? "bg-amber-500" : "bg-brand"
            )}
          />
        </div>
      </div>

      <Button
        className={cn(
          "relative z-10 rounded-2xl h-10 px-5 font-black uppercase tracking-widest text-[10px] shadow-lg transition-all",
          isFull
            ? "bg-gray-100 text-gray-400 shadow-none"
            : "bg-brand hover:bg-brand-hover text-white shadow-brand/20 hover:translate-x-1"
        )}
        disabled={isFull}
      >
        {isFull ? "Waitlist" : "Register"}
      </Button>
    </div>
  );
}
