import { ColumnDef } from "@tanstack/react-table";
import { Event, EventStatusName } from "../types";
import { BadgeController } from "@/components/shared/BadgeController";
import { format } from "date-fns";

export const getStatusColor = (status: EventStatusName) => {
  switch (status) {
    case "LIVE": return "bg-green-100 text-green-700 border-green-200";
    case "APPROVED": return "bg-blue-100 text-blue-700 border-blue-200";
    case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "DRAFT": return "bg-gray-100 text-gray-700 border-gray-200";
    case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
    case "ARCHIVED": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "";
  }
};

export const getEventColumns = (
  onEdit: (event: Event) => void,
  onDelete: (event: Event) => void
): ColumnDef<Event>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => (
      <span className="text-gray-500 font-medium">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Event Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 max-w-[220px]">
        <span
          className="inline-flex items-center justify-center text-center text-[11px] font-bold text-white bg-blue-600 rounded-full px-3 py-1.5 leading-tight whitespace-normal break-words cursor-pointer hover:bg-blue-700 transition-colors"
          style={{ maxWidth: 200 }}
        >
          {row.original.title}
        </span>
        <span className="text-xs text-gray-400 ml-1">
          {row.original.eventType?.name || "Standard Event"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">{row.original.venue.name}</span>
        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{row.original.venue.location}</span>
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-700">
          {format(new Date(row.original.startTime), "MMM d, yyyy")}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">
          {format(new Date(row.original.startTime), "hh:mm a")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-700">
          {format(new Date(row.original.endTime), "MMM d, yyyy")}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">
          {format(new Date(row.original.endTime), "hh:mm a")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.status.statusName;
      return (
        <BadgeController variant="outline" className={`${getStatusColor(statusName)} rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
          {statusName}
        </BadgeController>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-gray-900">
        {format(new Date(row.original.createdAt), "M/d/yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-gray-900">
        {format(new Date(row.original.updatedAt || row.original.createdAt), "M/d/yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
         <button 
            type="button" 
            onClick={() => onEdit(row.original)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
         </button>
         <button 
            type="button" 
            onClick={() => onDelete(row.original)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
         </button>
      </div>
    )
  }
];
