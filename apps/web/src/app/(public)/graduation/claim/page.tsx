"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap, CheckCircle, Mail, Send, Copy, Check,
  Loader2, AlertCircle, Star, Medal, Users, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CemsButton } from "@/components/cems/CemsButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TIER_CONFIG = {
  DISTINGUISHED: {
    label: "Distinguished Graduate",
    icon: Star,
    color: "from-amber-500 to-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-amber-300",
  },
  HONORS: {
    label: "Honors Graduate",
    icon: Medal,
    color: "from-violet-500 to-violet-800",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    border: "border-violet-300",
  },
  GRADUATE: {
    label: "Graduate",
    icon: GraduationCap,
    color: "from-sky-500 to-sky-800",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-sky-300",
  },
};

type DeliveryMode = "PER_PARENT" | "BUNDLE";
type PerParentMethod = "TELEGRAM" | "EMAIL";

interface PerParentEntry {
  parentLabel: string;
  deliveryMethod: PerParentMethod;
  telegramUsername: string;
  parentEmail: string;
}

interface BundleEntry {
  parentLabel: string;
}

interface ClaimStatus {
  studentName: string;
  studentEmail: string;
  tier: string;
  tierLabel: string;
  guestSlots: number;
  claimed: boolean;
  event: { title: string; startTime: string; venue?: { name: string; building?: string } | null };
}

interface TelegramLink {
  parentLabel: string;
  deepLink: string;
}

interface ClaimResult {
  telegramLinks: TelegramLink[];
  emailSent: string[];
  bulkEmailSent: string | null;
}

export default function GraduationClaimPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delivery mode
  const [mode, setMode] = useState<DeliveryMode>("PER_PARENT");

  // Per-parent mode state
  const [perParents, setPerParents] = useState<PerParentEntry[]>([]);

  // Bundle mode state
  const [bundleParents, setBundleParents] = useState<BundleEntry[]>([]);
  const [deliveryEmail, setDeliveryEmail] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing claim token. Please use the link from your email.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/graduation/claim/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.statusCode >= 400 || data.message?.toLowerCase().includes("invalid")) {
          setError(data.message || "Invalid or expired claim link.");
        } else {
          const payload: ClaimStatus = data.data ?? data;
          setStatus(payload);
          const slots = payload.guestSlots ?? 1;
          setPerParents(
            Array.from({ length: slots }, (_, i) => ({
              parentLabel: `Parent ${i + 1}`,
              deliveryMethod: "TELEGRAM",
              telegramUsername: "",
              parentEmail: "",
            }))
          );
          setBundleParents(
            Array.from({ length: slots }, (_, i) => ({ parentLabel: `Parent ${i + 1}` }))
          );
          setDeliveryEmail(payload.studentEmail ?? "");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  const updatePerParent = (i: number, field: keyof PerParentEntry, value: string) =>
    setPerParents((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));

  const updateBundleParent = (i: number, value: string) =>
    setBundleParents((prev) => prev.map((p, idx) => (idx === i ? { parentLabel: value } : p)));

  const handleSubmit = async () => {
    setError(null);

    // Validate
    if (mode === "PER_PARENT") {
      for (const p of perParents) {
        if (p.deliveryMethod === "TELEGRAM" && !p.telegramUsername.trim()) {
          setError(`Please enter a Telegram username for ${p.parentLabel}.`);
          return;
        }
        if (p.deliveryMethod === "EMAIL" && !p.parentEmail.trim()) {
          setError(`Please enter an email for ${p.parentLabel}.`);
          return;
        }
      }
    } else {
      for (const p of bundleParents) {
        if (!p.parentLabel.trim()) {
          setError("Please enter a name for each parent.");
          return;
        }
      }
      if (!deliveryEmail.trim()) {
        setError("Please enter the email address to receive all passes.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const parents =
        mode === "PER_PARENT"
          ? perParents.map((p) => ({
              parentLabel: p.parentLabel,
              deliveryMethod: p.deliveryMethod,
              telegramUsername: p.deliveryMethod === "TELEGRAM" ? p.telegramUsername.replace(/^@/, "") : undefined,
              parentEmail: p.deliveryMethod === "EMAIL" ? p.parentEmail : undefined,
            }))
          : bundleParents.map((p) => ({
              parentLabel: p.parentLabel,
              deliveryMethod: "STUDENT_EMAIL" as const,
            }));

      const body: any = { parents };
      if (mode === "BUNDLE") body.deliveryEmail = deliveryEmail;

      const res = await fetch(`${API_URL}/api/graduation/claim/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setResult(data.data ?? data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 2000);
  };

  const tier = status ? TIER_CONFIG[status.tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.GRADUATE : null;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  // ── Error ──
  if (error && !status) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Link Invalid</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // ── Already Claimed ──
  if (status?.claimed && !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Already Claimed</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have already submitted your parent guest information. If you need help, contact the event organizer.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">You&apos;re all set!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {result.bulkEmailSent
                ? `All guest passes have been bundled and sent to ${result.bulkEmailSent}.`
                : "Passes have been dispatched to your parents."}
            </p>
          </div>

          {/* Bulk email success card */}
          {result.bulkEmailSent && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-800 space-y-2">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Bundle Sent</p>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <Package size={14} className="text-emerald-500" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  All QR passes emailed to <strong>{result.bulkEmailSent}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Telegram links */}
          {result.telegramLinks.map((link) => (
            <div key={link.parentLabel} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-800 space-y-3">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{link.parentLabel} — Telegram</p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <Send size={16} className="text-sky-500 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{link.deepLink}</p>
                <button
                  onClick={() => copyLink(link.deepLink)}
                  className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-200 dark:hover:border-sky-500/20 transition-colors"
                >
                  {copied === link.deepLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400 dark:text-gray-500" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Copy this link and share it with {link.parentLabel}.</p>
            </div>
          ))}

          {/* Per-parent email sent */}
          {result.emailSent.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-800 space-y-2">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Delivery</p>
              {result.emailSent.map((email) => (
                <div key={email} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                  <Mail size={14} className="text-emerald-500" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">QR pass sent to <strong>{email}</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main Claim Form ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">

        {/* Header card */}
        <div className={`relative rounded-lg overflow-hidden bg-gradient-to-br ${tier?.color} p-8 text-white shadow-2xl`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1">AASTU — CEMS</p>
          <h1 className="text-3xl font-black tracking-tight">{status?.event.title}</h1>
          <p className="text-white/70 text-sm mt-1">
            {status && new Date(status.event.startTime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur rounded-lg border border-white/20">
            {tier && <tier.icon size={18} className="text-white" />}
            <span className="text-xs font-black uppercase tracking-widest">{tier?.label}</span>
          </div>
          <p className="mt-4 text-white/80 text-sm">
            Welcome, <strong>{status?.studentName}</strong>. You are eligible for <strong>{status?.guestSlots}</strong> parent guest pass{(status?.guestSlots ?? 1) > 1 ? "es" : ""}.
          </p>
        </div>

        {/* ── Delivery Mode Toggle ── */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-5 shadow border border-gray-100 dark:border-gray-800 space-y-4">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Choose How to Receive Passes</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="mode-per-parent"
              type="button"
              onClick={() => setMode("PER_PARENT")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left ${
                mode === "PER_PARENT"
                  ? "border-brand bg-brand/5 dark:bg-brand/10"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === "PER_PARENT" ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                <Users size={18} />
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest ${mode === "PER_PARENT" ? "text-brand" : "text-gray-600 dark:text-gray-300"}`}>Send to each parent</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">Each parent gets their own Telegram or email pass</p>
              </div>
            </button>

            <button
              id="mode-bundle"
              type="button"
              onClick={() => setMode("BUNDLE")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left ${
                mode === "BUNDLE"
                  ? "border-brand bg-brand/5 dark:bg-brand/10"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === "BUNDLE" ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                <Package size={18} />
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest ${mode === "BUNDLE" ? "text-brand" : "text-gray-600 dark:text-gray-300"}`}>Bundle all to my email</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">All passes sent together to your email as PDFs</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── PER-PARENT FORM ── */}
        {mode === "PER_PARENT" && perParents.map((parent, i) => (
          <div key={i} className={`bg-white dark:bg-gray-900 rounded-lg p-6 shadow border ${tier?.border ?? "border-gray-100 dark:border-gray-800"} space-y-4`}>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{parent.parentLabel}</p>

            {/* Delivery toggle */}
            <div className="flex gap-2">
              {(["TELEGRAM", "EMAIL"] as PerParentMethod[]).map((method) => (
                <CemsButton
                  key={method}
                  onClick={() => updatePerParent(i, "deliveryMethod", method)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    parent.deliveryMethod === method
                      ? "bg-brand text-white shadow"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {method === "TELEGRAM" ? "Telegram" : "Email"}
                </CemsButton>
              ))}
            </div>

            {parent.deliveryMethod === "TELEGRAM" ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 focus-within:border-sky-300 transition-colors">
                <span className="text-gray-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  placeholder="parent_telegram_username"
                  value={parent.telegramUsername}
                  onChange={(e) => updatePerParent(i, "telegramUsername", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder:text-gray-600 outline-none font-medium"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 focus-within:border-sky-300 transition-colors">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="parent@email.com"
                  value={parent.parentEmail}
                  onChange={(e) => updatePerParent(i, "parentEmail", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder:text-gray-600 outline-none font-medium"
                />
              </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              {parent.deliveryMethod === "TELEGRAM"
                ? "We'll generate a shareable link for you to forward. When your parent clicks it and starts the bot, they'll receive their QR pass instantly."
                : "The QR entry pass PDF will be sent directly to this email address."}
            </p>
          </div>
        ))}

        {/* ── BUNDLE FORM ── */}
        {mode === "BUNDLE" && (
          <div className={`bg-white dark:bg-gray-900 rounded-lg p-6 shadow border ${tier?.border ?? "border-gray-100 dark:border-gray-800"} space-y-5`}>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Parent Names</p>
              <div className="space-y-2">
                {bundleParents.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 focus-within:border-sky-300 transition-colors">
                    <Users size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder={`e.g. Abebe Bikila`}
                      value={p.parentLabel}
                      onChange={(e) => updateBundleParent(i, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder:text-gray-600 outline-none font-medium"
                    />
                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 shrink-0">Pass {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Delivery Email</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">All QR pass PDFs will be sent here. Defaults to your invitation email.</p>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 focus-within:border-sky-300 transition-colors">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <input
                  id="bundle-delivery-email"
                  type="email"
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder:text-gray-600 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-500/10 rounded-lg border border-sky-100 dark:border-sky-500/20">
              <Package size={14} className="text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-relaxed">
                All {bundleParents.length} QR pass PDFs will be sent as email attachments. You can then print or forward each one to the respective guest.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <CemsButton
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 rounded-lg bg-brand hover:bg-brand/80 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:-translate-y-0.5"
        >
          {submitting ? (
            <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
          ) : mode === "BUNDLE" ? (
            <><Package size={16} className="mr-2" /> Bundle &amp; Send to My Email</>
          ) : (
            <><GraduationCap size={16} className="mr-2" /> Submit &amp; Send Passes</>
          )}
        </CemsButton>

        <p className="text-center text-xs text-gray-400">
          This link is personal to you and can only be used once.
        </p>
      </div>
    </div>
  );
}
