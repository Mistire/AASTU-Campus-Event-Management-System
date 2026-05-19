import { Calendar, Users, Tag, Hash, BarChart2, Building2, CalendarClock, TimerOff } from "lucide-react";
import { format } from "date-fns";
import { InfoRow } from "../InfoRow";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { getStatusColor } from "../EventsTableConfig";
import { EventStatusName } from "../../types";

interface EventDetailSidebarProps {
  event: any; // We'll use a proper type if available
}

export function EventDetailSidebar({ event }: EventDetailSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-50 dark:border-gray-800 sticky top-24">
      {/* Brand Title Area */}
      <div className="bg-brand px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Calendar size={120} />
        </div>
        <div className="relative flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 shadow-2xl">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight tracking-tighter">
              {event.title}
            </h2>
            <p className="text-brand-light/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {event.eventType?.name || "Standard Event"}
            </p>
          </div>
          <CemsBadge
            className={`${getStatusColor(event.status.statusName as EventStatusName)} rounded-lg px-6 py-1.5 font-black text-[9px] uppercase tracking-[0.15em] border-none shadow-lg`}
          >
            {event.status.statusName}
          </CemsBadge>
        </div>
      </div>

      {/* Basic Information */}
      <div className="px-8 py-8 space-y-3">
        <InfoRow
          icon={Hash}
          iconClassName="bg-gray-50 text-gray-400"
          label="Event ID"
          value={`${event.id.slice(0, 16)}…`}
        />
        <InfoRow
          icon={Tag}
          iconClassName="bg-blue-50 text-blue-500"
          label="Type"
          value={event.eventType?.name || "Standard"}
        />
        <InfoRow
          icon={Users}
          iconClassName="bg-purple-50 text-purple-500"
          label="Capacity"
          value={`${event._count?.registrations || 0} / ${event.capacity}`}
        />
        <InfoRow
          icon={BarChart2}
          iconClassName="bg-emerald-50 text-emerald-500"
          label="Status"
          value={event.status.statusName}
        />
      </div>

      {/* Location */}
      <div className="px-8 py-4 space-y-3 border-t border-gray-50 dark:border-gray-800 pt-8">
        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em] mb-6 px-4">Location & Venue</p>
        <InfoRow
          icon={Building2}
          iconClassName="bg-orange-50 text-orange-500"
          label="Venue"
          value={event.venue.name}
          sub={event.venue.location}
        />
        {event.venue.building && (
          <InfoRow
            icon={Building2}
            iconClassName="bg-indigo-50 text-indigo-500"
            label="Building"
            value={event.venue.building}
          />
        )}
      </div>

      {/* Schedule */}
      <div className="px-8 py-4 pb-10 space-y-3 border-t border-gray-50 dark:border-gray-800 pt-8 mt-5">
        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em] mb-6 px-4">Date & Time</p>
        <InfoRow
          icon={CalendarClock}
          iconClassName="bg-blue-50 text-blue-500"
          label="Start Time"
          value={format(new Date(event.startTime), "PPP")}
          sub={format(new Date(event.startTime), "p")}
        />
        <InfoRow
          icon={TimerOff}
          iconClassName="bg-red-50 text-red-400"
          label="End Time"
          value={format(new Date(event.endTime), "PPP")}
          sub={format(new Date(event.endTime), "p")}
        />
      </div>

      {/* Timestamps */}
      <div className="px-8 py-4 pb-10 space-y-3 border-t border-gray-50 dark:border-gray-800 pt-8 mt-5">
        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em] mb-6 px-4">System Timestamps</p>
        <div className="flex items-center justify-between px-4">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Created At</span>
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{format(new Date(event.createdAt), "MMM d, yyyy · p")}</span>
        </div>
        <div className="flex items-center justify-between px-4">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Updated At</span>
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{format(new Date(event.updatedAt || event.createdAt), "MMM d, yyyy · p")}</span>
        </div>
      </div>
    </div>
  );
}
