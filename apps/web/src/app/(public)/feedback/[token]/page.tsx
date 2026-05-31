"use client";

import { useState, useCallback, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFeedbackForm, useSubmitFeedback } from "@/features/feedback/api";
import { FeedbackFormRenderer } from "@/features/feedback/components/FeedbackFormRenderer";
import { DiscoveryNavbar } from "@/features/discovery/components/DiscoveryNavbar";
import { FeedbackAnswerPayload } from "@/features/feedback/types";
import {
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Calendar,
    MapPin,
    Loader2,
} from "lucide-react";
import { Suspense } from "react";

function FeedbackFormContent({ token }: { token: string }) {
    const [submitted, setSubmitted] = useState(false);

    const { data: formData, isLoading, error } = useFeedbackForm(token);
    const { mutateAsync: submitFeedback, isPending: isSubmitting } = useSubmitFeedback(token);

    const handleSubmit = useCallback(
        async (answers: FeedbackAnswerPayload[]) => {
            await submitFeedback(answers);
            setSubmitted(true);
        },
        [submitFeedback]
    );

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-brand" size={40} />
                <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Loading feedback form...
                </p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !formData) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="text-rose-500" size={32} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Link Invalid</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(error as Error)?.message || "This feedback link is invalid or has expired."}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Please check your email for the correct link. Feedback links expire after 14 days.
                    </p>
                </div>
            </div>
        );
    }

    // ── Already Submitted ─────────────────────────────────────────────────────
    if (formData.alreadySubmitted && !submitted) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto">
                        <CheckCircle className="text-amber-500" size={32} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">
                        Already Submitted
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You've already shared your feedback for{" "}
                        <strong className="text-gray-700 dark:text-gray-300">{formData.eventTitle}</strong>.
                        Thank you!
                    </p>
                </div>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="text-emerald-500" size={36} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Thank you, {formData.attendeeName}!
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Your feedback for{" "}
                            <strong className="text-gray-700 dark:text-gray-300">{formData.eventTitle}</strong>{" "}
                            has been received. It helps us make every future event better.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            Response recorded
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Event Header */}
            <div className="relative bg-brand rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-2">
                    AASTU — CEMS · Feedback
                </p>
                <h1 className="text-2xl font-black tracking-tight leading-tight">
                    {formData.eventTitle}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                    {formData.eventDate && (
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span className="font-semibold">
                                {new Date(formData.eventDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                    {formData.venueName && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span className="font-semibold">{formData.venueName}</span>
                        </div>
                    )}
                </div>
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur rounded-lg border border-white/20 text-xs font-black">
                    <MessageSquare size={12} />
                    Hi {formData.attendeeName} — share your experience
                </div>
            </div>

            {/* Instruction */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium leading-relaxed">
                Your responses are confidential. This takes less than 2 minutes.
            </p>

            {/* Form */}
            <FeedbackFormRenderer
                questions={formData.questions}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-8">
                This feedback link is personal to you and can only be used once.
            </p>
        </div>
    );
}

export default function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
            <DiscoveryNavbar />
            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                            <Loader2 className="animate-spin text-brand" size={40} />
                            <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Loading...
                            </p>
                        </div>
                    }
                >
                    <FeedbackFormContent token={token} />
                </Suspense>
            </div>
        </div>
    );
}
