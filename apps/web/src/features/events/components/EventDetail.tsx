"use client";

import { useRouter } from "next/navigation";
import { useEvent } from "../api/get-event";
import { Info } from "lucide-react";
import { EventDetailSkeleton, EventErrorState } from "./EventDetailUIStates";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { EventDetailHeader } from "./subcomponents/EventDetailHeader";
import { EventDetailSidebar } from "./subcomponents/EventDetailSidebar";
import { EventDetailTabs } from "./subcomponents/EventDetailTabs";

interface EventDetailProps {
  eventId: string;
}

export const EventDetail = ({ eventId }: EventDetailProps) => {
  const router = useRouter();
  const { profile, hasRole } = useAuthStore();
  const { data: event, isLoading, isError, error } = useEvent(eventId);

  const handleBack = () => router.push("/dashboard/events");

  const isAdmin = hasRole("ADMIN");
  const isCreator = profile?.id === event?.createdBy;
  const isOrganizer = event?.organizers?.some(
    (org: any) => org.user.id === profile?.id
  );

  const canManage = !!(isAdmin || isCreator || isOrganizer);

  /* Loading */
  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  /* Error */
  if (isError || !event) {
    return <EventErrorState onBack={handleBack} />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Page header */}
      <EventDetailHeader 
        title={event.title} 
        onBack={handleBack} 
        canManage={canManage} 
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">

        {/* ── LEFT CARD ── */}
        <div className="lg:col-span-4">
          <EventDetailSidebar event={event} />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Description card */}
          <div className="bg-white rounded-xl shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Event Description</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Overview of the upcoming event</p>
              </div>
            </div>
            
            <div className="bg-gray-50/50 rounded-xl p-8 border border-gray-100">
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </div>
          </div>

          {/* Tabs card */}
          <EventDetailTabs 
            eventId={eventId} 
            event={event} 
            canManage={canManage} 
          />
        </div>
      </div>
    </div>
  );
};
