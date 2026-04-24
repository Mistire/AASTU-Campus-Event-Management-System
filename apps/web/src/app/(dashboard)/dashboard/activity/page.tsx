"use client";

import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ShieldX, Clock, Globe, Cpu, User, X, ChevronRight, RefreshCw } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { useLogs, useLogDetail } from '@/features/logs/api';
import { getLogsColumns } from '@/features/logs/components/LogsTableConfig';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/features/logs/types';
import { Skeleton } from '@/components/ui/skeleton';

function LogDetailPanel({ id, onClose }: { id: string | null; onClose: () => void }) {
    const { data: log, isLoading } = useLogDetail(id);
    if (!id) return null;
    return (
        <div className={cn(
            "fixed inset-0 z-50 flex justify-end transition-all duration-300",
            id ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-white shadow-2xl h-full overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Activity Detail</h2>
                            <p className="text-[10px] text-gray-400 font-medium">Full audit record</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                    </div>
                ) : log ? (
                    <div className="p-6 space-y-6 flex-1">
                        {/* Outcome Banner */}
                        <div className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border font-black text-sm uppercase tracking-widest",
                            log.outcome === 'SUCCESS'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                            {log.outcome === 'SUCCESS' ? <ShieldCheck className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                            {log.outcome}
                        </div>

                        {/* Core Identity Fields */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Identity</h3>
                            <div className="space-y-2">
                                <DetailRow icon={<User className="w-4 h-4" />} label="Actor" value={log.user?.fullName} />
                                <DetailRow icon={<User className="w-4 h-4" />} label="Email" value={log.user?.email} />
                                <DetailRow icon={<ShieldCheck className="w-4 h-4" />} label="Role" value={log.role || 'N/A'} />
                            </div>
                        </section>

                        {/* Action & Context */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Action & Context</h3>
                            <div className="space-y-2">
                                <DetailRow icon={<Activity className="w-4 h-4" />} label="Action" value={log.action} highlight />
                                <DetailRow icon={<Cpu className="w-4 h-4" />} label="Entity Type" value={log.entityType} />
                                <DetailRow icon={<Cpu className="w-4 h-4" />} label="Entity ID" value={log.entityId || '—'} mono />
                                <DetailRow icon={<Clock className="w-4 h-4" />} label="Timestamp" value={new Date(log.createdAt).toLocaleString()} />
                            </div>
                        </section>

                        {/* Network */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Network & Session</h3>
                            <div className="space-y-2">
                                <DetailRow icon={<Globe className="w-4 h-4" />} label="IP Address" value={log.ipAddress || '—'} mono />
                                <DetailRow icon={<Globe className="w-4 h-4" />} label="Environment" value={log.environment || '—'} />
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">User Agent</p>
                                    <p className="text-[11px] font-medium text-gray-600 break-all leading-relaxed">{log.userAgent || '—'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        {log.details && (
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                                <p className="text-sm font-medium text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">{log.details}</p>
                            </section>
                        )}

                        {/* Before / After State */}
                        {(log.beforeState || log.afterState) && (
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">State Changes</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Before</p>
                                        <pre className="text-[10px] font-mono text-gray-600 bg-rose-50/50 border border-rose-100 p-3 rounded-xl overflow-auto max-h-40">
                                            {JSON.stringify(log.beforeState, null, 2) || '—'}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">After</p>
                                        <pre className="text-[10px] font-mono text-gray-600 bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl overflow-auto max-h-40">
                                            {JSON.stringify(log.afterState, null, 2) || '—'}
                                        </pre>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-gray-400 text-sm">Log entry not found.</div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value, highlight = false, mono = false }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    highlight?: boolean;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className={cn(
                    "text-sm font-bold mt-0.5 break-all",
                    highlight ? "text-brand" : "text-gray-800",
                    mono && "font-mono"
                )}>{value || '—'}</p>
            </div>
        </div>
    );
}

export default function ActivityPage() {
    const { data: logs, isLoading, refetch } = useLogs();
    const columns = getLogsColumns();
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: CustomEvent) => setSelectedLogId(e.detail);
        window.addEventListener('view-log-detail', handler as EventListener);
        return () => window.removeEventListener('view-log-detail', handler as EventListener);
    }, []);

    const totalLogs = (logs as LogEntry[] | undefined)?.length ?? 0;
    const failures = (logs as LogEntry[] | undefined)?.filter(l => l.outcome === 'FAILURE').length ?? 0;

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                            System <span className="text-brand">Activity</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Audit trail of all system events and security activities
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand border border-brand/20 bg-brand/5 hover:bg-brand/10 px-4 py-2 rounded-xl transition-all group"
                    >
                        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-700" />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Events</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{isLoading ? '—' : totalLogs}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Failed Attempts</p>
                        <p className="text-2xl font-black text-rose-600 mt-1">{isLoading ? '—' : failures}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Success Rate</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">
                            {isLoading || totalLogs === 0 ? '—' : `${Math.round(((totalLogs - failures) / totalLogs) * 100)}%`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100">
                    <CemsTable
                        data={(logs as LogEntry[]) || []}
                        columns={columns}
                        loading={isLoading}
                        emptyMessage="No activity logs found. Actions like login, signup, and data changes will appear here."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                        pageSize={15}
                    />
                </div>
            </div>

            {/* Detail Panel */}
            <LogDetailPanel id={selectedLogId} onClose={() => setSelectedLogId(null)} />
        </>
    );
}
