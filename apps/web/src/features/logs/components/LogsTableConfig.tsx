import { ColumnDef } from "@tanstack/react-table";
import { LogEntry } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export const getLogsColumns = (): ColumnDef<LogEntry>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.original.timestamp}</span>,
    },
    {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => {
            const level = row.original.level;
            let Icon = Info;
            let variantClass = "bg-blue-50 text-blue-600 border-blue-100";

            if (level === 'ERROR') { 
                Icon = AlertCircle; 
                variantClass = "bg-red-50 text-red-600 border-red-100";
            }
            if (level === 'WARNING') { 
                Icon = AlertCircle; 
                variantClass = "bg-amber-50 text-amber-600 border-amber-100";
            }
            if (level === 'SUCCESS') { 
                Icon = CheckCircle2; 
                variantClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            }

            return (
                <div className={cn(
                    "flex items-center gap-1.5 font-black text-[9px] px-2 py-0.5 rounded border uppercase tracking-widest shadow-sm",
                    variantClass
                )}>
                    <Icon className="w-3 h-3" />
                    {level}
                </div>
            );
        },
    },
    {
        accessorKey: "event",
        header: "Event Name",
        cell: ({ row }) => <span className="text-sm font-black text-gray-900 line-clamp-1">{row.original.event}</span>,
    },
    {
        accessorKey: "user",
        header: "Performed By",
        cell: ({ row }) => <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.05em]">{row.original.user}</span>,
    },
    {
        accessorKey: "details",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-sm font-medium text-gray-600 line-clamp-1 max-w-[300px]">
                {row.original.details}
            </span>
        ),
    },
];
