import { useAttendance } from "../api/get-attendance";
import { Users } from "lucide-react";
import { TableController } from "@/components/shared/TableController";
import { attendanceColumns } from "./attendance/AttendanceTableConfig";

interface AttendanceTableProps {
  eventId: string;
}

export function AttendanceTable({ eventId }: AttendanceTableProps) {
  const { data: attendance, isLoading } = useAttendance(eventId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-[3rem] text-gray-300">
        <Users className="h-16 w-16 mb-4 opacity-10" />
        <p className="font-black text-sm uppercase tracking-widest text-gray-400">
          No check-ins yet
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
      <TableController columns={attendanceColumns} data={attendance} />
    </div>
  );
}
