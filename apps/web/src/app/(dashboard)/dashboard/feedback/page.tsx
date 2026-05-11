"use client";

import { MessageSquare, Star } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { useFeedback } from '@/features/feedback/api';
import { getFeedbackColumns } from '@/features/feedback/components/FeedbackTableConfig';

export default function FeedbackPage() {
    const columns = getFeedbackColumns();
    const { data: feedback, isLoading } = useFeedback();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm shrink-0">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">User Feedback</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-amber-400" />
                             Insights and ratings from event attendees.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-100 dark:border-amber-500/20">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">4.8 Avg Rating</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800">
                <CemsTable
                    data={feedback || []}
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
