"use client";

import { Headset, Plus, Search } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { mockTickets } from '@/features/support/testing/mock-tickets';
import { getSupportColumns, getSupportActions } from '@/features/support/components/SupportTableConfig';
import { Ticket } from '@/features/support/types';

export default function SupportPage() {
    const columns = getSupportColumns();
    const actions = getSupportActions((record: Ticket) => console.log('Reply', record));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Headset className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SOS & Feedback</h1>
                        <p className="text-gray-500 text-sm">Manage emergency alerts and support tickets.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-gray-200">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                    <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockTickets}
                    columns={columns}
                    actions={actions}
                    pagination={{ pageSize: 5, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
