"use client";

import { FileDown, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { mockLogs } from '@/features/logs/testing/mock-logs';
import { getLogsColumns } from '@/features/logs/components/LogsTableConfig';

export default function LogsPage() {
    const columns = getLogsColumns();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FileDown className="w-8 h-8 text-(--brand)" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Logs</h1>
                        <p className="text-gray-500 text-sm">Review system activity and audit trails.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-gray-200">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Range
                    </Button>
                    <Button variant="outline" className="rounded-xl border-gray-200">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="rounded-xl bg-(--brand) hover:bg-(--brand-hover) text-white shadow-lg shadow-(--brand)/20">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockLogs}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
