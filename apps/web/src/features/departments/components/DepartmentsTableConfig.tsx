import { ColumnDef } from "@tanstack/react-table";
import { Department } from '../api';
import { GraduationCap } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getDepartmentsColumns = (): ColumnDef<Department>[] => [

    {
        accessorKey: "name",
        header: "Department Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "faculty",
        header: "Faculty",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{truncate(row.original.faculty || 'N/A', 25)}</span>,
    },
    {
        id: "studentCount",
        accessorFn: (row) => row._count?.users || 0,
        header: "Students",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                    {row.original._count?.users || 0}
                </span>
            </div>
        ),
    },
];
