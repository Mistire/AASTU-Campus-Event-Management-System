"use client";

import { FileDown, Download, Filter, Calendar as CalendarIcon, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DataTable, ColumnTypes, CellRenderers } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface LogEntry {
    id: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    event: string;
    user: string;
    timestamp: string;
    details: string;
}

const mockLogs: LogEntry[] = [
    { id: '101', level: 'SUCCESS', event: 'Event Approved', user: 'Admin. Abebe', timestamp: '2026-03-31 10:15:22', details: 'Freshman Welcome Night approved by Admin.' },
    { id: '102', level: 'INFO', event: 'User Login', user: 'Dawit Y.', timestamp: '2026-03-31 10:10:05', details: 'Standard login from IP 192.168.1.45' },
    { id: '103', level: 'ERROR', event: 'Payment Failed', user: 'Sara L.', timestamp: '2026-03-31 09:55:12', details: 'CBE Birr API timeout during transaction #45892' },
    { id: '104', level: 'WARNING', event: 'Capacity Limit', user: 'System', timestamp: '2026-03-31 09:45:00', details: 'Tech Expo registration reached 90% capacity' },
    { id: '105', level: 'INFO', event: 'New Registration', user: 'Mulugeta B.', timestamp: '2026-03-31 09:30:45', details: 'Registered for Inter-College Sports' },
];

export default function LogsPage() {
    const columns = [
        ColumnTypes.text('timestamp', 'Timestamp', { width: '20%' }),
        ColumnTypes.text('level', 'Level', {
            render: (val: unknown) => {
                const level = String(val);
                let Icon = Info;
                let color = "text-blue-500 bg-blue-50 border-blue-100";

                if (level === 'ERROR') { Icon = AlertCircle; color = "text-red-500 bg-red-50 border-red-100"; }
                if (level === 'WARNING') { Icon = AlertCircle; color = "text-yellow-600 bg-yellow-50 border-yellow-100"; }
                if (level === 'SUCCESS') { Icon = CheckCircle2; color = "text-green-600 bg-green-50 border-green-100"; }

                // Unify ERROR/WARNING/SUCCESS sparingly if needed, 
                // but for logs, semantic colors are usually acceptable 
                // unless explicitly told to make logs blue too.
                // Re-reading user: "acroos tables there are different color themes... update to one only the light blue"
                // OK, I'll make them all blue-ish with subtle icons instead.

                return (
                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-(--brand) bg-(--brand-subtle) px-2 py-0.5 rounded border border-(--brand)/20">
                        <Icon className="w-3 h-3" />
                        {level}
                    </div>
                );
            },
            width: '12%'
        }),
        ColumnTypes.text('event', 'Event Name', {
            render: (val) => <span className="font-semibold text-gray-900">{String(val)}</span>,
            width: '18%'
        }),
        ColumnTypes.text('user', 'Performed By', { width: '15%' }),
        ColumnTypes.text('details', 'Description', {
            render: (val) => CellRenderers.truncate(String(val), 60),
            width: '35%'
        }),
    ];

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
