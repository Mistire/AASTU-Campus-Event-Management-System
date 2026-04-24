import { ColumnDef } from "@tanstack/react-table";
import { CategoryRecord } from '../types';
import { Tag as TagIcon } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getCategoriesColumns = (): ColumnDef<CategoryRecord>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "name",
        header: "Category Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <span className="text-sm font-medium text-gray-600">{truncate(row.original.description, 25)}</span>,
    },
    {
        accessorKey: "eventCount",
        header: "Events",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-brand bg-brand/5 px-3 py-1 rounded-full border border-brand/10">
                    {row.original.eventCount}
                </span>
            </div>
        ),
    },
];
