import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from '../types';
import { MessageSquare } from 'lucide-react';
import { BadgeConfigs } from '@/components/ui/data-table/data-table';
import { cn } from "@/lib/utils";

export const getSupportColumns = (): ColumnDef<Ticket>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 group-hover:text-brand transition-colors">{row.original.subject}</span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{row.original.user}</span>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const val = row.original.category as keyof typeof BadgeConfigs.ticket.category;
            const config = BadgeConfigs.ticket.category[val];
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-widest",
                    config?.className
                )}>
                    {String(row.original.category).replace('_', ' ')}
                </div>
            );
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const val = row.original.priority as keyof typeof BadgeConfigs.ticket.priority;
            const config = BadgeConfigs.ticket.priority[val];
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase",
                    config?.className
                )}>
                    {String(row.original.priority)}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const val = row.original.status as keyof typeof BadgeConfigs.ticket.status;
            const config = BadgeConfigs.ticket.status[val] || BadgeConfigs.ticket.status.OPEN;
            return (
                <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    val === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    val === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    val === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-gray-50 text-gray-400 border-gray-100'
                )}>
                    {config.label}
                </div>
            );
        },
    },
];

export const getSupportActions = (onReply: (record: Ticket) => void) => [
    { key: 'reply', label: 'Reply', icon: <MessageSquare className="w-4 h-4" />, onClick: onReply },
];
