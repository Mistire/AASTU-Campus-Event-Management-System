"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode,
  ShieldCheck,
  History,
  UserCheck
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
  const { mutate: checkIn, isPending } = useCheckIn();

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
          setTimeout(() => setLastScan(null), 3000);
        },
        onError: (error: any) => {
          setLastScan({ 
            status: "error", 
            message: error.message || "Invalid or already used ticket" 
          });
          toast.error(error.message || "Failed to check in");
          setTimeout(() => setLastScan(null), 5000);
        }
      }
    );
  };

  useEffect(() => {
    if (!isLibraryLoaded || !isSecure) return;

    const Html5Qrcode = (window as any).Html5Qrcode;
    if (!Html5Qrcode) return;
    
    if (scannerRef.current) return; // Prevent double init

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    let isCameraActive = false;

    Html5Qrcode.getCameras()
      .then((devices: any[]) => {
        if (devices && devices.length > 0) {
          // Look for a back/rear camera
          const backCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return label.includes("back") || label.includes("rear") || label.includes("environment");
          });
          const cameraId = backCamera ? backCamera.id : devices[0].id;
          
          return html5QrCode.start(
            cameraId,
            {
              fps: 15,
              qrbox: (width: number, height: number) => {
                const minEdge = Math.min(width, height);
                const size = Math.floor(minEdge * 0.7);
                return { width: size, height: size };
              },
              aspectRatio: 1.0,
            },
            handleScan,
            (err: any) => {}
          );
        } else {
          return html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: (width: number, height: number) => {
                const minEdge = Math.min(width, height);
                const size = Math.floor(minEdge * 0.7);
                return { width: size, height: size };
              },
              aspectRatio: 1.0,
            },
            handleScan,
            (err: any) => {}
          );
        }
      })
      .then(() => {
        isCameraActive = true;
      })
      .catch((err: any) => {
        console.error("Camera failed to start:", err);
        toast.error("Failed to access camera. Please check permissions.");
      });

    return () => {
      const scannerInstance = scannerRef.current;
      if (scannerInstance) {
        // Nullify the global ref immediately to prevent any concurrent triggers
        scannerRef.current = null;
        
        if (scannerInstance.isScanning) {
          // Stop the camera feed safely on unmount before clearing
          scannerInstance.stop().then(() => {
            scannerInstance.clear().catch((err: any) => {});
          }).catch((err: any) => {
            console.error("Failed to stop scanner cleanly:", err);
            try { scannerInstance.clear().catch((err: any) => {}); } catch (e) {}
          });
        } else {
          try { scannerInstance.clear().catch((err: any) => {}); } catch (e) {}
        }
      }
    };
  }, [isLibraryLoaded, isSecure]);

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
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Camera className="text-brand" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                QR Scanner
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
                AASTU Check-in System
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scanner Window */}
        <div className="flex-1 p-6 flex flex-col items-center">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900 shadow-inner group">
             <div id="reader" className="w-full h-full border-none" />

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
               <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-brand/50 rounded-lg" />
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
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className={cn(
                     "absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl transition-colors",
                     lastScan.status === "success" ? "bg-emerald-500/90" : 
                     lastScan.status === "warning" ? "bg-amber-500/90" :
                     lastScan.status === "error" ? "bg-rose-500/90" : "bg-brand/90"
                   )}
                 >
                   {lastScan.status === "loading" && <Loader2 className="text-white animate-spin mb-4" size={48} />}
                   {lastScan.status === "success" && <CheckCircle2 className="text-white mb-4" size={48} />}
                   {lastScan.status === "warning" && <UserCheck className="text-white mb-4" size={48} />}
                   {lastScan.status === "error" && <AlertCircle className="text-white mb-4" size={48} />}
                   
                   <h3 className="text-white font-black text-xl mb-2">
                     {lastScan.status === "success" ? "Access Granted" : 
                      lastScan.status === "warning" ? "Already Checked In" :
                      lastScan.status === "error" ? "Access Denied" : "Verifying..."}
                   </h3>
                   <p className="text-white/80 text-sm font-medium">
                     {lastScan.message}
                   </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <QrCode size={20} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Auto Scan</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-x border-gray-100 dark:border-gray-800">
               <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <ShieldCheck size={20} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Secure JWT</span>
            </div>
            <div className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                 <History size={20} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Live Logs</span>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-8 pt-0 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Position the QR code within the focus frame to automatically check-in the attendee
          </p>
        </div>
      </motion.div>
    </div>
  );
}
