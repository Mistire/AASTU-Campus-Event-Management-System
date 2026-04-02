"use client";

import { Layers, Plus, Tag as TagIcon } from 'lucide-react';
import { DataTable, ColumnTypes } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface CategoryRecord {
    id: string;
    name: string;
    description: string;
    eventCount: number;
}

const mockCategories: CategoryRecord[] = [
    { id: '1', name: 'Technology', description: 'Tech expos, workshops, and hackathons.', eventCount: 12 },
    { id: '2', name: 'Sports', description: 'Inter-college tournaments and fitness events.', eventCount: 8 },
    { id: '3', name: 'Academic', description: 'Seminars, lectures, and academic competitions.', eventCount: 15 },
    { id: '4', name: 'Social', description: 'Parties, dinners, and networking events.', eventCount: 5 },
    { id: '5', name: 'Art & Culture', description: 'Exhibitions, music, and dance performances.', eventCount: 10 },
];

export default function CategoriesPage() {
    const columns = [
        ColumnTypes.text<CategoryRecord>('name', 'Category Name', {
            render: (val) => (
                <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-brand" />
                    <span className="font-semibold text-gray-900">{String(val)}</span>
                </div>
            ),
            width: '30%'
        }),
        ColumnTypes.text<CategoryRecord>('description', 'Description', { width: '50%' }),
        ColumnTypes.text<CategoryRecord>('eventCount', 'Events', { align: 'center', width: '20%' }),
    ];

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
