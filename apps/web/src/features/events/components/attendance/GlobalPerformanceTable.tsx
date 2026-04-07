import { ColumnDef } from "@tanstack/react-table";
import { EventParticipation } from "../../api/get-attendance";
import { BadgeController } from "@/components/shared/BadgeController";
import { TableController } from "@/components/shared/TableController";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface GlobalPerformanceTableProps {
  data: EventParticipation[];
  isLoading: boolean;
}

export function GlobalPerformanceTable({ data, isLoading }: GlobalPerformanceTableProps) {
  const columns: ColumnDef<EventParticipation>[] = [
    {
      accessorKey: "title",
      header: "Event Name",
      cell: ({ row }) => (
        <div className="flex flex-col py-1">
          <span className="font-black text-gray-900 tracking-tight">{row.original.title}</span>
          <span className="text-[10px] font-bold text-gray-400 capitalize">
            {format(new Date(row.original.startTime), "MMM d, yyyy")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "registrations",
      header: "Registrations",
      cell: ({ row }) => (
        <span className="font-bold text-gray-600">{row.original.registrations}</span>
      ),
    },
    {
      accessorKey: "checkins",
      header: "Check-ins",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BadgeController variant="secondary" className="bg-brand/10 text-brand font-black border-none px-3">
            {row.original.checkins}
          </BadgeController>
        </div>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 w-full max-w-[120px]">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-1000" 
              style={{ width: `${Math.min(row.original.rate, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-gray-900">{Math.round(row.original.rate)}%</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link 
            href={`/dashboard/events/${row.original.id}`}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-brand transition-all active:scale-95"
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      ),
    }
  ];

  return (
    <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Event Performance</h2>
        <BadgeController variant="outline" className="font-bold text-[10px] border-gray-100">
          Last 50 Events
        </BadgeController>
      </div>
      <div className="p-4">
        <TableController 
          columns={columns} 
          data={data} 
          loading={isLoading}
        />
      </div>
    </div>
  );
}
