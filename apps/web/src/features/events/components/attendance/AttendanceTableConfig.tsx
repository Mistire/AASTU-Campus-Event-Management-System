import { ColumnDef } from "@tanstack/react-table";
import { truncate } from "@/lib/utils";
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
          <p className="font-black text-sm text-gray-900 dark:text-white tracking-tight leading-none mb-1">
            {truncate(row.original.user.fullName, 25)}
          </p>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
            {truncate(row.original.user.email, 25)}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "user.studentId",
    header: "ID",
    cell: ({ row }) => (
      <CemsBadge className="font-bold text-[10px] bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white uppercase tracking-widest px-3 py-1">
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
        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
          {truncate(row.original.session?.title || "Main Event", 25)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "checkInTime",
    header: "Check-in Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-black text-sm text-gray-900 dark:text-white tracking-tighter">
          {format(new Date(row.original.checkInTime), "p")}
        </span>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize">
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
