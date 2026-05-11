"use client";

import { ShieldCheck, ShieldX, Clock, Globe, Cpu, User, RefreshCw, Hash } from 'lucide-react';
import { useLogDetail } from '@/features/logs/api';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CemsSheet } from '@/components/cems/CemsSheet';

interface LogPreviewPanelProps {
    id: string | null;
    onClose: () => void;
}

export function LogPreviewPanel({ id, onClose }: LogPreviewPanelProps) {
    const { data: log, isLoading } = useLogDetail(id);
    const isFailure = log?.outcome === 'FAILURE';

    return (
        <CemsSheet 
            open={!!id} 
            onOpenChange={(open) => !open && onClose()}
            className="max-w-xl"
        >
            <div className="flex flex-col h-full bg-gray-50">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-40 rounded-lg" />
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
                    </div>
                ) : log ? (
                    <>
                        {/* Panel Header */}
                        <div className={cn(
                            "p-8 text-white relative overflow-hidden shrink-0",
                            isFailure ? "bg-rose-600" : "bg-brand"
                        )}>
                            <div className="absolute -top-6 -right-6 opacity-10">
                                {isFailure ? <ShieldX size={150} /> : <ShieldCheck size={150} />}
                            </div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                                    {log.entityType} Security Event
                                </p>
                                <h3 className="text-2xl font-black tracking-tight leading-tight">
                                    {log.action}
                                </h3>
                                <div className={cn(
                                    "inline-flex px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md shadow-lg"
                                )}>
                                    {log.outcome}
                                </div>
                            </div>
                        </div>

                        {/* Panel Body */}
                        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                            {/* Identity Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Identity & Access
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center border transition-colors",
                                            isFailure ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-brand/5 border-brand/10 text-brand"
                                        )}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Actor</p>
                                            <p className="text-sm font-black text-gray-900 truncate">{log.user?.fullName || 'System'}</p>
                                            <p className="text-[10px] text-gray-500 font-medium truncate">{log.user?.email || 'Automated Task'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center border transition-colors",
                                            isFailure ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-brand/5 border-brand/10 text-brand"
                                        )}>
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Access Role</p>
                                            <p className="text-sm font-black text-gray-900">{log.role || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Context & Metadata */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    Audit Context
                                </h4>
                                <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity Type</span>
                                        <span className="text-xs font-black text-gray-900">{log.entityType}</span>
                                    </div>
                                    <div className="h-px bg-gray-50" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity ID</span>
                                        <span className="text-[10px] font-mono text-gray-500">{log.entityId || '—'}</span>
                                    </div>
                                    <div className="h-px bg-gray-50" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</span>
                                        <span className="text-xs font-black text-gray-900">{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Network Details */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    Network Intelligence
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Address</span>
                                        <span className="text-xs font-black text-brand bg-brand/5 px-3 py-1 rounded-lg">{log.ipAddress || '—'}</span>
                                    </div>
                                    <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">User Agent String</p>
                                        <p className="text-[11px] font-bold text-gray-600 break-all leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100/50">{log.userAgent || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* State Changes Visualization */}
                            {(log.beforeState || log.afterState) && (
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Data State Transformation
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {log.beforeState && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Previous State (Pre-action)</p>
                                                <pre className="text-[10px] font-mono text-gray-600 bg-white border border-rose-100/50 p-5 rounded-lg overflow-auto max-h-64 shadow-sm">
                                                    {JSON.stringify(log.beforeState, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {log.afterState && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Modified State (Post-action)</p>
                                                <pre className="text-[10px] font-mono text-gray-600 bg-white border border-emerald-100/50 p-5 rounded-lg overflow-auto max-h-64 shadow-sm">
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
        </CemsSheet>
    );
}
