import { ColumnDef } from "@tanstack/react-table";
import { Venue } from '../api';
import { Home } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getVenuesColumns = (): ColumnDef<Venue>[] => [

    {
        accessorKey: "name",
        header: "Venue Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "building",
        header: "Building",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{truncate(row.original.building || 'N/A', 25)}</span>,
    },
    {
        accessorKey: "roomNumber",
        header: "Room",
        cell: ({ row }) => <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{row.original.roomNumber || 'N/A'}</span>,
    },
    {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
            <div>
                <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                    {row.original.capacity || 0}
                </span>
            </div>
        ),
    },
];
