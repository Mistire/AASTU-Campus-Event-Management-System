"use client";

import React, { useState } from 'react';
import { Headset, Send, AlertCircle, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
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

export function SupportFAB() {
    const { profile, hasAnyRole } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const createTicket = useCreateTicket();

    // Only show for Student and Organizer
    const canShow = hasAnyRole(['STUDENT', 'ORGANIZER']);
    if (!canShow) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            subject: formData.get('subject'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            message: formData.get('message'), // Assuming message might be used or added to subject
        };

        try {
            await createTicket.mutateAsync(data);
            ToastController.success({ message: "Support ticket raised successfully!" });
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
                            className="absolute bottom-0 right-full mr-4 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-2xl shadow-gray-200/50 whitespace-nowrap hidden md:block"
                        >
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
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
                        <CemsDialogTitle>Raise Support Ticket</CemsDialogTitle>
                        <CemsDialogDescription>
                            Tell us what's wrong and we'll get back to you shortly.
                        </CemsDialogDescription>
                    </CemsDialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                            <input
                                name="subject"
                                required
                                placeholder="e.g., Cannot register for Hackathon"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <select 
                                    name="category"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all cursor-pointer"
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
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all cursor-pointer"
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
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand/30 outline-none transition-all resize-none"
                            />
                        </div>

                        <CemsDialogFooter className="mt-2">
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
                        </CemsDialogFooter>
                    </form>
                </CemsDialogContent>
            </CemsDialog>
        </>
    );
}
