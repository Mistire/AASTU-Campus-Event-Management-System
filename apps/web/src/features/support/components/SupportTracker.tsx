"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Send, User, Clock, Search, ShieldCheck } from 'lucide-react';
import { usePublicTicket, usePublicReply } from '../api';
import { useSupportSocket } from '../hooks/useSupportSocket';
import { ToastController } from '@/components/shared/ToastController';
import { cn } from '@/lib/utils';
import { CemsButton } from '@/components/cems/CemsButton';

export function SupportTracker() {
    const searchParams = useSearchParams();
    const [ticketIdParam, setTicketIdParam] = useState(searchParams.get('ticketId') || '');
    const [emailParam, setEmailParam] = useState(searchParams.get('email') || '');
    const [isSearching, setIsSearching] = useState(!!(searchParams.get('ticketId') && searchParams.get('email')));
    
    const { data: ticket, isLoading, error } = usePublicTicket(
        isSearching ? ticketIdParam : '',
        isSearching ? emailParam : ''
    );
    
    // Enable real-time updates
    useSupportSocket(isSearching ? ticketIdParam : null, emailParam);
    
    const publicReply = usePublicReply(ticketIdParam, emailParam);
    const [replyMessage, setReplyMessage] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticketIdParam.trim() && emailParam.trim()) {
            setIsSearching(true);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            await publicReply.mutateAsync(replyMessage);
            setReplyMessage('');
            ToastController.success({ message: "Reply sent successfully!" });
        } catch (error) {
            ToastController.error({ message: "Failed to send reply." });
        }
    };

    if (!isSearching || error) {
        return (
            <div className="max-w-md mx-auto py-20 px-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-4">
                        <Search className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Track Your Ticket</h1>
                    <p className="text-sm text-gray-500 mt-2">Enter your ticket details to view the status and conversation.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Ticket ID</label>
                        <input
                            type="text"
                            value={ticketIdParam}
                            onChange={(e) => setTicketIdParam(e.target.value)}
                            placeholder="Enter Ticket ID"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:ring-4 focus:ring-brand/5 focus:border-brand/20 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                        <input
                            type="email"
                            value={emailParam}
                            onChange={(e) => setEmailParam(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:ring-4 focus:ring-brand/5 focus:border-brand/20 outline-none transition-all"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-xs font-bold text-red-500 text-center bg-red-50 py-2 rounded-lg border border-red-100">
                            {error instanceof Error ? error.message : "Ticket not found or invalid details."}
                        </p>
                    )}
                    <CemsButton type="submit" className="w-full h-12 text-sm uppercase tracking-widest font-black" variant="brand">
                        Search Ticket
                    </CemsButton>
                </form>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-6 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Conversation...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-brand" />
                        {ticket?.subject}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">
                        Ticket ID: {ticketIdParam.slice(0, 8)}... • {ticket?.category}
                    </p>
                </div>
                <div className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm",
                    ticket?.status === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    ticket?.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    ticket?.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-gray-50 text-gray-400 border-gray-100'
                )}>
                    {ticket?.status}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col min-h-[600px]">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
                    {/* Original Message */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Original Request</p>
                                <p className="text-sm font-black text-gray-900 uppercase">{ticket?.guestName || "You"}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-auto font-bold">{new Date(ticket?.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm font-medium">
                            {ticket?.description}
                        </p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-6">
                        {ticket?.messages?.length > 0 && (
                             <div className="flex items-center gap-4 py-2">
                                <div className="h-px flex-1 bg-gray-100" />
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Conversation Updates</span>
                                <div className="h-px flex-1 bg-gray-100" />
                            </div>
                        )}
                        
                        {ticket?.messages?.map((msg: any) => (
                            <div 
                                key={msg.id}
                                className={cn(
                                    "max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    !msg.userId
                                        ? "bg-white border border-gray-100 mr-auto" 
                                        : "bg-brand text-white ml-auto"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        {msg.userId ? (
                                            <>
                                                <ShieldCheck className="w-3 h-3" />
                                                Support Team
                                            </>
                                        ) : (
                                            ticket.guestName || "You"
                                        )}
                                    </span>
                                    <span className="text-[9px] ml-auto font-bold">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-medium">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reply Form */}
                {ticket?.status !== 'RESOLVED' ? (
                    <form onSubmit={handleReply} className="p-8 border-t border-gray-100 bg-white">
                        <div className="relative group">
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Add a message to the conversation..."
                                rows={3}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent text-sm font-bold focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand/20 outline-none transition-all resize-none pr-16"
                            />
                            <button
                                type="submit"
                                disabled={!replyMessage.trim() || publicReply.isPending}
                                className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 group-focus-within:shadow-xl group-focus-within:shadow-brand/40"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest text-center">Your reply will be visible to the support team</p>
                    </form>
                ) : (
                    <div className="p-8 border-t border-gray-100 bg-gray-50/50 text-center">
                        <p className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            This ticket has been marked as resolved.
                        </p>
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center">
                <button 
                    onClick={() => {
                        setIsSearching(false);
                        setTicketIdParam('');
                        setEmailParam('');
                    }}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand transition-colors"
                >
                    ← Back to Search
                </button>
            </div>
        </div>
    );
}
