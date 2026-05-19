"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { 
    MessageSquare, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink,
    Search,
    ChevronRight,
    Headset
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketReplyModal } from './TicketReplyModal';

export function MyTickets() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['my-support-tickets'],
        queryFn: async () => {
            const res = await apiFetch('/api/support/my-tickets');
            if (!res.ok) throw new Error('Failed to fetch tickets');
            const result = await res.json();
            return result.data || result;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'RESOLVED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'CLOSED': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return <AlertCircle className="w-3 h-3" />;
            case 'IN_PROGRESS': return <Clock className="w-3 h-3" />;
            case 'RESOLVED': return <CheckCircle2 className="w-3 h-3" />;
            default: return <MessageSquare className="w-3 h-3" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading your tickets...</p>
            </div>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-4 border border-gray-100 dark:border-gray-800">
                    <Headset className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">No Tickets Yet</h3>
                <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                    Need help with something? Raise a support ticket and we'll get back to you.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Support History</h3>
                <span className="text-[10px] font-black text-brand uppercase tracking-widest">{tickets.length} Tickets</span>
            </div>

            <div className="space-y-2.5">
                {tickets.map((ticket: any) => (
                    <button
                        key={ticket.id}
                        onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setIsModalOpen(true);
                        }}
                        className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand/30 dark:hover:border-brand/30 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1",
                                        getStatusColor(ticket.status)
                                    )}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">•</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand transition-colors">
                                    {ticket.subject}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                    {ticket.description || "No description provided."}
                                </p>
                            </div>
                            <div className="shrink-0 pt-1">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand group-hover:bg-brand/10 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {ticket._count?.messages > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-2 relative z-10">
                                <div className="flex -space-x-1.5">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 bg-brand/10 flex items-center justify-center text-[8px] font-black text-brand">
                                            {i === 1 ? 'AD' : 'ME'}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    {ticket._count.messages} Replies
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <TicketReplyModal 
                ticketId={selectedTicketId}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
