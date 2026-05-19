"use client";

import { useState } from "react";
import {
    LayoutTemplate, Plus, Pencil, Trash2, Link2, CheckCircle,
    Star, Scale, AlignLeft, Type, List, Loader2, AlertCircle, X
} from "lucide-react";
import {
    useFeedbackTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
} from "@/features/feedback/api";
import { TemplateBuilder } from "@/features/feedback/components/TemplateBuilder";
import { FeedbackTemplate } from "@/features/feedback/types";

const TYPE_ICON: Record<string, React.ReactNode> = {
    RATING: <Star size={11} className="text-amber-500" />,
    SCALE: <Scale size={11} className="text-violet-500" />,
    TEXT: <AlignLeft size={11} className="text-blue-500" />,
    SHORT_TEXT: <Type size={11} className="text-teal-500" />,
    MULTIPLE_CHOICE: <List size={11} className="text-orange-500" />,
};

export default function FeedbackTemplatesPage() {
    const { data: templates = [], isLoading } = useFeedbackTemplates();
    const { mutateAsync: createTemplate, isPending: isCreating } = useCreateTemplate();
    const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
    const { mutateAsync: deleteTemplate } = useDeleteTemplate();

    const [mode, setMode] = useState<"list" | "create" | "edit">("list");
    const [editing, setEditing] = useState<FeedbackTemplate | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = async (name: string, questions: any[]) => {
        await createTemplate({ name, questions });
        setMode("list");
        showToast("Template created successfully");
    };

    const handleUpdate = async (name: string, questions: any[]) => {
        if (!editing) return;
        await updateTemplate({ id: editing.id, payload: { name, questions } });
        setMode("list");
        setEditing(null);
        showToast("Template updated successfully");
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteTemplate(id);
            showToast("Template deleted");
        } finally {
            setDeletingId(null);
        }
    };

    // ── Builder mode ──────────────────────────────────────────────────────────
    if (mode === "create" || mode === "edit") {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20">
                        <LayoutTemplate size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                            {mode === "create" ? "Create Template" : "Edit Template"}
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
                            Build a custom feedback form for your events
                        </p>
                    </div>
                    <button
                        onClick={() => { setMode("list"); setEditing(null); }}
                        className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                    <TemplateBuilder
                        initialName={editing?.name}
                        initialQuestions={editing?.questions}
                        onSave={mode === "create" ? handleCreate : handleUpdate}
                        isSaving={isCreating || isUpdating}
                        onCancel={() => { setMode("list"); setEditing(null); }}
                    />
                </div>
            </div>
        );
    }

    // ── List mode ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-sm font-black text-gray-800 dark:text-white">{toast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm">
                        <LayoutTemplate size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                            Feedback Templates
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            {templates.length} template{templates.length !== 1 ? "s" : ""} created
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setMode("create")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                    <Plus size={14} /> New Template
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-brand" size={32} />
                </div>
            )}

            {/* Empty */}
            {!isLoading && templates.length === 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <LayoutTemplate size={28} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        No templates yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                        Create a custom feedback form template to use across your events. If no template is attached, the default form will be used.
                    </p>
                    <button
                        onClick={() => setMode("create")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                    >
                        <Plus size={12} /> Create your first template
                    </button>
                </div>
            )}

            {/* Template cards grid */}
            {!isLoading && templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((tpl) => (
                        <div
                            key={tpl.id}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand/20 dark:hover:border-brand/20 transition-all duration-200 overflow-hidden group"
                        >
                            {/* Card header */}
                            <div className="p-5 border-b border-gray-50 dark:border-gray-800 space-y-1">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight group-hover:text-brand transition-colors">
                                        {tpl.name}
                                    </p>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => { setEditing(tpl); setMode("edit"); }}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand/10 dark:hover:bg-brand/10 text-gray-400 hover:text-brand dark:hover:text-brand transition-colors"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tpl.id)}
                                            disabled={deletingId === tpl.id}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-40"
                                        >
                                            {deletingId === tpl.id
                                                ? <Loader2 size={13} className="animate-spin" />
                                                : <Trash2 size={13} />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {tpl.questions.length} question{tpl.questions.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* Questions preview */}
                            <div className="p-5 space-y-2">
                                {tpl.questions.slice(0, 4).map((q) => (
                                    <div key={q.id} className="flex items-center gap-2">
                                        <span>{TYPE_ICON[q.type]}</span>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                            {q.label}
                                        </span>
                                        {q.isRequired && (
                                            <span className="ml-auto text-[9px] font-black text-rose-400 uppercase tracking-widest shrink-0">
                                                req
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {tpl.questions.length > 4 && (
                                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest pl-5">
                                        + {tpl.questions.length - 4} more
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 pb-5">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <Link2 size={10} />
                                    <span>Attach to events from the Events page</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
