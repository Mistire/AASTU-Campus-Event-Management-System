"use client";

import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Hash,
  ArrowRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Event } from "../types";
import { getStatusColor } from "./EventsTableConfig";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { CemsButton } from "@/components/cems/CemsButton";

import { CemsSheet } from "@/components/cems/CemsSheet";

interface EventPreviewPanelProps {
  event: Event | null;
  onClose: () => void;
}

export const EventPreviewPanel = ({
  event,
  onClose,
}: EventPreviewPanelProps) => {
  const router = useRouter();

  return (
    <CemsSheet
      open={!!event}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-md"
    >
      {event && (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
          {/* Panel Header */}
          <div className="bg-brand p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute -top-6 -right-6 opacity-10">
              <Calendar size={100} />
            </div>
            <div className="relative z-10 space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                {event.eventType?.name || "Standard Event"}
              </p>
              <h3 className="text-xl font-black tracking-tight leading-tight">
                {event.title}
              </h3>
              <CemsBadge
                className={`${getStatusColor(event.status.statusName)} rounded-lg px-3 py-0.5 text-[8px] font-black uppercase tracking-widest mt-1 border-none bg-white/20 text-white`}
              >
                {event.status.statusName}
              </CemsBadge>
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Venue
                  </span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                  {event.venue.name}
                </p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">
                  {event.venue.location}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Capacity
                  </span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white">
                  {event._count?.registrations || 0} / {event.capacity}
                </p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">Registrations</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand" />
                Schedule
              </h4>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    Start
                  </span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {format(new Date(event.startTime), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
                <div className="h-px bg-gray-50 dark:bg-gray-800" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    End
                  </span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {format(new Date(event.endTime), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Description
                </h4>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px]">
                <Hash className="w-3 h-3 text-gray-300" />
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Event ID
                </span>
                <span className="ml-auto text-gray-500 dark:text-gray-400 font-mono text-[9px]">
                  {event.id.slice(0, 12)}…
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <Clock className="w-3 h-3 text-gray-300" />
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Created
                </span>
                <span className="ml-auto text-gray-500 dark:text-gray-400">
                  {format(new Date(event.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="p-5">
                <CemsButton
                  cemsVariant="brand"
                  className="w-full rounded-lg font-black text-[10px] uppercase tracking-[0.2em] h-11 gap-3 group active:scale-95 transition-all"
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                >
                  View Full Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </CemsButton>
              </div>
            </div>
          </div>

        </div>
      )}
    </CemsSheet>
  );
};
