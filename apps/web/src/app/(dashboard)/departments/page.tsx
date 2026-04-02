"use client";

import { LayoutGrid, Plus, GraduationCap } from 'lucide-react';
import { DataTable, ColumnTypes } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface DepartmentRecord {
    id: string;
    name: string;
    faculty: string;
    studentCount: number;
}

const mockDepartments: DepartmentRecord[] = [
    { id: '1', name: 'Software Engineering', faculty: 'Computing & Informatics', studentCount: 450 },
    { id: '2', name: 'Mechanical Engineering', faculty: 'Mechanical & Materials', studentCount: 600 },
    { id: '3', name: 'Electrical Engineering', faculty: 'Electrical & Computing', studentCount: 520 },
    { id: '4', name: 'Architecture', faculty: 'Architecture & Civil Engineering', studentCount: 300 },
    { id: '5', name: 'Mining Engineering', faculty: 'Earth Science', studentCount: 250 },
];

export default function DepartmentsPage() {
    const columns = [
        ColumnTypes.text<DepartmentRecord>('name', 'Department Name', {
            render: (val) => (
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand" />
                    <span className="font-semibold text-gray-900">{String(val)}</span>
                </div>
            ),
            width: '35%'
        }),
        ColumnTypes.text<DepartmentRecord>('faculty', 'Faculty', { width: '45%' }),
        ColumnTypes.text<DepartmentRecord>('studentCount', 'Students', { align: 'right', width: '20%' }),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Departments</h1>
                        <p className="text-gray-500 text-sm">Manage academic programs and faculty structures.</p>
                    </div>
                </div>
                <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockDepartments}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
