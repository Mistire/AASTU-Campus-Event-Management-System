"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  X,
  Laptop,
  Smartphone,
  Check,
  Share,
  Plus,
  MoreVertical,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

type Platform = "android" | "ios" | "desktop" | "unknown";

// ── Utils ─────────────────────────────────────────────────────────────────────
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (!isMobile) return "desktop";
  return "unknown";
}

function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

// ── iOS Install Instructions ──────────────────────────────────────────────────
function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pb-8 sm:bottom-6 sm:left-auto sm:right-6 sm:p-0 sm:w-[380px]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

        <div className="p-5">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* App icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
                <span className="text-xl font-black text-white">C</span>
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-white">Install CEMS</h3>
                <p className="text-xs text-slate-400">Add to your Home Screen</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              How to install on iOS
            </p>

            {[
              {
                Icon: Share,
                color: "bg-blue-500/10 text-blue-400",
                text: (
                  <>
                    Tap the <span className="font-black text-white">Share</span> button at the
                    bottom of Safari
                  </>
                ),
              },
              {
                Icon: Plus,
                color: "bg-emerald-500/10 text-emerald-400",
                text: (
                  <>
                    Scroll down and tap{" "}
                    <span className="font-black text-white">"Add to Home Screen"</span>
                  </>
                ),
              },
              {
                Icon: Check,
                color: "bg-sky-500/10 text-sky-400",
                text: (
                  <>
                    Tap <span className="font-black text-white">Add</span> — CEMS will appear
                    on your home screen!
                  </>
                ),
              },
            ].map(({ Icon, color, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Fast & secure", "No app store", "Fast & native"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400"
              >
                <Check className="h-2.5 w-2.5 text-emerald-400" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Arrow pointing to Share button */}
      <div className="mx-auto mt-2 h-3 w-3 rotate-180 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900/95 sm:hidden" />
    </motion.div>
  );
}

// ── Desktop / Android Prompt ──────────────────────────────────────────────────
function NativeInstallPrompt({
  platform,
  onInstall,
  onDismiss,
}: {
  platform: Platform;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="fixed bottom-6 right-6 z-[9999] w-[calc(100vw-3rem)] max-w-[380px]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
              <span className="text-2xl font-black text-white">C</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black tracking-tight text-white">Install CEMS App</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                Get faster access, instant updates, and a native-like experience.
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="shrink-0 rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Platform badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { Icon: platform === "desktop" ? Laptop : Smartphone, label: platform === "desktop" ? "Desktop App" : "Mobile App" },
              { Icon: Check, label: "Instant access" },
              { Icon: Check, label: "No app store" },
            ].map(({ Icon, label }, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400"
              >
                <Icon className="h-3 w-3 text-sky-400" />
                {label}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={onDismiss}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              Maybe Later
            </button>
            <button
              onClick={onInstall}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/30 active:scale-95"
            >
              <Download className="mr-1.5 inline h-3.5 w-3.5" />
              Install Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Success Toast ─────────────────────────────────────────────────────────────
function InstalledToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        <Check className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-black text-white">CEMS Installed!</p>
        <p className="text-[10px] text-slate-400">Launch from your home screen or app drawer.</p>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Register SW + listen for install events
  useEffect(() => {
    // Already running as installed PWA – nothing to do
    if (isRunningStandalone()) {
      setIsInstalled(true);
      return;
    }

    const detected = detectPlatform();
    setPlatform(detected);

    // ── Register service worker ──
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[CEMS PWA] Service worker registered →", reg.scope);
        })
        .catch((err) => console.error("[CEMS PWA] SW registration failed:", err));
    }

    // ── iOS: no beforeinstallprompt, show manual guide after 4s ──
    if (detected === "ios") {
      const dismissed = localStorage.getItem("cems-pwa-dismissed");
      if (dismissed) return;
      const t = setTimeout(() => setShowIOSGuide(true), 4000);
      return () => clearTimeout(t);
    }

    // ── Android / Desktop: intercept beforeinstallprompt ──
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("cems-pwa-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setShowPrompt(false);
      localStorage.setItem("cems-pwa-dismissed", "true");
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem("cems-pwa-dismissed", "true");
  }, []);

  // Already installed → nothing to render (unless just-installed toast)
  if (isInstalled && !justInstalled) return null;

  return (
    <AnimatePresence mode="wait">
      {justInstalled && <InstalledToast key="installed" />}

      {showPrompt && !justInstalled && deferredPrompt && (
        <NativeInstallPrompt
          key="native"
          platform={platform}
          onInstall={handleInstall}
          onDismiss={handleDismiss}
        />
      )}

      {showIOSGuide && !justInstalled && platform === "ios" && (
        <IOSInstructions key="ios" onClose={handleDismiss} />
      )}
    </AnimatePresence>
  );
}
