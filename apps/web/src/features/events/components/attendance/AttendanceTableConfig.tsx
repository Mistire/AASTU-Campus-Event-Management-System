import { ColumnDef } from "@tanstack/react-table";
import { AttendanceRecord } from "../../types/attendance";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { CemsBadge } from "@/components/cems/CemsBadge";

export const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "user.fullName",
    header: "Participant",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-black text-sm">
          {row.original.user.fullName[0].toUpperCase()}
        </div>
        <div>
          <p className="font-black text-sm text-gray-900 tracking-tight leading-none mb-1">
            {row.original.user.fullName}
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            {row.original.user.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "user.studentId",
    header: "ID",
    cell: ({ row }) => (
      <CemsBadge className="font-bold text-[10px] bg-gray-50 border-gray-100 uppercase tracking-widest px-3 py-1">
        {row.original.user.studentId || "EXTERNAL"}
      </CemsBadge>
    ),
  },
  {
    accessorKey: "session.title",
    header: "Session",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="font-bold text-sm text-gray-700">
          {row.original.session?.title || "Main Event"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "checkInTime",
    header: "Check-in Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-black text-sm text-gray-900 tracking-tighter">
          {format(new Date(row.original.checkInTime), "p")}
        </span>
        <span className="text-[10px] font-bold text-gray-400 capitalize">
          {format(new Date(row.original.checkInTime), "MMM d, yyyy")}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: () => (
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest animate-in fade-in duration-500">
        <CheckCircle2 size={14} />
        Certified
      </div>
    ),
  },
];
