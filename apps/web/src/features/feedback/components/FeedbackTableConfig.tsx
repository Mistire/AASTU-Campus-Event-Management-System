import { ColumnDef } from "@tanstack/react-table";
import { FeedbackRecord } from '../types';
import { User, Star } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getFeedbackColumns = (): ColumnDef<FeedbackRecord>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand transition-colors">{truncate(row.original.user.fullName, 25)}</span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">{row.original.user.email}</span>
            </div>
        ),
    },
    {
        accessorKey: "event",
        header: "Event",
        cell: ({ row }) => <span className="text-sm font-black text-gray-900 dark:text-white">{truncate(row.original.event.title, 25)}</span>,
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20 shadow-sm w-fit">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-amber-700 dark:text-amber-400">{row.original.rating}</span>
            </div>
        ),
    },
    {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1 max-w-[300px]">
                {row.original.comment || <span className="text-gray-300 dark:text-gray-600 italic">No comment</span>}
            </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
];
