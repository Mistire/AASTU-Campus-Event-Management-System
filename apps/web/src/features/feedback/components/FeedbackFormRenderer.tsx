"use client";

import { useState } from "react";
import { FeedbackQuestion, FeedbackAnswerPayload } from "../types";
import { StarRatingInput } from "./StarRatingInput";
import { NPSInput } from "./NPSInput";
import { CheckSquare } from "lucide-react";

interface FeedbackFormRendererProps {
    questions: FeedbackQuestion[];
    onSubmit: (answers: FeedbackAnswerPayload[]) => void;
    isSubmitting: boolean;
}

export function FeedbackFormRenderer({ questions, onSubmit, isSubmitting }: FeedbackFormRendererProps) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setValue = (questionId: string, val: string) => {
        setValues((prev) => ({ ...prev, [questionId]: val }));
        setErrors((prev) => ({ ...prev, [questionId]: "" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        for (const q of questions) {
            if (q.isRequired && !values[q.id]?.trim()) {
                newErrors[q.id] = "This question is required";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const answers: FeedbackAnswerPayload[] = questions
            .filter((q) => values[q.id] !== undefined && values[q.id] !== "")
            .map((q) => ({ questionId: q.id, value: values[q.id] }));

        onSubmit(answers);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, idx) => (
                <div
                    key={q.id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all duration-300"
                    style={{ animationDelay: `${idx * 60}ms` }}
                >
                    <div className="flex items-start gap-3">
                        <span className="min-w-[28px] h-7 rounded-lg bg-brand/10 dark:bg-brand/20 text-brand text-xs font-black flex items-center justify-center">
                            {idx + 1}
                        </span>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                            {q.label}
                            {q.isRequired && <span className="text-rose-400 ml-1">*</span>}
                        </p>
                    </div>

                    {/* RATING */}
                    {q.type === "RATING" && (
                        <div className="pl-10">
                            <StarRatingInput
                                value={parseInt(values[q.id] || "0")}
                                onChange={(val) => setValue(q.id, String(val))}
                                size={32}
                            />
                        </div>
                    )}

                    {/* SCALE (NPS) */}
                    {q.type === "SCALE" && (
                        <div className="pl-10">
                            <NPSInput
                                value={values[q.id] ? parseInt(values[q.id]) : null}
                                onChange={(val) => setValue(q.id, String(val))}
                            />
                        </div>
                    )}

                    {/* TEXT */}
                    {q.type === "TEXT" && (
                        <div className="pl-10">
                            <textarea
                                rows={4}
                                placeholder="Share your thoughts..."
                                value={values[q.id] || ""}
                                onChange={(e) => setValue(q.id, e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:border-brand dark:focus:border-brand transition-colors font-medium"
                            />
                        </div>
                    )}

                    {/* SHORT_TEXT */}
                    {q.type === "SHORT_TEXT" && (
                        <div className="pl-10">
                            <input
                                type="text"
                                placeholder="Your answer..."
                                value={values[q.id] || ""}
                                onChange={(e) => setValue(q.id, e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-brand dark:focus:border-brand transition-colors font-medium"
                            />
                        </div>
                    )}

                    {/* MULTIPLE_CHOICE */}
                    {q.type === "MULTIPLE_CHOICE" && q.options && (
                        <div className="pl-10 space-y-2">
                            {q.options.map((opt) => {
                                const isSelected = values[q.id] === opt;
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setValue(q.id, opt)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-semibold transition-all duration-150 ${
                                            isSelected
                                                ? "border-brand bg-brand/5 dark:bg-brand/10 text-brand"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand/40 hover:bg-brand/5 dark:hover:bg-brand/5"
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isSelected ? "border-brand bg-brand" : "border-gray-300 dark:border-gray-600"
                                        }`}>
                                            {isSelected && <CheckSquare size={12} className="text-white" />}
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {errors[q.id] && (
                        <p className="pl-10 text-xs font-black text-rose-500 uppercase tracking-widest">
                            {errors[q.id]}
                        </p>
                    )}
                </div>
            ))}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Feedback"
                )}
            </button>
        </form>
    );
}
