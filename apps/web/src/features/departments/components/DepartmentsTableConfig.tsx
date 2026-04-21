import { ColumnDef } from "@tanstack/react-table";
import { DepartmentRecord } from '../types';
import { GraduationCap } from 'lucide-react';

export const getDepartmentsColumns = (): ColumnDef<DepartmentRecord>[] => [
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
                    {row.original.name}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "faculty",
        header: "Faculty",
        cell: ({ row }) => <span className="text-sm font-bold text-gray-700">{row.original.faculty}</span>,
    },
    {
        accessorKey: "studentCount",
        header: "Students",
        cell: ({ row }) => (
            <div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {row.original.studentCount}
                </span>
            </div>
        ),
    },
];
