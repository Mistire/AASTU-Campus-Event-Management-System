"use client";

import { FileText, Download } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { mockLogs } from '@/features/logs/testing/mock-logs';
import { getLogsColumns } from '@/features/logs/components/LogsTableConfig';

export default function ExportLogsPage() {
    const columns = getLogsColumns();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">System Logs</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Audit trail of system activities and security events.
                        </p>
                    </div>
                </div>
                <CemsButton cemsVariant="brand" className="rounded-xl shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </CemsButton>
            </div>

            <div className="bg-white rounded-xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <CemsTable
                    data={mockLogs}
                    columns={columns}
                    emptyMessage="No system logs found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                />
            </div>
        </div>
    );
}
