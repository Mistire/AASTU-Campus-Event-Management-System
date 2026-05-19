import { ColumnDef } from "@tanstack/react-table";
import { Event, EventStatusName } from "../types";
import { CemsBadge } from "@/components/cems/CemsBadge";

import { Pencil, Trash2, Send, Check, X, Play, Users } from "lucide-react";
import { truncate } from "@/lib/utils";

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
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand transition-colors">
          {truncate(row.original.title, 50)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-md">
            {row.original.eventType?.name || "Standard"}
          </span>
        </div>
      </div>
    ),
    size: 320,
  },
  {
    accessorKey: "startTime",
    header: "Schedule",
    cell: ({ row }) => {
      const start = new Date(row.original.startTime);
      const end = new Date(row.original.endTime);
      return (
        <div className="flex flex-col py-1">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      );
    },
    size: 160,
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => (
      <div className="flex flex-col py-1">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{truncate(row.original.venue.name, 25)}</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{truncate(row.original.venue.location || "", 25)}</span>
      </div>
    ),
    size: 200,
  },
  {
    id: "registrations",
    header: "Registrations",
    cell: ({ row }) => {
      const registrations = row.original._count?.registrations || 0;
      const capacity = row.original.capacity || row.original.venue?.capacity || 0;
      return (
        <div className="flex items-center gap-1.5 py-1">
          <span className="text-sm font-black text-brand dark:text-brand-light">
            {registrations}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            / {capacity ? `${capacity} max` : "∞"}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.status.statusName;
      return (
        <CemsBadge className={`${getStatusColor(statusName)} rounded-lg px-4 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm`}>
          {statusName}
        </CemsBadge>
      );
    },
    size: 110,
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
              className="p-2 text-brand hover:bg-brand/5 rounded-lg transition-all"
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
              className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
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
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                title="Approve Event"
              >
                <Check size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => onReject(event)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
              className="p-2 text-brand hover:bg-brand/5 rounded-lg transition-all"
              title="Go Live"
            >
              <Play size={18} />
            </button>
          )}

          <button 
            type="button" 
            onClick={() => onEdit(event)}
            className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
            title="Edit Event"
          >
            <Pencil size={18} />
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(event)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Event"
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    },
    size: 150,
  }
];
