"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react';
import { 
  CemsDialog, 
  CemsDialogContent, 
  CemsDialogHeader, 
  CemsDialogTitle, 
  CemsDialogDescription,
} from '@/components/cems/CemsDialog';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { CemsButton } from '@/components/cems/CemsButton';
import { useTicketDetails, useReplyTicket } from '../api';
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
    const [replyMessage, setReplyMessage] = useState('');

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

    return (
        <CemsDialog open={open} onOpenChange={onOpenChange}>
            <CemsDialogContent size="lg" className="max-h-[85vh] flex flex-col">
                <CemsDialogHeader icon={<MessageSquare />}>
                    <CemsDialogTitle>
                        {ticket?.subject || 'Loading Ticket...'}
                    </CemsDialogTitle>
                    <CemsDialogDescription>
                        Ticket ID: {ticketId?.slice(0, 8)}... • Category: {ticket?.category}
                    </CemsDialogDescription>
                </CemsDialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {/* Ticket Description */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{ticket?.user?.fullName}</span>
                            <span className="text-[10px] text-gray-400 ml-auto">{ticket?.createdAt && new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {ticket?.description || "No description provided."}
                        </p>
                    </div>

                    {/* Messages/Replies */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Conversation</h4>
                        {ticket?.messages?.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 mx-auto mb-3">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No replies yet</p>
                            </div>
                        ) : (
                            ticket?.messages?.map((msg: any) => (
                                <div 
                                    key={msg.id}
                                    className={cn(
                                        "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.userId === ticket.userId 
                                            ? "bg-white border border-gray-100 mr-auto" 
                                            : "bg-brand text-white ml-auto"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {msg.userId === ticket.userId ? ticket.user.fullName : "Support Team"}
                                        </span>
                                        <span className="text-[9px] ml-auto">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    {msg.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <form onSubmit={handleReply} className="p-6 border-t border-gray-100 bg-white">
                    <div className="relative">
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply here..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all resize-none pr-14"
                        />
                        <button
                            type="submit"
                            disabled={!replyMessage.trim() || replyTicket.isPending}
                            className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <ModalFooter 
                    onCancel={() => onOpenChange(false)}
                    onSave={() => {/* Handle resolve logic if needed, or just close */ onOpenChange(false)}}
                    saveText="Mark as Resolved"
                />
            </CemsDialogContent>
        </CemsDialog>
    );
}
