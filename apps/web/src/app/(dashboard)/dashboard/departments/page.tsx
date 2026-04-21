"use client";

import { useState } from "react";
import { GraduationCap, Plus, Loader2 } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { useDepartments } from '@/features/departments/api';
import { getDepartmentsColumns } from '@/features/departments/components/DepartmentsTableConfig';
import { AddDepartmentModal } from '@/features/departments/components/AddDepartmentModal';
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentsPage() {
    const columns = getDepartmentsColumns();
    const { data: departments, isLoading } = useDepartments();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Departments</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-brand" />
                             Academic departments and student distribution.
                        </p>
                    </div>
                </div>
                <CemsButton 
                    cemsVariant="brand" 
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-xl shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </CemsButton>
            </div>

            <div className="bg-white rounded-xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <CemsTable
                    data={departments || []}
                    columns={columns}
                    emptyMessage="No departments found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                />
            </div>

            <AddDepartmentModal 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen} 
            />
        </div>
    );
}
