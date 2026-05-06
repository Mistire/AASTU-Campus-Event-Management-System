"use client";

import { useState, useRef, useCallback } from "react";
import {
  GraduationCap, Upload, Plus, Trash2, Info, Check, Star, Medal,
  AlertCircle, Loader2, Users, FileText, X
} from "lucide-react";
import { EventFormData } from "../EventCreateWizard";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

// ─── Tier Utility ─────────────────────────────────────────────────────────────

function getTier(gpa: number) {
  if (gpa >= 3.75) return { tier: "DISTINGUISHED", label: "Distinguished", icon: Star, slots: 3, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  if (gpa >= 3.5)  return { tier: "HONORS", label: "Honors", icon: Medal, slots: 2, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" };
  return                  { tier: "GRADUATE", label: "Graduate", icon: GraduationCap, slots: 1, bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" };
}

interface StudentRow {
  email: string;
  fullName: string;
  gpa: string;
}

interface GraduationSetupSectionProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
  eventId?: string;
}

export function GraduationSetupSection({ data, onUpdate, eventId }: GraduationSetupSectionProps) {
  const token = useAuthStore((s) => s.token);
  const [manualRows, setManualRows] = useState<StudentRow[]>([{ email: "", fullName: "", gpa: "" }]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [addingManual, setAddingManual] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"csv" | "manual">("csv");

  const addRow = () => setManualRows((r) => [...r, { email: "", fullName: "", gpa: "" }]);
  const removeRow = (i: number) => setManualRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof StudentRow, value: string) =>
    setManualRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  // ── CSV Upload ──────────────────────────────────────────────────────────────

  const handleCsvFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setCsvFile(file);
    setUploadResult(null);
  };

  const handleCsvUpload = async () => {
    if (!csvFile || !eventId) {
      if (!eventId) toast.error("Please save the event first before importing students");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await apiFetch(`/graduation/${eventId}/import-csv`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "CSV upload failed");

      const result = data.data ?? data;
      setUploadResult(result);
      toast.success(`Imported ${result.imported} student(s)`);
    } catch (err: any) {
      toast.error(err.message || "CSV upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Manual Entry ────────────────────────────────────────────────────────────

  const handleManualAdd = async () => {
    const validRows = manualRows.filter((r) => r.email && r.fullName && r.gpa);
    if (!eventId) {
      toast.error("Please save the event first before adding students");
      return;
    }
    if (validRows.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    setAddingManual(true);
    let successCount = 0;
    for (const row of validRows) {
      try {
        const res = await apiFetch(`/graduation/${eventId}/add-student`, {
          method: "POST",
          body: JSON.stringify({
            email: row.email,
            fullName: row.fullName,
            gpa: parseFloat(row.gpa),
          }),
        });
        if (res.ok) successCount++;
      } catch {
        // continue
      }
    }
    toast.success(`${successCount} student(s) added successfully`);
    setManualRows([{ email: "", fullName: "", gpa: "" }]);
    setAddingManual(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-8 bg-brand/5 rounded-xl border border-brand/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center border-4 border-white shadow-lg shadow-brand/20">
            <GraduationCap className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Graduation Ceremony</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Import graduating students to send invitations</p>
          </div>
        </div>

        {/* GPA Tier Legend */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: "Graduate", icon: GraduationCap, gpa: "< 3.5", slots: "1 guest", bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-700" },
            { tier: "Honors", icon: Medal, gpa: "3.5 – 3.75", slots: "2 guests", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700" },
            { tier: "Distinguished", icon: Star, gpa: "3.75 – 5.0", slots: "3 guests", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700" },
          ].map((t) => (
            <div key={t.tier} className={`p-3 rounded-xl border ${t.bg} ${t.border} text-center flex flex-col items-center justify-center`}>
              <t.icon size={18} className={`${t.text} mb-1`} />
              <p className={`text-[9px] font-black uppercase tracking-widest ${t.text}`}>{t.tier}</p>
              <p className="text-[9px] font-bold text-gray-400 mt-0.5">GPA {t.gpa}</p>
              <p className={`text-[9px] font-black mt-1 ${t.text}`}>{t.slots}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["csv", "manual"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                activeTab === tab ? "bg-gray-900 text-white shadow" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              {tab === "csv" ? <><FileText size={12} /> CSV Upload</> : <><Plus size={12} /> Manual Entry</>}
            </button>
          ))}
        </div>

        {/* ── CSV Tab ── */}
        {activeTab === "csv" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCsvFile(f); }}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? "border-brand bg-brand/5 scale-[1.01]" : csvFile ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-brand/40 hover:bg-white"
              }`}
            >
              {csvFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Check className="text-emerald-500" size={20} />
                  <p className="text-sm font-black text-emerald-700">{csvFile.name}</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setCsvFile(null); setUploadResult(null); }}
                    className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 ml-2">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Drop CSV or click to browse</p>
                  <p className="text-[10px] text-gray-300 mt-1">Columns: email, fullName, gpa</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }} />
            </div>

            {/* Upload result */}
            {uploadResult && (
              <div className="p-4 bg-white rounded-xl border border-gray-100 space-y-1">
                <div className="flex gap-4 text-xs">
                  <span className="font-black text-emerald-600">✓ {uploadResult.imported} imported</span>
                  {uploadResult.skipped > 0 && <span className="font-black text-gray-400">↷ {uploadResult.skipped} skipped</span>}
                  {uploadResult.errors.length > 0 && <span className="font-black text-red-500">✗ {uploadResult.errors.length} errors</span>}
                </div>
                {uploadResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {uploadResult.errors.map((e, i) => (
                      <p key={i} className="text-[10px] text-red-500 font-mono">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {csvFile && (
              <button
                type="button"
                onClick={handleCsvUpload}
                disabled={uploading || !eventId}
                className="w-full py-3 rounded-xl bg-brand text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 size={12} className="animate-spin" /> Importing...</> : <><Upload size={12} /> Import Students & Send Emails</>}
              </button>
            )}

            {!eventId && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Info size={14} className="text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-600">Save the event first to enable student import.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Manual Tab ── */}
        {activeTab === "manual" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {manualRows.map((row, i) => {
                const gpa = parseFloat(row.gpa);
                const tier = !isNaN(gpa) && gpa > 0 ? getTier(gpa) : null;
                return (
                  <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Student {i + 1}</p>
                      <div className="flex items-center gap-2">
                        {tier && (
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${tier.bg} ${tier.text} ${tier.border} flex items-center gap-1.5`}>
                            <tier.icon size={10} /> {tier.label} · {tier.slots} guest{tier.slots > 1 ? "s" : ""}
                          </span>
                        )}
                        {manualRows.length > 1 && (
                          <button type="button" onClick={() => removeRow(i)} className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:text-red-600">
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input placeholder="Full Name" value={row.fullName} onChange={(e) => updateRow(i, "fullName", e.target.value)}
                        className="col-span-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-900 placeholder-gray-300 outline-none focus:border-brand/40" />
                      <input placeholder="email@aastu.edu.et" value={row.email} onChange={(e) => updateRow(i, "email", e.target.value)}
                        className="col-span-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-900 placeholder-gray-300 outline-none focus:border-brand/40" />
                      <input placeholder="GPA (0–5)" type="number" step="0.01" min="0" max="5" value={row.gpa} onChange={(e) => updateRow(i, "gpa", e.target.value)}
                        className="col-span-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-900 placeholder-gray-300 outline-none focus:border-brand/40" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={addRow}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-gray-200 text-[10px] font-black text-gray-400 hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all flex items-center justify-center gap-2">
                <Plus size={12} /> Add Row
              </button>
              <button type="button" onClick={handleManualAdd} disabled={addingManual || !eventId}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                {addingManual ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Users size={12} /> Add & Send Emails</>}
              </button>
            </div>

            {!eventId && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Info size={14} className="text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-600">Save the event first to enable student import.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
