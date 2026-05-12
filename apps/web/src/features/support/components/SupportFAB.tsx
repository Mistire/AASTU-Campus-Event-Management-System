"use client";

import React, { useState } from 'react';
import { Headset, Send, AlertCircle, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { 
  CemsDialog, 
  CemsDialogContent, 
  CemsDialogHeader, 
  CemsDialogTitle, 
  CemsDialogDescription,
  CemsDialogFooter
} from '@/components/cems/CemsDialog';
import { CemsButton } from '@/components/cems/CemsButton';
import { useCreateTicket } from '../api';
import { ToastController } from '@/components/shared/ToastController';
import { cn } from '@/lib/utils';
import { MyTickets } from './MyTickets';

export function SupportFAB() {
    const { profile, hasAnyRole, _hasHydrated } = useAuthStore();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [activeTab, setActiveTab] = useState<'raise' | 'history'>('raise');
    const createTicket = useCreateTicket();

    const isLoggedIn = !!profile;
    const isAdmin = hasAnyRole(['ADMIN']);

    // Hide if not hydrated, or if user is admin
    if (!_hasHydrated || isAdmin) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            guestName: formData.get('guestName'),
            guestEmail: formData.get('guestEmail'),
            subject: formData.get('subject'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            message: formData.get('message'),
        };

        try {
            const result = await createTicket.mutateAsync(data);
            const ticketId = result.data?.id || result.id;
            
            ToastController.success({ 
                message: "Ticket Raised Successfully!",
                description: `Ticket ID: ${ticketId?.slice(0, 8)}... Check your email for a tracking link.`
            });
            setIsOpen(false);
        } catch (error) {
            ToastController.error({ message: "Failed to raise ticket. Please try again." });
        }
    };

    return (
        <>
            <div 
                className="fixed bottom-8 right-8 z-[100]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className="absolute bottom-0 right-full mr-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none whitespace-nowrap hidden md:block"
                        >
                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                                Need Help? <span className="text-brand">Ask Support</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "w-14 h-14 rounded-lg bg-brand text-white shadow-2xl shadow-brand/30 flex items-center justify-center transition-all duration-300 relative overflow-hidden group",
                        isHovered && "rounded-lg"
                    )}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Headset className="w-6 h-6" />
                </motion.button>
            </div>

            <CemsDialog open={isOpen} onOpenChange={setIsOpen}>
                <CemsDialogContent size="md">
                    <CemsDialogHeader icon={<LifeBuoy className="animate-pulse" />}>
                        <CemsDialogTitle>Support Center</CemsDialogTitle>
                        <CemsDialogDescription>
                            {isLoggedIn 
                                ? "Manage your support requests and get help from our team." 
                                : "Tell us what's wrong and we'll get back to you shortly via email."}
                        </CemsDialogDescription>
                    </CemsDialogHeader>

                    {isLoggedIn && (
                        <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl mx-6 mt-4">
                            <button
                                onClick={() => setActiveTab('raise')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    activeTab === 'raise' 
                                        ? "bg-white dark:bg-gray-900 text-brand shadow-sm" 
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                Raise Ticket
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    activeTab === 'history' 
                                        ? "bg-white dark:bg-gray-900 text-brand shadow-sm" 
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                My Tickets
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin">
                        {activeTab === 'raise' ? (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {!isLoggedIn && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                name="guestName"
                                                required
                                                placeholder="John Doe"
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                name="guestEmail"
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        name="subject"
                                        required
                                        placeholder="e.g., Cannot register for Hackathon"
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all dark:text-white"
                                    />
                                </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <select 
                                    name="category"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all cursor-pointer dark:text-white"
                                >
                                    <option value="TECHNICAL">Technical Issue</option>
                                    <option value="ACCOUNT">Account Problem</option>
                                    <option value="EVENT_ISSUE">Event Related</option>
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                                <select 
                                    name="priority"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all cursor-pointer dark:text-white"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Message</label>
                            <textarea
                                name="message"
                                required
                                rows={4}
                                placeholder="Please describe your issue in detail..."
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all resize-none dark:text-white"
                            />
                        </div>

                                <CemsDialogFooter className="mt-2 flex items-center justify-between gap-4">
                                    {!isLoggedIn && (
                                        <a 
                                            href="/support/track" 
                                            className="text-[10px] font-black text-gray-400 hover:text-brand uppercase tracking-widest transition-colors"
                                        >
                                            Track Existing Ticket
                                        </a>
                                    )}
                                    <div className="flex gap-2 ml-auto">
                                        <CemsButton 
                                            type="button" 
                                            cemsVariant="brand-ghost" 
                                            onClick={() => setIsOpen(false)}
                                            className="rounded-lg"
                                        >
                                            Cancel
                                        </CemsButton>
                                        <CemsButton 
                                            type="submit" 
                                            cemsVariant="brand"
                                            loading={createTicket.isPending}
                                            className="rounded-lg shadow-lg shadow-brand/20 px-8"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Raise Ticket
                                        </CemsButton>
                                    </div>
                                </CemsDialogFooter>
                            </form>
                        ) : (
                            <div className="p-6">
                                <MyTickets />
                            </div>
                        )}
                    </div>
                </CemsDialogContent>
            </CemsDialog>
        </>
    );
}
