import { ColumnDef } from "@tanstack/react-table";
import { EventTypeRecord } from '../types';
import { Layers } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getEventTypesColumns = (): ColumnDef<EventTypeRecord>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "name",
        header: "Event Type",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <span className="text-sm font-medium text-gray-600">{truncate(row.original.description || "No description", 50)}</span>,
    },
    {
        accessorKey: "events",
        header: "Events",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-brand bg-brand/5 px-3 py-1 rounded-lg border border-brand/10">
                    {row.original._count?.events || 0}
                </span>
            </div>
        ),
    },
];
