"use client";

import { useRouter } from "next/navigation";
import { useEvent } from "../apis/get-event";
import { CardController } from "@/components/controllers/CardController";
import { ButtonController } from "@/components/controllers/ButtonController";
import { BadgeController } from "@/components/controllers/BadgeController";
import { SkeletonController } from "@/components/controllers/SkeletonController";
import { TabsController } from "@/components/controllers/TabsController";
import { getStatusColor } from "./EventColumns";
import { format } from "date-fns";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  Tag,
  Hash,
  BarChart2,
  Pencil,
  Building2,
  CalendarClock,
  TimerOff,
} from "lucide-react";

interface EventDetailProps {
  eventId: string;
}

/* ── small helpers ─────────────────────────────────────────── */
const SectionHeader = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <>
    <div className="px-6 pt-5 pb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {label}
        </h3>
      </div>
    </div>
    <div className="border-t border-gray-900 mx-6" />
  </>
);

const InfoRow = ({
  icon: Icon,
  iconClassName = "text-gray-400",
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconClassName?: string;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClassName}`} />
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── main component ────────────────────────────────────────── */
export const EventDetail = ({ eventId }: EventDetailProps) => {
  const router = useRouter();
  const { data: event, isLoading, isError, error } = useEvent(eventId);

  const handleBack = () => router.push("/events");

  /* Loading */
  if (isLoading) {
    return (
      <div className="w-full space-y-5">
        <SkeletonController className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SkeletonController className="h-[600px] lg:col-span-4 rounded-2xl" />
          <SkeletonController className="h-[600px] lg:col-span-8 rounded-2xl" />
        </div>
      </div>
    );
  }

  /* Error */
  if (isError || !event) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="font-bold">Error loading event</h3>
            <p className="text-sm">
              {(error as Error)?.message || "Event not found"}
            </p>
          </div>
        </div>
        <ButtonController onClick={handleBack} variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Events
        </ButtonController>
      </div>
    );
  }

  /* Tabs content */
  const tabItems = [
    {
      value: "attendees",
      label: "ATTENDEES",
      content: (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Users className="h-14 w-14 mb-4 opacity-20" />
          <p className="font-medium text-base italic">
            Attendee list will be available when registrations start
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {event._count?.registrations || 0} registered so far
          </p>
        </div>
      ),
    },
    {
      value: "venue",
      label: "VENUE DETAILS",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Building
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.building || "Main Campus"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Room
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.roomNumber || "TBD"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Full Address
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.location}
            </p>
          </div>
        </div>
      ),
    },
    {
      value: "sessions",
      label: "SESSIONS",
      content: (
        <div className="p-8 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
          <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">
            No special sessions defined for this event.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Events</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">Details</span>
          </div>
        </div>
        <div className="ml-auto">
          <ButtonController className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            EDIT EVENT
          </ButtonController>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">

        {/* ── LEFT CARD ── */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

            {/* Blue banner */}
            <div className="bg-blue-600 px-6 py-8 text-white">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-white/20 rounded-full">
                  <Calendar className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold leading-tight">
                    {event.title}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {event.eventType?.name || "Standard Event"}
                  </p>
                </div>
                <BadgeController
                  className={`${getStatusColor(event.status.statusName as any)} rounded-full px-4 py-1 font-bold text-[11px] uppercase tracking-widest`}
                >
                  {event.status.statusName}
                </BadgeController>
              </div>
            </div>

            {/* Basic Information */}
            <SectionHeader icon={Info} label="Basic Information" />
            <div className="px-6 py-4 space-y-4">
              <InfoRow
                icon={Hash}
                label="Event ID"
                value={`${event.id.slice(0, 16)}…`}
              />
              <InfoRow
                icon={Tag}
                iconClassName="text-blue-500"
                label="Type"
                value={event.eventType?.name || "Standard"}
              />
              <InfoRow
                icon={Users}
                iconClassName="text-purple-500"
                label="Capacity"
                value={`${event._count?.registrations || 0} registered / ${event.capacity} max`}
              />
              <InfoRow
                icon={BarChart2}
                iconClassName="text-green-500"
                label="Status"
                value={event.status.statusName}
              />
            </div>

            {/* Location */}
            <SectionHeader icon={MapPin} label="Location" />
            <div className="px-6 py-4 space-y-4">
              <InfoRow
                icon={Building2}
                iconClassName="text-orange-500"
                label="Venue"
                value={event.venue.name}
                sub={event.venue.location}
              />
              {event.venue.building && (
                <InfoRow
                  icon={Building2}
                  label="Building"
                  value={event.venue.building}
                />
              )}
            </div>

            {/* Schedule */}
            <SectionHeader icon={Clock} label="Schedule" />
            <div className="px-6 py-4 space-y-4">
              <InfoRow
                icon={CalendarClock}
                iconClassName="text-blue-500"
                label="Start Time"
                value={format(new Date(event.startTime), "PPP")}
                sub={format(new Date(event.startTime), "p")}
              />
              <InfoRow
                icon={TimerOff}
                iconClassName="text-red-400"
                label="End Time"
                value={format(new Date(event.endTime), "PPP")}
                sub={format(new Date(event.endTime), "p")}
              />
            </div>

            {/* Timestamps */}
            <SectionHeader icon={Info} label="Timestamps" />
            <div className="px-6 py-4 pb-6 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <p className="text-xs text-gray-400">Created At</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {format(new Date(event.createdAt), "MMM d, yyyy · p")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <p className="text-xs text-gray-400">Updated At</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {format(
                      new Date(event.updatedAt || event.createdAt),
                      "MMM d, yyyy · p"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Description card */}
          <CardController
            className="border border-gray-100 shadow-md rounded-2xl"
            contentClassName="p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Description
              </h3>
            </div>
            <div className="border-t border-gray-900 mb-4" />
            <p className="text-sm text-gray-600 leading-relaxed">
              {event.description || "No description provided for this event."}
            </p>
          </CardController>

          {/* Tabs card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <TabsController
              tabs={tabItems}
              defaultValue="attendees"
              listClassName="bg-transparent border-b-0 space-x-8 h-auto pb-0 px-6 pt-4 border-b border-gray-100 w-full rounded-none"
              triggerClassName="data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 border-b-2 border-transparent rounded-none h-10 px-0 font-bold text-gray-500"
              contentClassName="mt-0 px-6 py-6 min-h-[300px]"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
