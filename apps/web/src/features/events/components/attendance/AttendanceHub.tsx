import { ClipboardCheck } from "lucide-react";
import { AttendanceStats } from "../AttendanceStats";
import { AttendanceTable } from "../AttendanceTable";

interface AttendanceHubProps {
  eventId: string;
}

export function AttendanceHub({ eventId }: AttendanceHubProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <AttendanceStats eventId={eventId} />
      <div className="pt-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <ClipboardCheck className="text-brand" />
          Check-in Log (Many)
        </h3>
        <AttendanceTable eventId={eventId} />
      </div>
    </div>
  );
}
