import { ColumnDef } from "@tanstack/react-table";
import { FeedbackRecord } from '../types';
import { User, Star } from 'lucide-react';

export const getFeedbackColumns = (): ColumnDef<FeedbackRecord>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-black text-gray-900 group-hover:text-brand transition-colors">
                <User className="w-4 h-4 text-brand" />
                {row.original.userName}
            </div>
        ),
    },
    {
        accessorKey: "eventName",
        header: "Event",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-600 line-clamp-1">{row.original.eventName}</span>,
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 shadow-sm w-fit">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {row.original.rating}/5
            </div>
        ),
    },
    {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => (
            <span className="text-sm font-medium text-gray-500 italic line-clamp-1 max-w-[280px]">
                &quot;{row.original.comment}&quot;
            </span>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
            <div className="text-right pr-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.original.date}</span>
            </div>
        ),
    },
];
