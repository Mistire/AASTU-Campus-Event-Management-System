"use client";

import { useState } from "react";
import {
    Plus, Trash2, GripVertical, ChevronDown,
    Star, BarChart2, AlignLeft, Type, List
} from "lucide-react";
import { FeedbackQuestion, FeedbackQuestionType } from "../types";

interface TemplateBuilderProps {
    initialName?: string;
    initialQuestions?: FeedbackQuestion[];
    onSave: (name: string, questions: Omit<FeedbackQuestion, "id">[]) => void;
    isSaving?: boolean;
    onCancel?: () => void;
}

const TYPE_OPTIONS: { value: FeedbackQuestionType; label: string; Icon: React.ElementType; color: string }[] = [
    { value: "RATING",          label: "Star Rating (1–5)",  Icon: Star,      color: "text-amber-500" },
    { value: "SCALE",           label: "NPS Scale (1–10)",   Icon: BarChart2, color: "text-violet-500" },
    { value: "TEXT",            label: "Long Text",           Icon: AlignLeft, color: "text-blue-500" },
    { value: "SHORT_TEXT",      label: "Short Text",          Icon: Type,      color: "text-teal-500" },
    { value: "MULTIPLE_CHOICE", label: "Multiple Choice",     Icon: List,      color: "text-orange-500" },
];

interface BuilderQuestion {
    id: string;
    label: string;
    type: FeedbackQuestionType;
    options: string[];
    isRequired: boolean;
}

const emptyQuestion = (): BuilderQuestion => ({
    id: crypto.randomUUID(),
    label: "",
    type: "RATING",
    options: ["Option A", "Option B", "Option C"],
    isRequired: true,
});

export function TemplateBuilder({
    initialName = "",
    initialQuestions = [],
    onSave,
    isSaving = false,
    onCancel,
}: TemplateBuilderProps) {
    const [name, setName] = useState(initialName);
    const [questions, setQuestions] = useState<BuilderQuestion[]>(
        initialQuestions.length > 0
            ? initialQuestions.map((q) => ({
                  id: q.id,
                  label: q.label,
                  type: q.type,
                  options: (q.options as string[]) ?? ["Option A", "Option B"],
                  isRequired: q.isRequired,
              }))
            : [emptyQuestion()]
    );
    const [nameError, setNameError] = useState("");

    const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

    const removeQuestion = (id: string) =>
        setQuestions((prev) => prev.filter((q) => q.id !== id));

    const updateQuestion = (id: string, field: keyof BuilderQuestion, value: any) =>
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );

    const updateOption = (qId: string, idx: number, val: string) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId
                    ? { ...q, options: q.options.map((o, i) => (i === idx ? val : o)) }
                    : q
            )
        );

    const addOption = (qId: string) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
            )
        );

    const removeOption = (qId: string, idx: number) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
            )
        );

    const handleSave = () => {
        if (!name.trim()) {
            setNameError("Template name is required");
            return;
        }
        const payload = questions.map((q, i) => ({
            label: q.label || `Question ${i + 1}`,
            type: q.type,
            options: q.type === "MULTIPLE_CHOICE" ? q.options : null,
            isRequired: q.isRequired,
            order: i,
        }));
        onSave(name.trim(), payload);
    };

    return (
        <div className="space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Template Name
                </label>
                <input
                    type="text"
                    placeholder="e.g. Standard Event Feedback"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(""); }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-brand transition-colors font-semibold"
                />
                {nameError && <p className="text-xs font-black text-rose-500">{nameError}</p>}
            </div>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Questions ({questions.length})
                    </p>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                    >
                        <Plus size={12} /> Add Question
                    </button>
                </div>

                {questions.map((q, idx) => (
                    <div
                        key={q.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                    >
                        {/* Question Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <GripVertical size={16} className="text-gray-300 dark:text-gray-600 cursor-grab" />
                            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Q{idx + 1}
                            </span>
                            <div className="flex-1" />
                            <label className="flex items-center gap-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={q.isRequired}
                                    onChange={(e) => updateQuestion(q.id, "isRequired", e.target.checked)}
                                    className="accent-brand"
                                />
                                Required
                            </label>
                            <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                disabled={questions.length === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 text-gray-400 dark:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Label */}
                            <input
                                type="text"
                                placeholder="Question label..."
                                value={q.label}
                                onChange={(e) => updateQuestion(q.id, "label", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-brand transition-colors font-medium"
                            />

                            {/* Type selector — custom button grid instead of <select> to support icons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {TYPE_OPTIONS.map(({ value, label, Icon, color }) => {
                                    const isSelected = q.type === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => updateQuestion(q.id, "type", value)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left text-xs font-bold transition-all duration-150 ${
                                                isSelected
                                                    ? "border-brand bg-brand/5 dark:bg-brand/10 text-gray-900 dark:text-white"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <Icon size={14} className={isSelected ? "text-brand" : color} />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Options for multiple choice */}
                            {q.type === "MULTIPLE_CHOICE" && (
                                <div className="space-y-2 pl-2 border-l-2 border-brand/20">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        Choices
                                    </p>
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-brand transition-colors font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(q.id, oi)}
                                                disabled={q.options.length <= 2}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(q.id)}
                                        className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        <Plus size={10} /> Add choice
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-xs hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 h-12 rounded-xl bg-brand hover:bg-brand/90 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : "Save Template"}
                </button>
            </div>
        </div>
    );
}
