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
  onRegister?: (e: React.MouseEvent) => void;
  isRegistering?: boolean;
  isEnded?: boolean;
}

export function EventCardFooter({
  registrationsCount,
  capacity,
  isFull,
  isAlmostFull,
  capacityPercent,
  onRegister,
  isRegistering,
  isEnded,
}: EventCardFooterProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate uppercase tracking-widest">
              {registrationsCount} registered
            </span>
          </div>
          {isEnded ? (
            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Ended
            </span>
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${capacityPercent}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isEnded ? "bg-gray-300 dark:bg-gray-700" : (isFull ? "bg-red-500" : isAlmostFull ? "bg-amber-500" : "bg-brand")
            )}
          />
        </div>
      </div>

      <Button
        className={cn(
          "relative z-10 rounded-lg h-10 px-5 font-black uppercase tracking-widest text-[10px] shadow-lg transition-all",
          isEnded || isFull
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none hover:bg-gray-100 dark:hover:bg-gray-800"
            : "bg-brand hover:bg-brand-hover text-white shadow-brand/20 hover:translate-x-1"
        )}
        disabled={isFull || isRegistering || isEnded}
        onClick={onRegister}
      >
        {isEnded ? "Ended" : (isRegistering ? "..." : (isFull ? "Waitlist" : "Register"))}
      </Button>
    </div>
  );
}
