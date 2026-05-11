import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2, XCircle, Clock, ListOrdered } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CemsButton } from "@/components/cems/CemsButton";

interface RegistrationSidebarProps {
  isRegistering: boolean;
  isFull: boolean;
  capacityPercent: number;
  handleRegister: () => void;
  handleCancel?: () => void;
  isCancelling?: boolean;
  status?: "none" | "confirmed" | "waitlisted" | "pending";
  waitlistPosition?: number;
  organizerName?: string;
  isEnded?: boolean;
}

export function RegistrationSidebar({
  isRegistering,
  isFull,
  capacityPercent,
  handleRegister,
  handleCancel,
  isCancelling,
  status = "none",
  waitlistPosition,
  organizerName = "AASTU Events Official",
  isEnded,
}: RegistrationSidebarProps) {
  const isActionDisabled = isRegistering || isCancelling || isEnded;

  return (
    <div className="sticky top-32 space-y-8">
      {/* Registration Card */}
      <div className="p-8 rounded-lg bg-white border border-gray-100 shadow-xl shadow-brand/5 relative overflow-hidden">
        {/* Bg Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight leading-none text-gray-900">
              {isEnded ? (
                <>Event <span className="text-gray-400">Completed</span></>
              ) : status === "none" ? (
                <>Register <span className="text-brand">Now</span></>
              ) : status === "confirmed" ? (
                <><span className="text-emerald-500">You're</span> In!</>
              ) : status === "waitlisted" ? (
                <>On the <span className="text-amber-500">Waitlist</span></>
              ) : (
                <>Approval <span className="text-blue-500">Pending</span></>
              )}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em]">
              {isEnded ? "This event has already taken place" : status === "none" ? "Limited spots available" : "Manage your registration below"}
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

          {status === "none" ? (
            <Button
              onClick={handleRegister}
              disabled={isActionDisabled || isFull}
              className={cn(
                "w-full h-14 rounded-lg font-black uppercase tracking-widest text-[11px] shadow-xl transition-all flex items-center justify-center gap-3",
                isFull || isEnded
                  ? "bg-gray-100 text-gray-400 shadow-none hover:bg-gray-100"
                  : "bg-brand hover:bg-brand-hover text-white shadow-brand/20 active:scale-95"
              )}
            >
              {isRegistering ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isEnded ? (
                "Event Ended"
              ) : isFull ? (
                "Event is Full"
              ) : (
                <>
                  Register for Entry <UserPlus size={18} />
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div
                className={cn(
                  "w-full h-14 rounded-lg font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 border-2",
                  status === "confirmed" 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                    : status === "waitlisted" 
                      ? "bg-amber-50 border-amber-100 text-amber-600"
                      : "bg-blue-50 border-blue-100 text-blue-600"
                )}
              >
                {status === "confirmed" ? (
                  <><CheckCircle2 size={18} /> Confirmed</>
                ) : status === "waitlisted" ? (
                  <><ListOrdered size={18} /> Waitlisted {waitlistPosition && `#${waitlistPosition}`}</>
                ) : (
                  <><Clock size={18} /> Pending Approval</>
                )}
              </div>
              
              <CemsButton
                variant="outline"
                onClick={handleCancel}
                disabled={isActionDisabled}
                className="w-full h-12 rounded-lg border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
              >
                {isCancelling ? <Loader2 className="animate-spin" size={16} /> : <><XCircle size={16} /> Cancel Registration</>}
              </CemsButton>
            </div>
          )}

          <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest leading-relaxed">
            By registering, you agree to our <br />
            <span className="text-gray-900 underline underline-offset-4 decoration-brand/30">
              Campus Event Policies
            </span>
          </p>
        </div>
      </div>

      {/* Host Quick Profile */}
      <div className="p-8 rounded-lg bg-white border border-gray-100 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Organized By
        </h4>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand/5 flex items-center justify-center">
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
