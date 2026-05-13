"use client";

import { useState } from "react";
import { MessageSquare, Star, Users, ShieldCheck, BarChart3 } from "lucide-react";
import { CemsTable } from "@/components/cems/CemsTable";
import { useFeedback } from "@/features/feedback/api";
import { useAllFeedbackResponses } from "@/features/feedback/api";
import { getFeedbackColumns } from "@/features/feedback/components/FeedbackTableConfig";
import { getFeedbackResponseColumns } from "@/features/feedback/components/FeedbackResponsesTable";

type Tab = "legacy" | "structured";

export default function FeedbackPage() {
    const [tab, setTab] = useState<Tab>("structured");

    const legacyColumns = getFeedbackColumns();
    const structuredColumns = getFeedbackResponseColumns();

    const { data: legacyFeedback, isLoading: legacyLoading } = useFeedback();
    const { data: structuredData, isLoading: structuredLoading } = useAllFeedbackResponses(1, 100);

    const structuredFeedback = structuredData?.data || [];
    const totalStructured = structuredData?.meta?.total ?? 0;

    const avgRating = (() => {
        const ratings = structuredFeedback
            .flatMap((r) => r.answers)
            .filter((a) => a.question?.type === "RATING")
            .map((a) => parseFloat(a.value))
            .filter((v) => !isNaN(v));
        if (!ratings.length) return null;
        return (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1);
    })();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm shrink-0">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            User Feedback
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Full identity visible — Admin view
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {avgRating && (
                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-500/20">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                {avgRating} Avg Rating
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                        <Users className="w-4 h-4 text-brand" />
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            {totalStructured} Total
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                            Admin
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                {([
                    { key: "structured", label: "Structured Responses", icon: BarChart3 },
                    { key: "legacy", label: "Legacy Feedback", icon: MessageSquare },
                ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                            tab === key
                                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        <Icon size={13} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800">
                {tab === "structured" ? (
                    <CemsTable
                        data={structuredFeedback}
                        columns={structuredColumns}
                        isLoading={structuredLoading}
                        emptyMessage="No structured feedback responses yet."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                    />
                ) : (
                    <CemsTable
                        data={legacyFeedback || []}
                        columns={legacyColumns}
                        isLoading={legacyLoading}
                        emptyMessage="No legacy feedback records found."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                    />
                )}
            </div>
        </div>
    );
}
