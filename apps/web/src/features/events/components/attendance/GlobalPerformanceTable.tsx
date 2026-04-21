import { ColumnDef } from "@tanstack/react-table";
import { EventParticipation } from "../../api/get-attendance";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsCard, CemsCardHeader, CemsCardContent } from "@/components/cems/CemsCard";
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
        <div className="flex flex-col py-0.5">
          <span className="font-bold text-xs text-gray-900 tracking-tight">{row.original.title}</span>
          <span className="text-[10px] font-medium text-gray-400 capitalize">
            {format(new Date(row.original.startTime), "MMM d, yyyy")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "registrations",
      header: "Registrations",
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-gray-600">{row.original.registrations}</span>
      ),
    },
    {
      accessorKey: "checkins",
      header: "Check-ins",
      cell: ({ row }) => (
        <CemsBadge status="info">
          {row.original.checkins}
        </CemsBadge>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 w-full max-w-[120px]">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-1000" 
              style={{ width: `${Math.min(row.original.rate, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-900">{Math.round(row.original.rate)}%</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link 
            href={`/dashboard/events/${row.original.id}`}
            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-brand transition-all active:scale-95"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      ),
    }
  ];

  return (
    <CemsCard className="xl:col-span-2">
      <CemsCardHeader 
        title="Event Performance"
        bordered
        action={
          <CemsBadge status="neutral">Last 50 Events</CemsBadge>
        }
      />
      <CemsTable 
        columns={columns} 
        data={data} 
        loading={isLoading}
        enableSorting
        enableGlobalFilter
        enableColumnVisibility
      />
    </CemsCard>
  );
}
