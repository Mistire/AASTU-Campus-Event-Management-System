import { ColumnDef } from "@tanstack/react-table";
import { Department } from '../api';
import { GraduationCap } from 'lucide-react';
import { truncate } from "@/lib/utils";

export const getDepartmentsColumns = (): ColumnDef<Department>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "name",
        header: "Department Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {truncate(row.original.name, 25)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "faculty",
        header: "Faculty",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-700">{truncate(row.original.faculty || 'N/A', 25)}</span>,
    },
    {
        accessorKey: "studentCount",
        header: "Students",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {row.original._count?.users || 0}
                </span>
            </div>
        ),
    },
];
