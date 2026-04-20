import { ColumnDef } from "@tanstack/react-table";
import { Event, EventStatusName } from "../types";
import { CemsBadge } from "@/components/cems/CemsBadge";

import { Pencil, Trash2, Send, Check, X, Play, Users } from "lucide-react";

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
  role: string,
  onEdit: (event: Event) => void,
  onDelete: (event: Event) => void,
  onSubmit: (event: Event) => void,
  onApprove: (event: Event) => void,
  onReject: (event: Event) => void,
  onGoLive: (event: Event) => void,
  onManageAttendees: (event: Event) => void
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.status.statusName;
      return (
        <CemsBadge className={`${getStatusColor(statusName)} rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm`}>
          {statusName}
        </CemsBadge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const event = row.original;
      const status = event.status.statusName;
      const isAdmin = role === "ADMIN";
      const isOrganizer = role === "ORGANIZER";

      return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Organizer: Manage Attendees (Show for processed events) */}
          {isOrganizer && status !== "DRAFT" && (
            <button 
              type="button" 
              onClick={() => onManageAttendees(event)}
              className="p-2 text-brand hover:bg-brand/5 rounded-xl transition-all"
              title="Manage Attendees"
            >
              <Users size={18} />
            </button>
          )}

          {/* Organizer: Submit Draft */}
          {isOrganizer && status === "DRAFT" && (
            <button 
              type="button" 
              onClick={() => onSubmit(event)}
              className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
              title="Submit for Approval"
            >
              <Send size={18} />
            </button>
          )}

          {/* Admin: Approve/Reject Pending */}
          {isAdmin && status === "PENDING" && (
            <>
              <button 
                type="button" 
                onClick={() => onApprove(event)}
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                title="Approve Event"
              >
                <Check size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => onReject(event)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Reject Event"
              >
                <X size={18} />
              </button>
            </>
          )}

          {/* Organizer: Go Live Approved */}
          {isOrganizer && status === "APPROVED" && (
            <button 
              type="button" 
              onClick={() => onGoLive(event)}
              className="p-2 text-brand hover:bg-brand/5 rounded-xl transition-all"
              title="Go Live"
            >
              <Play size={18} />
            </button>
          )}

          <button 
            type="button" 
            onClick={() => onEdit(event)}
            className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
            title="Edit Event"
          >
            <Pencil size={18} />
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(event)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Delete Event"
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    }
  }
];
