"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  Ticket,
  Sparkles,
  Hash,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { CemsButton } from "@/components/cems/CemsButton";

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  ticketToken: string;
}

export const TicketModal = ({
  open,
  onOpenChange,
  event,
  ticketToken,
}: TicketModalProps) => {
  const formattedDate = useMemo(() => {
    return new Date(event.startTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [event.startTime]);

  const formattedTime = useMemo(() => {
    return new Date(event.startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [event.startTime]);

  const ticketId = event.id?.slice(-8)?.toUpperCase() || "XXXXXXXX";

  // Generate QR Code URL using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketToken)}&color=0c4a6e&bgcolor=FFFFFF&format=svg`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative"
        >
          {/* ─── Outer Ticket Shell ─── */}
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.04] dark:ring-gray-800">

            {/* ─── Header: Brand Gradient ─── */}
            <div className="relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-hover to-sky-900" />

              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.07]" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.05]" />
              <div className="absolute top-6 right-12 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
              <div className="absolute top-16 right-24 w-1.5 h-1.5 rounded-full bg-white/20" />

              {/* Content */}
              <div className="relative z-10 px-7 pt-7 pb-8">
                {/* Top row: Logo + Ticket ID */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center ring-1 ring-white/10">
                      <Ticket className="text-white" size={16} />
                    </div>
                    <div>
                      <span className="font-brand font-black text-[10px] uppercase tracking-[0.25em] text-white/90 block leading-none">
                        CEMS
                      </span>
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/50 font-bold">
                        Event Ticket
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                    <Hash size={10} className="text-white/50" />
                    <span className="text-[9px] font-mono font-bold text-white/70 tracking-wider">
                      {ticketId}
                    </span>
                  </div>
                </div>

                {/* Event title */}
                <h2 className="text-[22px] font-black tracking-tight leading-[1.15] text-white mb-3 pr-4">
                  {event.title}
                </h2>

                {/* Event type badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/10">
                    <Sparkles size={10} />
                    {event.eventType?.name || "Event"}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Perforated Edge ─── */}
            <div className="relative h-5">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100/80 dark:bg-black/50 shadow-inner" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100/80 dark:bg-black/50 shadow-inner" />
              <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-gray-200/70 dark:border-gray-800" />
            </div>

            {/* ─── Info Grid ─── */}
            <div className="px-7 pt-2 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Date */}
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                    <Calendar size={10} className="text-brand" />
                    Date
                  </span>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                    {formattedDate}
                  </p>
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                    <Clock size={10} className="text-brand" />
                    Time
                  </span>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                    {formattedTime}
                  </p>
                </div>

                {/* Venue */}
                <div className="space-y-1.5 col-span-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                    <MapPin size={10} className="text-brand" />
                    Venue
                  </span>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                    {event.venue?.name || "Campus Venue"}
                  </p>
                  {(event.venue?.building || event.venue?.roomNumber) && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      {[event.venue?.building, event.venue?.roomNumber].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* ─── QR Code Section ─── */}
              <div className="pt-3">
                <div className="flex flex-col items-center">
                  {/* QR container with brand accent ring */}
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="relative p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 shadow-sm"
                  >
                    {/* Corner accent dots */}
                    <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-brand/40" />
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand/40" />
                    <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-brand/40" />
                    <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand/40" />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Check-in QR Code"
                      width={150}
                      height={150}
                      className="rounded-lg"
                    />
                  </motion.div>

                  {/* Scan instruction */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-px w-6 bg-gray-200 dark:bg-gray-800" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">
                      Present at entrance
                    </span>
                    <div className="h-px w-6 bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Footer ─── */}
            <div className="px-7 pb-6 pt-1 flex gap-3">
              <CemsButton
                onClick={() => window.print()}
                className="flex-1 h-12 rounded-lg bg-brand hover:bg-brand/80 active:scale-[0.98] text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-brand/20 cursor-pointer"
              >
                <Download size={14} />
                Save Ticket
              </CemsButton>
              <button
                onClick={() => onOpenChange(false)}
                className="h-12 px-5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* ─── Bottom Brand Strip ─── */}
            <div className="px-7 pb-5">
              <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600 font-bold">
                <span>Campus Event Management</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-brand/50" />
                  <span>CEMS</span>
                  <div className="w-1 h-1 rounded-full bg-brand/50" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
