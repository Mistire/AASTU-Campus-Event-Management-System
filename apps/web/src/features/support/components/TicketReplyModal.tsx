"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, ShieldCheck, Hash, CheckCircle, Loader2, Lock } from 'lucide-react';
import { CemsSheet } from '@/components/cems/CemsSheet';
import { CemsButton } from '@/components/cems/CemsButton';
import { CemsBadge } from '@/components/cems/CemsBadge';
import { useTicketDetails, useReplyTicket, useUpdateStatus } from '../api';
import { useSupportSocket } from '../hooks/useSupportSocket';
import { ToastController } from '@/components/shared/ToastController';
import { cn } from '@/lib/utils';

interface TicketReplyModalProps {
    ticketId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TicketReplyModal({ ticketId, open, onOpenChange }: TicketReplyModalProps) {
    const { data: ticket, isLoading } = useTicketDetails(ticketId || '');
    const replyTicket = useReplyTicket(ticketId || '');
    const updateStatus = useUpdateStatus(ticketId || '');
    const [replyMessage, setReplyMessage] = useState('');
    
    // Enable real-time updates
    useSupportSocket(ticketId);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            await replyTicket.mutateAsync(replyMessage);
            setReplyMessage('');
            ToastController.success({ message: "Reply sent successfully!" });
        } catch (error) {
            ToastController.error({ message: "Failed to send reply." });
        }
    };

    const handleResolve = async () => {
        try {
            await updateStatus.mutateAsync('RESOLVED');
            ToastController.success({ message: "Ticket marked as resolved!" });
            onOpenChange(false);
        } catch (error) {
            ToastController.error({ message: "Failed to update ticket status." });
        }
    };

    const handleClose = async () => {
        try {
            await updateStatus.mutateAsync('CLOSED');
            ToastController.success({ message: "Ticket marked as closed!" });
            onOpenChange(false);
        } catch (error) {
            ToastController.error({ message: "Failed to update ticket status." });
        }
    };

    return (
        <CemsSheet 
            open={open} 
            onOpenChange={onOpenChange}
            className="max-w-md"
            scrollable={false}
        >
            <div className="flex flex-col h-[100dvh] max-h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading Conversation</p>
                    </div>
                ) : ticket ? (
                    <>
                        {/* Fixed Header */}
                        <div className="bg-brand p-8 text-white relative overflow-hidden shrink-0 z-30 shadow-lg">
                            <div className="absolute -bottom-4 -right-4 opacity-10">
                                <MessageSquare size={120} />
                            </div>
                            <div className="relative z-10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                                        Support Request
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                                            <button 
                                                onClick={handleResolve}
                                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                            >
                                                <CheckCircle size={12} />
                                                Resolve
                                            </button>
                                        )}
                                        {ticket.status !== 'CLOSED' && (
                                            <button 
                                                onClick={handleClose}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border border-red-500/20"
                                            >
                                                <Lock size={12} />
                                                Close
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black tracking-tight leading-tight max-w-[90%]">
                                    {ticket.subject}
                                </h3>
                                <div className="flex items-center gap-2 pt-1">
                                    <CemsBadge className={cn(
                                        "rounded-lg px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border-none bg-white/20 text-white",
                                        ticket.status === 'RESOLVED' ? "bg-white/40" : 
                                        ticket.status === 'CLOSED' ? "bg-black/40" : "bg-emerald-500/40"
                                    )}>
                                        {ticket.status}
                                    </CemsBadge>
                                    <span className="text-[9px] font-bold text-white/60 flex items-center gap-1.5 ml-2">
                                        <Hash size={10} />
                                        {ticketId?.slice(0, 8)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Conversation History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide z-10 min-h-0 bg-transparent">
                            {/* Requester Info */}
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800">
                                        <User size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Requester</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                            {ticket.user?.fullName || ticket.guestName || "Guest User"}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-50 dark:bg-gray-800" />
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Original Message</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                        {ticket.description}
                                    </p>
                                </div>
                            </div>

                            {/* Thread section */}
                            <div className="space-y-4 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Live Thread</span>
                                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                                </div>

                                {ticket.messages?.length === 0 ? (
                                    <div className="text-center py-10 opacity-30">
                                        <Clock className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Waiting for response</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {ticket.messages?.map((msg: any) => (
                                            <div 
                                                key={msg.id}
                                                className={cn(
                                                    "max-w-[95%] p-4 rounded-2xl text-sm leading-relaxed",
                                                    msg.userId === ticket.userId 
                                                        ? "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 mr-auto" 
                                                        : "bg-brand text-white ml-auto shadow-lg shadow-brand/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1.5 opacity-70">
                                                    <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        {msg.userId !== ticket.userId && <ShieldCheck className="w-3 h-3" />}
                                                        {msg.userId === ticket.userId 
                                                            ? (ticket.user?.fullName || ticket.guestName || "Guest") 
                                                            : "Support Team"}
                                                    </span>
                                                    <span className="text-[9px] ml-auto font-bold opacity-60">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{msg.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fixed Reply Area */}
                        <div className="shrink-0 p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                            <form onSubmit={handleReply} className="relative group">
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? "Ticket is resolved/closed" : "Type a reply..."}
                                    rows={3}
                                    disabled={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent text-sm font-bold focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-brand/5 focus:border-brand/20 outline-none transition-all resize-none pr-16 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyMessage.trim() || replyTicket.isPending || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                                    className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center opacity-30">
                        <p className="text-xs font-black uppercase tracking-widest">Ticket not found</p>
                    </div>
                )}
            </div>
        </CemsSheet>
    );
}
