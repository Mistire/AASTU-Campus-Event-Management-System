"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode,
  ShieldCheck,
  History,
  UserCheck,
  Flashlight,
  FlashlightOff,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckIn } from "../../api/mutations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendeeScannerProps {
  eventId: string;
  onClose: () => void;
}

export function AttendeeScanner({ eventId, onClose }: AttendeeScannerProps) {
  const scannerRef = useRef<any>(null);
  const [lastScan, setLastScan] = useState<{ status: "success" | "warning" | "error" | "loading"; message: string } | null>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const { mutate: checkIn, isPending } = useCheckIn();

  // Cooldown tracking for scanning the same code multiple times rapidly
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      setIsSecure(window.isSecureContext || isLocal);
    }
  }, []);

  useEffect(() => {
    // Load script dynamically from CDN to avoid build-time dependency issues in Docker
    if ((window as any).Html5Qrcode) {
      setIsLibraryLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    script.onload = () => setIsLibraryLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Keep the script cached for instant reuse on subsequent mounts
    };
  }, []);

  const stateRef = useRef({ isPending, lastScanStatus: lastScan?.status });
  useEffect(() => {
    stateRef.current = { isPending, lastScanStatus: lastScan?.status };
  }, [isPending, lastScan?.status]);

  const handleScan = (decodedText: string) => {
    const { isPending: pending, lastScanStatus } = stateRef.current;
    if (pending || lastScanStatus === "loading") return;

    // Cooldown check: Avoid scanning the same code again within 4 seconds
    const now = Date.now();
    if (decodedText === lastScannedCodeRef.current && now - lastScanTimestampRef.current < 4000) {
      return;
    }

    lastScannedCodeRef.current = decodedText;
    lastScanTimestampRef.current = now;

    setLastScan({ status: "loading", message: "Verifying ticket..." });
    
    checkIn(
      { eventId, ticketToken: decodedText },
      {
        onSuccess: (data) => {
          if (data.alreadyCheckedIn) {
            setLastScan({ 
              status: "warning", 
              message: data.message || "Attendee was already checked in" 
            });
            toast.warning("Already checked in");
          } else {
            setLastScan({ 
              status: "success", 
              message: data.message || "Attendee successfully checked in!" 
            });
            toast.success("Check-in successful");
          }
          // Fast-clear on success/warning for rapid scanning throughput (1.5 seconds)
          setTimeout(() => setLastScan(null), 1500);
        },
        onError: (error: any) => {
          setLastScan({ 
            status: "error", 
            message: error.message || "Invalid or already used ticket" 
          });
          toast.error(error.message || "Failed to check in");
          // Clear cooldown lock on error so organizer can retry immediately if there was a temporary failure
          lastScannedCodeRef.current = null;
          // Clear error display after 2.5 seconds (down from 5 seconds)
          setTimeout(() => setLastScan(null), 2500);
        }
      }
    );
  };

  const toggleTorch = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const next = !torchOn;
      await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch {
      toast.error("Torch not supported on this device");
    }
  }, [torchOn]);

  const restartScanner = useCallback(() => {
    setRemountKey((k) => k + 1);
    setLastScan(null);
  }, []);

  useEffect(() => {
    if (!isLibraryLoaded || !isSecure) return;

    const Html5Qrcode = (window as any).Html5Qrcode;
    const Html5QrcodeSupportedFormats = (window as any).Html5QrcodeSupportedFormats;
    if (!Html5Qrcode) return;
    
    if (scannerRef.current) return; // Prevent double init

    // Optimize: Constrain scanner to QR code formats only to disable standard barcode matching.
    // This reduces CPU utilization and speeds up QR code alignment and decoding dramatically.
    const html5QrCode = new Html5Qrcode("reader", {
      formatsToSupport: Html5QrcodeSupportedFormats ? [Html5QrcodeSupportedFormats.QR_CODE] : []
    });
    scannerRef.current = html5QrCode;

    Html5Qrcode.getCameras()
      .then((devices: any[]) => {
        const cameraConstraint = devices?.length > 0
          ? (() => {
              const backCamera = devices.find((d) => {
                const label = d.label.toLowerCase();
                return label.includes("back") || label.includes("rear") || label.includes("environment");
              });
              return backCamera ? backCamera.id : devices[0].id;
            })()
          : { facingMode: "environment" };

        return html5QrCode.start(
          cameraConstraint,
          {
            fps: 30,                       // Up from 15 — catches movement much better
            qrbox: (width: number, height: number) => {
              const minEdge = Math.min(width, height);
              const size = Math.floor(minEdge * 0.65); // Smaller box = faster lock-on
              return { width: size, height: size };
            },
            aspectRatio: 1.0,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true, // Native BarcodeDetector API — 2-3x faster on Chrome/Android
            },
            rememberLastUsedCamera: true,
            supportedScanTypes: [],        // All types
          },
          handleScan,
          () => {}                         // Suppress per-frame errors
        );
      })
      .then(() => {
        // Camera started — nothing to do
      })
      .catch((err: any) => {
        console.error("Camera failed to start:", err);
        toast.error("Failed to access camera. Please check permissions.");
      });

    return () => {
      const scannerInstance = scannerRef.current;
      if (scannerInstance) {
        scannerRef.current = null;
        if (scannerInstance.isScanning) {
          scannerInstance.stop().then(() => {
            scannerInstance.clear().catch(() => {});
          }).catch(() => {
            try { scannerInstance.clear().catch(() => {}); } catch (e) {}
          });
        } else {
          try { scannerInstance.clear().catch(() => {}); } catch (e) {}
        }
      }
    };
  }, [isLibraryLoaded, isSecure, remountKey]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-2 sm:pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Camera className="text-brand w-4 sm:w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                QR Scanner
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
                AASTU Check-in System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Torch toggle */}
            {isSecure && isLibraryLoaded && (
              <button
                onClick={toggleTorch}
                title={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                  torchOn
                    ? "bg-amber-100 text-amber-500 hover:bg-amber-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {torchOn ? <Flashlight size={16} /> : <FlashlightOff size={16} />}
              </button>
            )}
            {/* Restart scanner */}
            {isSecure && isLibraryLoaded && (
              <button
                onClick={restartScanner}
                title="Restart camera"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
              >
                <RefreshCw size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scanner Window */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900 shadow-inner group">
             <div key={remountKey} id="reader" className="w-full h-full border-none" />

             {!isSecure && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center gap-4 z-30">
                 <AlertCircle className="text-rose-500" size={48} />
                 <div>
                   <h3 className="text-white font-black text-sm uppercase tracking-widest">Insecure Context</h3>
                   <p className="text-gray-400 text-xs font-bold mt-2 leading-relaxed max-w-xs mx-auto">
                     Camera access is restricted in HTTP. Please access this page over HTTPS or localhost to use the scanner.
                   </p>
                 </div>
               </div>
             )}
             
             {isSecure && !isLibraryLoaded && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
                 <Loader2 className="animate-spin text-brand" size={32} />
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Initializing Scanner...</span>
               </div>
             )}

             {/* Scan Overlay UI */}
             {isSecure && (
                <div className="absolute inset-0 pointer-events-none border-[30px] sm:border-[40px] border-black/20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 border-2 border-brand/50 rounded-lg" />
                  <motion.div 
                    animate={{ scaleX: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand shadow-[0_0_15px_rgba(255,51,102,0.5)] z-10" 
                  />
                </div>
             )}

             {/* Real-time Status Overlay */}
             <AnimatePresence mode="wait">
               {lastScan && (
                 <motion.div
                   key={lastScan.status}
                   initial={{ opacity: 0, y: 50, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 50, scale: 0.95 }}
                   onClick={() => setLastScan(null)} // Instantly dismiss on click
                   className={cn(
                     "absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md cursor-pointer transition-all duration-300 active:scale-95 hover:brightness-110",
                     lastScan.status === "success" ? "bg-emerald-500/95 border-emerald-400/30 text-white" : 
                     lastScan.status === "warning" ? "bg-amber-500/95 border-amber-400/30 text-white" :
                     lastScan.status === "error" ? "bg-rose-500/95 border-rose-400/30 text-white" : 
                     "bg-brand/95 border-brand/80 text-white"
                   )}
                 >
                   {lastScan.status === "loading" && <Loader2 className="text-white animate-spin shrink-0" size={24} />}
                   {lastScan.status === "success" && <CheckCircle2 className="text-white shrink-0" size={24} />}
                   {lastScan.status === "warning" && <UserCheck className="text-white shrink-0" size={24} />}
                   {lastScan.status === "error" && <AlertCircle className="text-white shrink-0" size={24} />}
                   
                   <div className="flex-1 text-left min-w-0">
                     <h3 className="font-black text-sm uppercase tracking-wider leading-none">
                       {lastScan.status === "success" ? "Access Granted" : 
                        lastScan.status === "warning" ? "Already Checked In" :
                        lastScan.status === "error" ? "Access Denied" : "Verifying..."}
                     </h3>
                     <p className="text-[11px] font-medium opacity-90 truncate mt-1">
                       {lastScan.message}
                     </p>
                   </div>
                   
                   {lastScan.status !== "loading" && (
                     <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded text-white shrink-0">
                       Dismiss
                     </span>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 w-full">
            <div className="flex flex-col items-center gap-1.5">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <QrCode size={18} />
               </div>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Auto Scan</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 border-x border-gray-100 dark:border-gray-800">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <ShieldCheck size={18} />
               </div>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Secure JWT</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <History size={18} />
               </div>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Live Logs</span>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-4 sm:p-8 pt-0 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Position the QR code within the focus frame to automatically check-in the attendee
          </p>
        </div>
      </motion.div>
    </div>
  );
}
