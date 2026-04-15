"use client";

import { MessageSquare, Star } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { mockFeedback } from '@/features/feedback/testing/mock-feedback';
import { getFeedbackColumns } from '@/features/feedback/components/FeedbackTableConfig';

export default function FeedbackPage() {
    const columns = getFeedbackColumns();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">User Feedback</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-amber-400" />
                             Insights and ratings from event attendees.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-amber-700 uppercase tracking-widest">4.8 Avg Rating</span>
                </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <CemsTable
                    data={mockFeedback}
                    columns={columns}
                    emptyMessage="No feedback records found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                />
            </div>
        </div>
    );
}
