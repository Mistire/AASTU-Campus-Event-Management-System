"use client";

import { useState } from "react";
import {
    BarChart3, Star, MessageSquare, ChevronDown, ChevronRight,
    Users, Loader2, ShieldAlert, EyeOff
} from "lucide-react";
import { useMyEventsFeedbackResponses } from "@/features/feedback/api";
import { CemsTable } from "@/components/cems/CemsTable";
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

function calcAvgRating(responses: FeedbackResponse[]): number | null {
    const ratings = responses
        .flatMap((r) => r.answers)
        .filter((a) => a.question?.type === "RATING")
        .map((a) => parseFloat(a.value))
        .filter((v) => !isNaN(v));
    if (ratings.length === 0) return null;
    return Math.round((ratings.reduce((sum, v) => sum + v, 0) / ratings.length) * 10) / 10;
}

function groupByEvent(responses: FeedbackResponse[]) {
    const map = new Map<string, { eventId: string; eventTitle: string; responses: FeedbackResponse[] }>();
    for (const r of responses) {
        if (!map.has(r.event.id)) {
            map.set(r.event.id, { eventId: r.event.id, eventTitle: r.event.title, responses: [] });
        }
        map.get(r.event.id)!.responses.push(r);
    }
    return Array.from(map.values());
}

export default function MyEventsFeedbackPage() {
    const { data, isLoading, error } = useMyEventsFeedbackResponses(1, 200);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedResponse, setSelectedResponse] = useState<FeedbackResponse | null>(null);
    const columns = getFeedbackResponseColumns();

    const toggleExpand = (eventId: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(eventId) ? next.delete(eventId) : next.add(eventId);
            return next;
        });
    };

    const grouped = groupByEvent(data?.data || []);
    const totalResponses = data?.meta?.total ?? 0;
    const overallAvg = calcAvgRating(data?.data || []);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm">
                        <BarChart3 size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                            Event Feedback
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            Responses from your organized events
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <Users size={14} className="text-brand" />
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            {totalResponses} Responses
                        </span>
                    </div>
                    {overallAvg !== null && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                {overallAvg} Avg
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Semi-anon notice */}
            <div className="flex items-start gap-3 px-5 py-4 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-100 dark:border-sky-500/20">
                <EyeOff size={16} className="text-sky-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-widest">
                        Semi-Anonymous View
                    </p>
                    <p className="text-xs text-sky-600 dark:text-sky-300/70 mt-0.5 leading-relaxed">
                        Attendee names are partially masked to protect privacy. Emails are shown in abbreviated form (e.g. j***@gmail.com). Only admins can see full identities.
                    </p>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-brand" size={32} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-5 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
                    <ShieldAlert size={16} className="text-rose-500" />
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                        Failed to load feedback responses
                    </p>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !error && grouped.length === 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <MessageSquare size={28} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        No feedback yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
                        Feedback emails are automatically sent to attendees when you archive an event. Responses will appear here.
                    </p>
                </div>
            )}

            {/* Event groups */}
            {!isLoading && grouped.map((group) => {
                const avg = calcAvgRating(group.responses);
                const isOpen = expanded.has(group.eventId);

                return (
                    <div
                        key={group.eventId}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300"
                    >
                        {/* Group header — click to expand */}
                        <button
                            onClick={() => toggleExpand(group.eventId)}
                            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                    {group.eventTitle}
                                </p>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                                    {group.responses.length} response{group.responses.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {avg !== null && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20">
                                        <Star size={12} className="text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                                            {avg}
                                        </span>
                                    </div>
                                )}
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                            </div>
                        </button>

                        {/* Responses table */}
                        {isOpen && (
                            <div className="border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CemsTable
                                    data={group.responses}
                                    columns={columns}
                                    emptyMessage="No responses for this event."
                                    enableSorting
                                    enableGlobalFilter
                                    onRowClick={(row) => setSelectedResponse(row)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

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
