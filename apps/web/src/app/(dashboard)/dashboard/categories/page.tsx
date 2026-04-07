"use client";

import { Layers, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/features/categories/testing/mock-categories';
import { getCategoriesColumns } from '@/features/categories/components/CategoriesTableConfig';

export default function CategoriesPage() {
    const columns = getCategoriesColumns();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Layers className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
                        <p className="text-gray-500 text-sm">Organize events by their primary focus areas.</p>
                    </div>
                </div>
                
                <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockCategories}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
