"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap, Upload, Plus, RefreshCw, Check, X, Star, Medal,
  AlertCircle, Loader2, Send, Mail, ChevronDown, ChevronUp, FileText
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { CemsButton } from "@/components/cems/CemsButton";

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER = {
  DISTINGUISHED: { label: "Distinguished", icon: Star, bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-400" },
  HONORS:        { label: "Honors",        icon: Medal, bg: "bg-violet-50 dark:bg-violet-950/20", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", dot: "bg-violet-400" },
  GRADUATE:      { label: "Graduate",      icon: GraduationCap, bg: "bg-sky-50 dark:bg-sky-950/20",    text: "text-sky-700 dark:text-sky-400",    border: "border-sky-200 dark:border-sky-800",    dot: "bg-sky-400"    },
};

// ─── API Calls ────────────────────────────────────────────────────────────────

async function fetchStudents(eventId: string) {
  const res = await apiFetch(`/api/graduation/${eventId}/students`);
  const data = await res.json();
  return data.data ?? data;
}

// ─── Add Student Form ─────────────────────────────────────────────────────────

function AddStudentForm({ eventId, onSuccess }: { eventId: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ email: "", fullName: "", gpa: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.fullName || !form.gpa) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/graduation/${eventId}/add-student`, {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          gpa: parseFloat(form.gpa),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add student");
      }
      toast.success(`Invitation sent to ${form.email}`);
      setForm({ email: "", fullName: "", gpa: "" });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Add Student Manually</p>
      <div className="grid grid-cols-3 gap-2">
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm(s => ({ ...s, fullName: e.target.value }))}
          className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-brand/40" />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
          className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-brand/40" />
        <input placeholder="GPA" type="number" step="0.01" min="0" max="5" value={form.gpa} onChange={(e) => setForm(s => ({ ...s, gpa: e.target.value }))}
          className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-brand/40" />
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-2.5 rounded-lg bg-brand text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={12} className="animate-spin" /> Adding...</> : <><Plus size={12} /> Add & Send Email</>}
      </button>
    </div>
  );
}

// ─── CSV Upload ────────────────────────────────────────────────────────────────

function CsvUpload({ eventId, onSuccess }: { eventId: string; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiFetch(`/api/graduation/${eventId}/import-csv`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "CSV import failed");
      
      const payload = data.data ?? data;
      setResult(payload);
      toast.success(`Imported ${payload.imported} student(s)`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "CSV import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Import from CSV</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Required columns: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">email, fullName, gpa</code></p>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); setResult(null); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging ? "border-brand bg-brand/5 dark:bg-brand/10" : file ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-gray-800 hover:border-brand/30 hover:bg-white dark:hover:bg-gray-800"}`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <Check className="text-emerald-500" size={16} />
            <span className="text-xs font-black text-emerald-700">{file.name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
              className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500">
              <X size={10} />
            </button>
          </div>
        ) : (
          <>
            <FileText className="mx-auto text-gray-300 mb-1" size={20} />
            <p className="text-xs font-bold text-gray-400">Drop .csv file or click to browse</p>
          </>
        )}
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />
      </div>

      {result && (
        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 flex gap-4 text-xs">
          <span className="font-black text-emerald-600 dark:text-emerald-400">✓ {result.imported} imported</span>
          {result.skipped > 0 && <span className="font-black text-gray-400 dark:text-gray-500">↷ {result.skipped} skipped</span>}
          {result.errors.length > 0 && <span className="font-black text-red-500">✗ {result.errors.length} errors</span>}
        </div>
      )}

      {file && (
        <button onClick={handleUpload} disabled={uploading}
          className="w-full py-2.5 rounded-lg bg-brand text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
          {uploading ? <><Loader2 size={12} className="animate-spin" /> Importing...</> : <><Upload size={12} /> Import & Send Emails</>}
        </button>
      )}
    </div>
  );
}

// ─── Student Row ───────────────────────────────────────────────────────────────

function StudentRow({ student, eventId, onRefresh }: { student: any; eventId: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const tier = TIER[student.tier as keyof typeof TIER] ?? TIER.GRADUATE;

  const handleResend = async (guestPassId: string) => {
    setResending(guestPassId);
    try {
      const res = await apiFetch(`/api/graduation/guest-pass/${guestPassId}/resend`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend failed");
      
      const payload = data.data ?? data;
      if (payload.method === "TELEGRAM" && payload.deepLink) {
        await navigator.clipboard.writeText(payload.deepLink);
        toast.success("Deep link copied to clipboard!");
      } else {
        toast.success("QR email resent successfully");
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Resend failed");
    } finally {
      setResending(null);
    }
  };

  const deliveredCount = student.guestPasses?.filter((gp: any) => gp.delivered).length ?? 0;
  const totalPasses = student.guestPasses?.length ?? 0;

  return (
    <div className={`rounded-lg border ${tier.border} overflow-hidden`}>
      {/* Main Row */}
      <div className={`flex items-center gap-4 p-4 ${tier.bg} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
        {/* Tier badge */}
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${tier.text} ${tier.bg} border ${tier.border}`}>
          <tier.icon size={16} />
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{student.fullName}</p>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate">{student.email}</p>
        </div>

        {/* GPA */}
        <div className="text-center shrink-0">
          <p className="text-xs font-black text-gray-900 dark:text-white">{student.gpa.toFixed(2)}</p>
          <p className={`text-[9px] font-black uppercase ${tier.text}`}>{tier.label}</p>
        </div>

        {/* Claim status */}
        <div className="shrink-0 text-center">
          {student.claimed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-black">
              <Check size={9} /> Claimed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-[9px] font-black">
              Pending
            </span>
          )}
        </div>

        {/* QR delivery */}
        <div className="shrink-0 text-center">
          <p className="text-xs font-black text-gray-900 dark:text-white">{deliveredCount}/{student.guestSlots}</p>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500">QR Delivered</p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded guest passes */}
      {expanded && student.guestPasses?.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
          {student.guestPasses.map((gp: any) => (
            <div key={gp.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900">
              <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {gp.deliveryMethod === "TELEGRAM" ? <Send size={10} className="text-sky-500" /> : <Mail size={10} className="text-violet-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-700 dark:text-gray-300">{gp.parentLabel}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{gp.deliveryMethod}</p>
              </div>
              {gp.delivered ? (
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Check size={9} /> Delivered
                </span>
              ) : (
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg">Pending</span>
              )}
              <button
                onClick={() => handleResend(gp.id)}
                disabled={resending === gp.id}
                className="shrink-0 w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50"
                title={gp.deliveryMethod === "TELEGRAM" ? "Copy deep link" : "Resend email"}
              >
                {resending === gp.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {expanded && (!student.guestPasses || student.guestPasses.length === 0) && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">Student hasn&apos;t claimed their passes yet.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab Component ────────────────────────────────────────────────────────

export function GraduationGuestsTab({ eventId }: { eventId: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ["graduation-students", eventId],
    queryFn: () => fetchStudents(eventId),
  });

  const claimed = students.filter((s: any) => s.claimed).length;
  const totalPasses = students.reduce((sum: number, s: any) => sum + s.guestSlots, 0);
  const deliveredPasses = students.reduce((sum: number, s: any) =>
    sum + (s.guestPasses?.filter((gp: any) => gp.delivered).length ?? 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Students", value: students.length, color: "text-gray-900 dark:text-white" },
          { label: "Invitations Sent", value: students.length, color: "text-sky-600 dark:text-sky-400" },
          { label: "Passes Claimed", value: `${claimed}/${students.length}`, color: "text-violet-600 dark:text-violet-400" },
          { label: "QR Delivered", value: `${deliveredPasses}/${totalPasses}`, color: "text-emerald-600 dark:text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <CemsButton onClick={() => { setShowCsv(!showCsv); setShowAdd(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showCsv ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-brand/5 text-brand hover:bg-brand/10"}`}>
          <Upload size={12} /> CSV Import
        </CemsButton>
        <CemsButton onClick={() => { setShowAdd(!showAdd); setShowCsv(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showAdd ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-brand/5 text-brand hover:bg-brand/10"}`}>
          <Plus size={12} /> Add Student
        </CemsButton>
        <CemsButton onClick={() => refetch()}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
          <RefreshCw size={12} /> Refresh
        </CemsButton>
      </div>

      {showCsv && <CsvUpload eventId={eventId} onSuccess={() => refetch()} />}
      {showAdd && <AddStudentForm eventId={eventId} onSuccess={() => refetch()} />}

      {/* Student list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand" size={32} />
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center gap-3 text-center">
          <GraduationCap className="text-gray-200 dark:text-gray-800" size={40} />
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">No students imported yet</p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600">Use CSV Import or Add Student to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student: any) => (
            <StudentRow key={student.id} student={student} eventId={eventId} onRefresh={() => refetch()} />
          ))}
        </div>
      )}
    </div>
  );
}
