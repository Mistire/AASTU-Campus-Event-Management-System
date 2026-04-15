import { ColumnDef } from "@tanstack/react-table";
import { UserRecord } from '../types';
import { Shield } from 'lucide-react';
import { BadgeConfigs } from '@/components/ui/data-table/data-table';
import { cn } from "@/lib/utils";

export const getUsersColumns = (): ColumnDef<UserRecord>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "name",
        header: "User",
        size: 250,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-brand/5 flex items-center justify-center text-brand text-xs font-black border border-brand/10 shadow-sm">
                    {(row.original.name || row.original.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 group-hover:text-brand transition-colors">{row.original.name || 'Unknown User'}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest truncate max-w-[180px] block">{row.original.email}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-black text-gray-700">
                <Shield className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] uppercase tracking-[0.1em]">{row.original.role}</span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const val = row.original.status as keyof typeof BadgeConfigs.status;
            const config = BadgeConfigs.status[val] || BadgeConfigs.status.pending;
            return (
                <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    val === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    val === 'inactive' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                )}>
                    {config.label}
                </div>
            );
        },
    },
    {
        accessorKey: "joined",
        header: "Joined Date",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.original.joined}</span>,
    },
];
