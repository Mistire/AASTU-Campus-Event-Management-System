"use client";

import { MapPin, Plus, Home } from 'lucide-react';
import { DataTable, ColumnTypes } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface VenueRecord {
    id: string;
    name: string;
    building: string;
    roomNumber: string;
    capacity: number;
}

const mockVenues: VenueRecord[] = [
    { id: '1', name: 'Main Auditorium', building: 'Building 1', roomNumber: '101', capacity: 500 },
    { id: '2', name: 'Senate Hall', building: 'Block 24', roomNumber: 'G01', capacity: 200 },
    { id: '3', name: 'Innovation Center', building: 'ICT Building', roomNumber: 'Lab 1', capacity: 50 },
    { id: '4', name: 'Multi-Purpose Field', building: 'Sports Complex', roomNumber: 'Outdoor', capacity: 5000 },
    { id: '5', name: 'Block 40 Conference Room', building: 'Block 40', roomNumber: 'Room 205', capacity: 80 },
];

export default function VenuesPage() {
    const columns = [
        ColumnTypes.text<VenueRecord>('name', 'Venue Name', {
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-brand" />
                    <span className="font-semibold text-gray-900">{String(val)}</span>
                </div>
            ),
            width: '30%'
        }),
        ColumnTypes.text<VenueRecord>('building', 'Building', { width: '30%' }),
        ColumnTypes.text<VenueRecord>('roomNumber', 'Room', { width: '20%' }),
        ColumnTypes.text<VenueRecord>('capacity', 'Capacity', { align: 'right', width: '20%' }),
    ];

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
