"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, CheckCircle, Mail, Send, Copy, Check, Loader2, AlertCircle, Star, Medal } from "lucide-react";
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
    slots: 3,
  },
  HONORS: {
    label: "Honors Graduate",
    icon: Medal,
    color: "from-violet-500 to-violet-800",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    border: "border-violet-300",
    slots: 2,
  },
  GRADUATE: {
    label: "Graduate",
    icon: GraduationCap,
    color: "from-sky-500 to-sky-800",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-sky-300",
    slots: 1,
  },
};

type DeliveryMethod = "TELEGRAM" | "EMAIL";

interface ParentEntry {
  parentLabel: string;
  deliveryMethod: DeliveryMethod;
  telegramUsername: string;
  parentEmail: string;
}

interface ClaimStatus {
  studentName: string;
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

export default function GraduationClaimPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parents, setParents] = useState<ParentEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ telegramLinks: TelegramLink[]; emailSent: string[] } | null>(null);
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
          setStatus(data.data ?? data);
          // Pre-fill parent entries based on slot count
          const slots = (data.data ?? data).guestSlots ?? 1;
          setParents(
            Array.from({ length: slots }, (_, i) => ({
              parentLabel: `Parent ${i + 1}`,
              deliveryMethod: "TELEGRAM",
              telegramUsername: "",
              parentEmail: "",
            }))
          );
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  const updateParent = (i: number, field: keyof ParentEntry, value: string) => {
    setParents((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async () => {
    // Validate
    for (const p of parents) {
      if (p.deliveryMethod === "TELEGRAM" && !p.telegramUsername.trim()) {
        setError(`Please enter a Telegram username for ${p.parentLabel}.`);
        return;
      }
      if (p.deliveryMethod === "EMAIL" && !p.parentEmail.trim()) {
        setError(`Please enter an email for ${p.parentLabel}.`);
        return;
      }
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/graduation/claim/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parents: parents.map((p) => ({
            parentLabel: p.parentLabel,
            deliveryMethod: p.deliveryMethod,
            telegramUsername: p.deliveryMethod === "TELEGRAM" ? p.telegramUsername.replace(/^@/, "") : undefined,
            parentEmail: p.deliveryMethod === "EMAIL" ? p.parentEmail : undefined,
          })),
        }),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  // ── Error ──
  if (error && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg p-10 shadow-xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-black text-gray-900">Link Invalid</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // ── Already Claimed ──
  if (status?.claimed && !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg p-10 shadow-xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-xl font-black text-gray-900">Already Claimed</h1>
          <p className="text-sm text-gray-500">
            You have already submitted your parent guest information. If you need help, contact the event organizer.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="bg-white rounded-lg p-10 shadow-xl border border-gray-100 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">You&apos;re all set!</h1>
            <p className="text-sm text-gray-500">Share the links below with your parents so they can receive their entry QR codes.</p>
          </div>

          {result.telegramLinks.map((link) => (
            <div key={link.parentLabel} className="bg-white rounded-lg p-6 shadow border border-gray-100 space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{link.parentLabel} — Telegram</p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Send size={16} className="text-sky-500 shrink-0" />
                <p className="text-sm text-gray-700 truncate flex-1">{link.deepLink}</p>
                <button
                  onClick={() => copyLink(link.deepLink)}
                  className="shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-sky-50 hover:border-sky-200 transition-colors"
                >
                  {copied === link.deepLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">Copy this link and send it to {link.parentLabel} via WhatsApp or any messaging app.</p>
            </div>
          ))}

          {result.emailSent.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow border border-gray-100 space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Delivery</p>
              {result.emailSent.map((email) => (
                <div key={email} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <Mail size={14} className="text-emerald-500" />
                  <p className="text-sm text-emerald-700">QR pass sent to <strong>{email}</strong></p>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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

        {/* Parent entry cards */}
        {parents.map((parent, i) => (
          <div key={i} className={`bg-white rounded-lg p-6 shadow border ${tier?.border ?? "border-gray-100"} space-y-4`}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{parent.parentLabel}</p>

            {/* Delivery toggle */}
            <div className="flex gap-2">
              {(["TELEGRAM", "EMAIL"] as DeliveryMethod[]).map((method) => (
                <CemsButton
                  key={method}
                  onClick={() => updateParent(i, "deliveryMethod", method)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    parent.deliveryMethod === method
                      ? "bg-brand text-white shadow"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {method === "TELEGRAM" ? "Telegram" : "Email"}
                </CemsButton>
              ))}
            </div>

            {/* Input */}
            {parent.deliveryMethod === "TELEGRAM" ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-sky-300 transition-colors">
                <span className="text-gray-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  placeholder="parent_telegram_username"
                  value={parent.telegramUsername}
                  onChange={(e) => updateParent(i, "telegramUsername", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-300 outline-none font-medium"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-sky-300 transition-colors">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="parent@email.com"
                  value={parent.parentEmail}
                  onChange={(e) => updateParent(i, "parentEmail", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-300 outline-none font-medium"
                />
              </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              {parent.deliveryMethod === "TELEGRAM"
                ? "We'll generate a shareable link for you to send to your parent. When they click it and start the bot, they'll receive their QR pass instantly."
                : "The QR entry pass PDF will be sent directly to this email address."}
            </p>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
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
          ) : (
            <><GraduationCap size={16} className="mr-2" /> Submit &amp; Get Links</>
          )}
        </CemsButton>

        <p className="text-center text-xs text-gray-400">
          This link is personal to you and can only be used once.
        </p>
      </div>
    </div>
  );
}
