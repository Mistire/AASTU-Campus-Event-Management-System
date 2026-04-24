import { ColumnDef } from "@tanstack/react-table";
import { Venue } from '../api';
import { Home } from 'lucide-react';

export const getVenuesColumns = (): ColumnDef<Venue>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "name",
        header: "Venue Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {row.original.name}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "building",
        header: "Building",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-700">{row.original.building || 'N/A'}</span>,
    },
    {
        accessorKey: "roomNumber",
        header: "Room",
        cell: ({ row }) => <span className="text-sm font-semibold text-gray-600">{row.original.roomNumber || 'N/A'}</span>,
    },
    {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
            <div>
                <span className="text-sm font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    {row.original.capacity || 0}
                </span>
            </div>
        ),
    },
];
