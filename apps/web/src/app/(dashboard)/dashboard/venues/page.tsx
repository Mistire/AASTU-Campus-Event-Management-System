"use client";

import { MapPin, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { mockVenues } from '@/features/venues/testing/mock-venues';
import { getVenuesColumns } from '@/features/venues/components/VenuesTableConfig';

export default function VenuesPage() {
    const columns = getVenuesColumns();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Venues</h1>
                        <p className="text-gray-500 text-sm">Manage campus halls and outdoor spaces.</p>
                    </div>
                </div>
                <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockVenues}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
