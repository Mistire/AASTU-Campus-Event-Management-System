import { ColumnDef } from "@tanstack/react-table";
import { UserRecord } from '../types';
import { Shield } from 'lucide-react';
import { BadgeConfigs } from '@/components/ui/data-table/data-table';
import { cn, truncate } from "@/lib/utils";
import Image from "next/image";

export const getUsersColumns = (): ColumnDef<UserRecord>[] => [

    {
        accessorKey: "name",
        header: "User",
        size: 250,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 relative rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-brand/5 flex items-center justify-center text-brand text-xs font-black">
                    {row.original.profileImage ? (
                        <Image 
                            src={row.original.profileImage} 
                            alt={row.original.name} 
                            fill
                            className="object-cover"
                        />
                    ) : (
                        (row.original.name || row.original.email || '?').charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand transition-colors">{truncate(row.original.name || 'Unknown User', 25)}</span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{truncate(row.original.email, 25)}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-black text-gray-700 dark:text-gray-300">
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
                    "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    val === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    val === 'inactive' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
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
