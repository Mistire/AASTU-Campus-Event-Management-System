import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from '../types';
import { MessageSquare } from 'lucide-react';
import { BadgeConfigs } from '@/components/ui/data-table/data-table';
import { cn, truncate } from "@/lib/utils";

export const getSupportColumns = (): ColumnDef<Ticket>[] => [

    {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand transition-colors">{truncate(row.original.subject, 50)}</span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {row.original.user?.fullName || row.original.guestName || "Guest User"}
                </span>
            </div>
        ),
        size: 300,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700"
                )}>
                    {String(row.original.category).replace('_', ' ')}
                </div>
            );
        },
        size: 140,
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.original.priority;
            const priorityClass = 
                priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                priority === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase",
                    priorityClass
                )}>
                    {priority}
                </div>
            );
        },
        size: 120,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const val = row.original.status;
            return (
                <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    val === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                    val === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                    val === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    val === 'CLOSED' ? 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20' :
                    'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                )}>
                    {val.replace('_', ' ')}
                </div>
            );
        },
        size: 130,
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
        size: 110,
    },
];

export const getSupportActions = (onReply: (record: Ticket) => void) => [
    { key: 'reply', label: 'Reply', icon: <MessageSquare className="w-4 h-4" />, onClick: onReply },
];
