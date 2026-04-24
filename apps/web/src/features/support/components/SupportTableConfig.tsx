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
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{row.original.user.fullName}</span>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-widest bg-gray-50 text-gray-600 border-gray-100"
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
            const priority = row.original.priority;
            const priorityClass = 
                priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' :
                priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                priority === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-gray-50 text-gray-600 border-gray-100';
            return (
                <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase",
                    priorityClass
                )}>
                    {priority}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const val = row.original.status;
            return (
                <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    val === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    val === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    val === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-gray-50 text-gray-400 border-gray-100'
                )}>
                    {val}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
];

export const getSupportActions = (onReply: (record: Ticket) => void) => [
    { key: 'reply', label: 'Reply', icon: <MessageSquare className="w-4 h-4" />, onClick: onReply },
];
