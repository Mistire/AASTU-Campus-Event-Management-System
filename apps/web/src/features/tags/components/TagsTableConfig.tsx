import { ColumnDef } from "@tanstack/react-table";
import { Tag } from '../api';
import { Hash } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getTagsColumns = (): ColumnDef<Tag>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 32,
    },
    {
        accessorKey: "name",
        header: "Tag Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors lowercase">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "eventCount",
        header: "Usage Count",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-brand bg-brand/5 px-3 py-1 rounded-lg border border-brand/10">
                    {row.original._count?.eventTags || 0} Events
                </span>
            </div>
        ),
    },
];
