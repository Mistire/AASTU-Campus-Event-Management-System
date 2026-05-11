"use client";

import { Headset } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { useTickets } from '@/features/support/api';
import { getSupportColumns, getSupportActions } from '@/features/support/components/SupportTableConfig';
import { TicketReplyModal } from '@/features/support/components/TicketReplyModal';
import { useState } from 'react';

export default function SupportPage() {
    const { data: tickets, isLoading } = useTickets();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleReply = (ticket: any) => {
        setSelectedTicketId(ticket.id);
        setIsModalOpen(true);
    };

    const columns = [
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
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
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

            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800">
                <CemsTable
                    data={tickets || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="No support tickets found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
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
