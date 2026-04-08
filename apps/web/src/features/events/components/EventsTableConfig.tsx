import { ColumnDef } from "@tanstack/react-table";
import { Event, EventStatusName } from "../types";
import { BadgeController } from "@/components/shared/BadgeController";
import { format } from "date-fns";
import { Pencil, Trash2, Rocket, Check, X } from "lucide-react";

export const getStatusColor = (status: EventStatusName) => {
  switch (status) {
    case "LIVE": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "APPROVED": return "bg-blue-50 text-blue-600 border-blue-100";
    case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
    case "DRAFT": return "bg-gray-50 text-gray-400 border-gray-100";
    case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
    case "ARCHIVED": return "bg-purple-50 text-purple-600 border-purple-100";
    default: return "bg-gray-50 text-gray-400 border-gray-100";
  }
};

export const getEventsColumns = (
  onEdit: (event: Event) => void,
  onDelete: (event: Event) => void,
  onApprove: (event: Event) => void,
  onReject: (event: Event) => void,
  onSubmit: (event: Event) => void,
  isAdmin: boolean = false
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
    header: "Event",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="text-sm font-black text-gray-900 group-hover:text-brand transition-colors">
          {row.original.title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded-md">
            {row.original.eventType?.name || "Standard"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => (
      <div className="flex flex-col py-1">
        <span className="text-sm font-bold text-gray-700">{row.original.venue.name}</span>
        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{row.original.venue.location}</span>
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
        <BadgeController variant="outline" className={`${getStatusColor(statusName)} rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm`}>
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
    cell: ({ row }) => {
      const status = row.original.status.statusName;
      return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
           {status === "DRAFT" && (
             <button 
                type="button" 
                onClick={() => onSubmit(row.original)}
                title="Submit for Approval"
                className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
             >
                <Rocket size={18} />
             </button>
           )}

           {isAdmin && status === "PENDING" && (
             <>
               <button 
                  type="button" 
                  onClick={() => onApprove(row.original)}
                  title="Approve Event"
                  className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
               >
                  <Check size={18} />
               </button>
               <button 
                  type="button" 
                  onClick={() => onReject(row.original)}
                  title="Reject Event"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
               >
                  <X size={18} />
               </button>
             </>
           )}

           <button 
              type="button" 
              onClick={() => onEdit(row.original)}
              title="Edit Event"
              className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
           >
              <Pencil size={18} />
           </button>
           <button 
              type="button" 
              onClick={() => onDelete(row.original)}
              title="Delete Event"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
           >
              <Trash2 size={18} />
           </button>
        </div>
      );
    }
  }
];
