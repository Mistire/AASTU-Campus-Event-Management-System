"use client";

import { Calendar, MapPin, Users, Clock, Hash, ArrowRight, X } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Event } from "../types";
import { getStatusColor } from "./EventsTableConfig";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { CemsButton } from "@/components/cems/CemsButton";

interface EventPreviewPanelProps {
  event: Event;
  onClose: () => void;
}

export const EventPreviewPanel = ({ event, onClose }: EventPreviewPanelProps) => {
  const router = useRouter();

  return (
    <div className="w-96 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Panel Header */}
      <div className="bg-brand p-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-10">
          <Calendar size={100} />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              {event.eventType?.name || "Standard Event"}
            </p>
            <h3 className="text-lg font-black tracking-tight truncate">
              {event.title}
            </h3>
            <CemsBadge className={`${getStatusColor(event.status.statusName)} rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mt-2 border-none`}>
              {event.status.statusName}
            </CemsBadge>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="p-5 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Venue</span>
            </div>
            <p className="text-sm font-bold text-gray-800 truncate">{event.venue.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{event.venue.location}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Capacity</span>
            </div>
            <p className="text-sm font-bold text-gray-800">
              {event._count?.registrations || 0} / {event.capacity}
            </p>
            <p className="text-[10px] text-gray-400">Registrations</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Schedule
          </h4>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Start</span>
              <span className="font-bold text-gray-800">
                {format(new Date(event.startTime), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">End</span>
              <span className="font-bold text-gray-800">
                {format(new Date(event.endTime), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
              {event.description}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px]">
            <Hash className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400 font-medium">ID</span>
            <span className="ml-auto text-gray-500 font-mono">{event.id.slice(0, 12)}…</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400 font-medium">Created</span>
            <span className="ml-auto text-gray-500">{format(new Date(event.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {/* View Full Details */}
        <CemsButton
          cemsVariant="brand-outline"
          className="w-full rounded-xl font-bold text-xs uppercase tracking-wider h-10 gap-2 group"
          onClick={() => router.push(`/dashboard/events/${event.id}`)}
        >
          View Full Details
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </CemsButton>
      </div>
    </div>
  );
};
