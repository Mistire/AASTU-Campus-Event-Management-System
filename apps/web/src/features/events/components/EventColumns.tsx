import { ColumnDef } from "@tanstack/react-table";
import { Event, EventStatusName } from "../types";
import { BadgeController } from "@/components/controllers/BadgeController";
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

export const eventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Event Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">{row.original.title}</span>
        <span className="text-xs text-gray-500">{row.original.eventType.typeName}</span>
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.original.startTime), "PPp"),
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => row.original.venue.name,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.status.statusName;
      return (
        <BadgeController variant="outline" className={getStatusColor(statusName)}>
          {statusName}
        </BadgeController>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      const count = row.original._count?.registrations || 0;
      return `${count} / ${row.original.capacity}`;
    },
  },
];
