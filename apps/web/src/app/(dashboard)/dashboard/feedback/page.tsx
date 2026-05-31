"use client";

import { useState } from "react";
import { MessageSquare, Star, Users, ShieldCheck, BarChart3 } from "lucide-react";
import { CemsTable } from "@/components/cems/CemsTable";
import { useFeedback, useAllFeedbackResponses } from "@/features/feedback/api";
import { getFeedbackColumns } from "@/features/feedback/components/FeedbackTableConfig";
import { getFeedbackResponseColumns } from "@/features/feedback/components/FeedbackResponsesTable";
import { FeedbackResponse } from "@/features/feedback/types";
import { CemsButton } from "@/components/cems/CemsButton";
import { 
  CemsDialog, 
  CemsDialogContent, 
  CemsDialogHeader, 
  CemsDialogTitle, 
  CemsDialogDescription, 
  CemsDialogFooter 
} from "@/components/cems/CemsDialog";

type Tab = "legacy" | "structured";

export default function FeedbackPage() {
    const [tab, setTab] = useState<Tab>("structured");
    const [selectedResponse, setSelectedResponse] = useState<FeedbackResponse | null>(null);

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
                        loading={structuredLoading}
                        emptyMessage="No structured feedback responses yet."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                        onRowClick={(row) => setSelectedResponse(row)}
                    />
                ) : (
                    <CemsTable
                        data={legacyFeedback || []}
                        columns={legacyColumns}
                        loading={legacyLoading}
                        emptyMessage="No legacy feedback records found."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                    />
                )}
            </div>

            {/* Response Detail Dialog */}
            <CemsDialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
                <CemsDialogContent size="lg" className="max-h-[85vh]">
                    <CemsDialogHeader icon={<MessageSquare />}>
                        <CemsDialogTitle>Feedback Details</CemsDialogTitle>
                        <CemsDialogDescription>
                            Review response details submitted for {selectedResponse?.event.title}
                        </CemsDialogDescription>
                    </CemsDialogHeader>

                    {selectedResponse && (
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                            {/* Attendee Info Card */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Submitted By</span>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white">{selectedResponse.attendee.displayName}</h3>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{selectedResponse.attendee.displayEmail}</span>
                                </div>
                                <div className="space-y-1 md:text-right shrink-0">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Date Submitted</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {new Date(selectedResponse.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Answers List */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Questions & Responses</h4>
                                <div className="space-y-3">
                                    {selectedResponse.answers.map((ans, idx) => (
                                        <div 
                                            key={ans.id} 
                                            className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 shadow-sm hover:border-brand/10 dark:hover:border-brand/10 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand/5 dark:bg-brand/10 text-brand text-[10px] font-black shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">
                                                    {ans.question.label}
                                                </span>
                                            </div>
                                            
                                            <div className="pl-8">
                                                {ans.question.type === "RATING" ? (
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => {
                                                            const val = parseInt(ans.value) || 0;
                                                            return (
                                                                <Star 
                                                                    key={i} 
                                                                    size={16} 
                                                                    className={i < val ? "text-amber-500 fill-amber-500" : "text-gray-200 dark:text-gray-700"} 
                                                                />
                                                            );
                                                        })}
                                                        <span className="ml-2 text-xs font-black text-gray-700 dark:text-gray-300">
                                                            ({ans.value} / 5)
                                                        </span>
                                                    </div>
                                                ) : ans.question.type === "SCALE" ? (
                                                    <div className="space-y-1.5 max-w-md">
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                            <span>Strongly Disagree</span>
                                                            <span>Strongly Agree</span>
                                                        </div>
                                                        <div className="grid grid-cols-10 gap-1">
                                                            {Array.from({ length: 10 }).map((_, i) => {
                                                                const val = parseInt(ans.value) || 0;
                                                                const active = i + 1 === val;
                                                                return (
                                                                    <div 
                                                                        key={i} 
                                                                        className={`h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${
                                                                            active 
                                                                                ? "bg-brand text-white shadow-md shadow-brand/20 scale-105" 
                                                                                : i < val 
                                                                                    ? "bg-brand/10 text-brand dark:bg-brand/5 dark:text-brand" 
                                                                                    : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                                                                        }`}
                                                                    >
                                                                        {i + 1}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-50 dark:border-gray-800/50 whitespace-pre-wrap leading-relaxed">
                                                        {ans.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <CemsDialogFooter>
                        <CemsButton 
                            variant="outline" 
                            onClick={() => setSelectedResponse(null)}
                            className="rounded-lg font-bold text-xs uppercase tracking-widest px-6 h-10 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900"
                        >
                            Close Details
                        </CemsButton>
                    </CemsDialogFooter>
                </CemsDialogContent>
            </CemsDialog>
        </div>
    );
}
