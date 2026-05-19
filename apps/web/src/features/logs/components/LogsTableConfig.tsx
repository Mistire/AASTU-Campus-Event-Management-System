import { ColumnDef } from "@tanstack/react-table";
import { LogEntry } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, truncate } from "@/lib/utils";

export const getLogsColumns = (): ColumnDef<LogEntry>[] => [

    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(row.original.createdAt).toLocaleString()}</span>,
    },
    {
        accessorKey: "outcome",
        header: "Outcome",
        cell: ({ row }) => {
            const outcome = row.original.outcome;
            const isSuccess = outcome === 'SUCCESS';
            return (
                <div className={cn(
                    "flex items-center gap-1.5 font-black text-[9px] px-2 py-0.5 rounded-lg border uppercase tracking-widest shadow-sm w-fit",
                    isSuccess 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                        : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                )}>
                    {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {outcome}
                </div>
            );
        },
    },
    {
        accessorKey: "ipAddress",
        header: "IP Source",
        cell: ({ row }) => <span className="text-[10px] font-medium text-gray-400 font-mono">{row.original.ipAddress || '—'}</span>,
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <div className="font-bold text-xs text-gray-900 dark:text-white">
                {truncate(row.original.action, 25)}
            </div>
        ),
    },
    {
        accessorKey: "user",
        header: "Actor",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{truncate(row.original.user.fullName, 25)}</span>
                <span className="text-[8px] font-medium text-gray-400">{row.original.role || 'User'}</span>
            </div>
        ),
    },
    {
        id: "actions",
        header: "Audit Trail",
        cell: ({ row }) => (
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('view-log-detail', { detail: row.original.id }))}
                className="text-[10px] font-black text-brand hover:underline uppercase tracking-widest"
            >
                View Details
            </button>
        ),
    },
];
