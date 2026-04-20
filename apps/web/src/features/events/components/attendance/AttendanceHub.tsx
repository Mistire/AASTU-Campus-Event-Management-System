import { useState } from "react";
import { ClipboardCheck, Camera, Maximize2 } from "lucide-react";
import { AttendanceStats } from "../AttendanceStats";
import { AttendanceTable } from "../AttendanceTable";
import { CemsButton } from "@/components/cems";
import { AttendeeScanner } from "./AttendeeScanner";
import { AnimatePresence } from "framer-motion";

interface AttendanceHubProps {
  eventId: string;
}

export function AttendanceHub({ eventId }: AttendanceHubProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <ClipboardCheck className="text-brand" size={32} />
             Attendance <span className="text-brand">Hub</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Real-time entry management & stats for your event
          </p>
        </div>

        <CemsButton 
          onClick={() => setIsScannerOpen(true)}
          className="h-14 px-8 rounded-2xl bg-brand hover:bg-brand/80 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 flex items-center gap-3 active:scale-95 transition-all"
        >
          <Camera size={18} />
          Launch QR Scanner
          <Maximize2 size={16} className="opacity-50" />
        </CemsButton>
      </div>

      <AttendanceStats eventId={eventId} />
      
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-brand" />
            Check-in Log
          </h3>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Updates Enabled
          </div>
        </div>
        <AttendanceTable eventId={eventId} />
      </div>

      <AnimatePresence>
        {isScannerOpen && (
          <AttendeeScanner 
            eventId={eventId} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
