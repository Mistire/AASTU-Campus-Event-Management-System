"use client";

import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ShieldX, Clock, Globe, Cpu, User, X, ChevronRight, RefreshCw, Mail, Hash } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { useLogs, useLogDetail } from '@/features/logs/api';
import { getLogsColumns } from '@/features/logs/components/LogsTableConfig';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/features/logs/types';
import { Skeleton } from '@/components/ui/skeleton';

import { DetailCard, DetailCardSection, DetailCardRow, DetailCardTimestamp } from '@/components/shared/DetailCard';

import { InfoRow } from '@/features/events/components/InfoRow';

function LogPreviewPanel({ id, onClose }: { id: string | null; onClose: () => void }) {
    const { data: log, isLoading } = useLogDetail(id);
    if (!id) return null;

    const isFailure = log?.outcome === 'FAILURE';

    return (
        <div className="w-[450px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-xl animate-in slide-in-from-right-5 fade-in duration-300 sticky top-24 self-start overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {isLoading ? (
                <div className="p-5 space-y-4">
                    <Skeleton className="h-40 rounded-2xl" />
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                </div>
            ) : log ? (
                <>
                    {/* Panel Header */}
                    <div className={cn(
                        "p-6 text-white relative overflow-hidden shrink-0",
                        isFailure ? "bg-rose-600" : "bg-brand"
                    )}>
                        <div className="absolute -top-6 -right-6 opacity-10">
                            {isFailure ? <ShieldX size={120} /> : <ShieldCheck size={120} />}
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">
                                    {log.entityType} Activity
                                </p>
                                <h3 className="text-xl font-black tracking-tight truncate mb-3">
                                    {log.action}
                                </h3>
                                <div className={cn(
                                    "inline-flex px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md shadow-lg"
                                )}>
                                    {log.outcome}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all text-white/70 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Panel Body */}
                    <div className="p-6 space-y-8">
                        {/* Identity Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                Identity
                            </h4>
                            <div className="space-y-3">
                                <InfoRow 
                                    icon={User} 
                                    label="Actor" 
                                    value={log.user?.fullName || 'System'} 
                                    sub={log.user?.email}
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                                <InfoRow 
                                    icon={ShieldCheck} 
                                    label="Access Role" 
                                    value={log.role || 'N/A'} 
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                            </div>
                        </div>

                        {/* Context Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" />
                                Action & Context
                            </h4>
                            <div className="space-y-3">
                                <InfoRow 
                                    icon={Cpu} 
                                    label="Entity Type" 
                                    value={log.entityType} 
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                                <InfoRow 
                                    icon={Hash} 
                                    label="Entity ID" 
                                    value={log.entityId || '—'} 
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                                <InfoRow 
                                    icon={Clock} 
                                    label="Timestamp" 
                                    value={new Date(log.createdAt).toLocaleString()} 
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                            </div>
                        </div>

                        {/* Network Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" />
                                Network & Session
                            </h4>
                            <div className="space-y-3">
                                <InfoRow 
                                    icon={Globe} 
                                    label="IP Address" 
                                    value={log.ipAddress || '—'} 
                                    iconClassName={isFailure ? "text-rose-500" : "text-brand"}
                                />
                                <div className="p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">User Agent</p>
                                    <p className="text-[11px] font-bold text-gray-600 break-all leading-relaxed">{log.userAgent || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {log.details && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</h4>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-transparent">
                                    {log.details}
                                </p>
                            </div>
                        )}

                        {/* State Changes */}
                        {(log.beforeState || log.afterState) && (
                            <div className="space-y-4 pt-2 pb-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    State Changes
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {log.beforeState && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Before Change</p>
                                            <pre className="text-[10px] font-mono text-gray-600 bg-rose-50/30 border border-rose-100/50 p-4 rounded-2xl overflow-auto max-h-48 scrollbar-hide">
                                                {JSON.stringify(log.beforeState, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {log.afterState && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">After Change</p>
                                            <pre className="text-[10px] font-mono text-gray-600 bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-2xl overflow-auto max-h-48 scrollbar-hide">
                                                {JSON.stringify(log.afterState, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default function ActivityPage() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const { data: logsData, isLoading, refetch } = useLogs({ 
        page: page + 1, 
        limit: pageSize 
    });
    
    const logs = logsData?.data || [];
    const meta = logsData?.meta;

    const columns = getLogsColumns();
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: CustomEvent) => setSelectedLogId(e.detail);
        window.addEventListener('view-log-detail', handler as EventListener);
        return () => window.removeEventListener('view-log-detail', handler as EventListener);
    }, []);

    const totalLogs = meta?.total ?? 0;
    // Note: failures count from meta stats if available, otherwise just from current page
    const failures = meta?.stats?.FAILURE ?? logs.filter((l: any) => l.outcome === 'FAILURE').length;

    return (
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

            {/* Master-Detail Layout */}
            <div className="flex gap-6 items-start">
                {/* Table */}
                <div className={cn(
                    "bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 flex-1 min-w-0 transition-all duration-500",
                )}>
                    <CemsTable
                        data={logs}
                        columns={columns}
                        loading={isLoading}
                        emptyMessage="No activity logs found."
                        onRowClick={(log) => setSelectedLogId(log.id)}
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                        
                        // Server-side pagination props
                        manualPagination
                        pageCount={meta?.totalPages || 0}
                        pageIndex={page}
                        pageSize={pageSize}
                        totalItems={totalLogs}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>

                {/* Detail Panel */}
                {selectedLogId && (
                    <LogPreviewPanel id={selectedLogId} onClose={() => setSelectedLogId(null)} />
                )}
            </div>
        </div>
    );
}
