"use client";

import { Headset, Ticket as TicketIcon, Clock, CheckCircle2, Lock, Filter } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsMetricCard } from '@/components/cems/CemsMetricCard';
import { CemsSelect } from '@/components/cems/CemsSelect';
import { useTickets } from '@/features/support/api';
import { getSupportColumns, getSupportActions } from '@/features/support/components/SupportTableConfig';
import { TicketReplyModal } from '@/features/support/components/TicketReplyModal';
import { useState, useMemo } from 'react';

export default function SupportPage() {
    const { data: tickets, isLoading } = useTickets();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate ticket stats
    const stats = useMemo(() => {
        if (!tickets) return { total: 0, unresolved: 0, inProgress: 0, resolved: 0, closed: 0 };
        return tickets.reduce((acc: any, ticket: any) => {
            acc.total++;
            if (ticket.status === 'OPEN') acc.unresolved++;
            if (ticket.status === 'IN_PROGRESS') acc.inProgress++;
            if (ticket.status === 'RESOLVED') acc.resolved++;
            if (ticket.status === 'CLOSED') acc.closed++;
            return acc;
        }, { total: 0, unresolved: 0, inProgress: 0, resolved: 0, closed: 0 });
    }, [tickets]);

    const handleReply = (ticket: any) => {
        setSelectedTicketId(ticket.id);
        setIsModalOpen(true);
    };

    const columns = useMemo(() => [
        ...getSupportColumns(),
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const actions = getSupportActions(handleReply);
                return (
                    <div className="flex items-center gap-1">
                        {actions.map((action) => (
                            <button
                                key={action.key}
                                onClick={() => action.onClick(row.original)}
                                className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                                title={action.label}
                            >
                                {action.icon}
                            </button>
                        ))}
                    </div>
                );
            },
        },
    ], []);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm shrink-0">
                        <Headset className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Support Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Resolve tickets raised by students and organizers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CemsMetricCard 
                    title="Unresolved" 
                    value={stats.unresolved} 
                    icon={TicketIcon}
                    className="border-amber-100/50 dark:border-amber-500/10"
                />
                <CemsMetricCard 
                    title="In Progress" 
                    value={stats.inProgress} 
                    icon={Clock}
                    className="border-blue-100/50 dark:border-blue-500/10"
                />
                <CemsMetricCard 
                    title="Resolved" 
                    value={stats.resolved} 
                    icon={CheckCircle2}
                    className="border-emerald-100/50 dark:border-emerald-500/10"
                />
                <CemsMetricCard 
                    title="Closed" 
                    value={stats.closed} 
                    icon={Lock}
                    className="border-gray-100/50 dark:border-gray-800"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800">
                <CemsTable
                    data={tickets || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="No support tickets found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                    renderToolbarActions={(table) => (
                        <div className="flex items-center gap-2">
                            <CemsSelect
                                placeholder="Status"
                                triggerClassName="h-8 min-w-[120px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all min-h-0 py-0"
                                value={(table.getColumn('status')?.getFilterValue() as string) || "ALL"}
                                onValueChange={(val) => table.getColumn('status')?.setFilterValue(val === 'ALL' ? undefined : val)}
                                options={[
                                    { value: 'ALL', label: 'All Status' },
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'IN_PROGRESS', label: 'In Progress' },
                                    { value: 'RESOLVED', label: 'Resolved' },
                                    { value: 'CLOSED', label: 'Closed' },
                                ]}
                            />
                            <CemsSelect
                                placeholder="Priority"
                                triggerClassName="h-8 min-w-[120px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all min-h-0 py-0"
                                value={(table.getColumn('priority')?.getFilterValue() as string) || "ALL"}
                                onValueChange={(val) => table.getColumn('priority')?.setFilterValue(val === 'ALL' ? undefined : val)}
                                options={[
                                    { value: 'ALL', label: 'All Priority' },
                                    { value: 'LOW', label: 'Low' },
                                    { value: 'MEDIUM', label: 'Medium' },
                                    { value: 'HIGH', label: 'High' },
                                    { value: 'URGENT', label: 'Urgent' },
                                ]}
                            />
                            <CemsSelect
                                placeholder="Category"
                                triggerClassName="h-8 min-w-[120px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all min-h-0 py-0"
                                value={(table.getColumn('category')?.getFilterValue() as string) || "ALL"}
                                onValueChange={(val) => table.getColumn('category')?.setFilterValue(val === 'ALL' ? undefined : val)}
                                options={[
                                    { value: 'ALL', label: 'All Category' },
                                    { value: 'TECHNICAL', label: 'Technical' },
                                    { value: 'ACCOUNT', label: 'Account' },
                                    { value: 'EVENT_ISSUE', label: 'Event Issue' },
                                    { value: 'EMERGENCY', label: 'Emergency' },
                                    { value: 'OTHER', label: 'Other' },
                                ]}
                            />
                        </div>
                    )}
                />
            </div>

            <TicketReplyModal 
                ticketId={selectedTicketId}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
