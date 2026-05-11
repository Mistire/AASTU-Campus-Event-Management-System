"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "../api/get-event";
import { useUpdateEvent } from "../api/mutations";
import { useRegistrationStatus } from "../api/useRegistrationStatus";
import { Info, GraduationCap } from "lucide-react";
import { EventDetailSkeleton, EventErrorState } from "./EventDetailUIStates";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { EventDetailHeader } from "./subcomponents/EventDetailHeader";
import { EventDetailSidebar } from "./subcomponents/EventDetailSidebar";
import { EventDetailTabs } from "./subcomponents/EventDetailTabs";
import { EventFormModal } from "./EventFormModal";
import { GuestInvitationCard } from "./GuestInvitationCard";
import { toast } from "sonner";

interface EventDetailProps {
  eventId: string;
}

export const EventDetail = ({ eventId }: EventDetailProps) => {
  const router = useRouter();
  const { profile, hasRole } = useAuthStore();
  const { data: event, isLoading: isLoadingEvent, isError } = useEvent(eventId);
  const { data: regStatus } = useRegistrationStatus(eventId);
  const updateMutation = useUpdateEvent();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleBack = () => router.push("/dashboard/events");

  const isAdmin = hasRole("ADMIN");
  const isCreator = profile?.id === event?.createdBy;
  const isOrganizer = event?.organizers?.some(
    (org: any) => org.user.id === profile?.id
  );

  const canManage = !!(isAdmin || isCreator || isOrganizer);
  const canEdit = !!(isCreator || isOrganizer);
  
  // A student can invite guests if they are registered (CONFIRMED) 
  // and the event has a guest limit > 0
  const isConfirmedStudent = regStatus?.kind === "registered" && 
                             regStatus.registration?.status?.name?.toUpperCase() === "CONFIRMED";
  
  const showGuestSection = isConfirmedStudent && (event?.guestLimitPerUser ?? 0) > 0;

  const handleSaveEvent = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: eventId, data });
      toast.success("Event updated successfully");
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update event");
    }
  };

  /* Loading */
  if (isLoadingEvent) {
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
        onEdit={() => setIsEditModalOpen(true)}
        canEdit={canEdit} 
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">

        {/* ── LEFT CARD ── */}
        <div className="lg:col-span-4 space-y-6">
          <EventDetailSidebar event={event} />
          
          {/* Graduation Indicator if applicable */}
          {event.eventType?.name?.toUpperCase() === "GRADUATION" && (
            <div className="p-6 bg-brand/5 rounded-lg border border-brand/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/20">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand uppercase tracking-widest">Event Protocol</p>
                <h4 className="text-sm font-black text-gray-900 tracking-tight">Official Graduation</h4>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Guest Invitation Section for Students */}
          {showGuestSection && profile && (
            <GuestInvitationCard event={event} userId={profile.id} />
          )}

          {/* Description card */}
          <div className="bg-white rounded-lg shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-brand/5 flex items-center justify-center text-brand">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Event Description</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Overview of the upcoming event</p>
              </div>
            </div>
            
            <div className="bg-gray-50/50 rounded-lg p-8 border border-gray-100">
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
            canEdit={canEdit}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {event && (
        <EventFormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          event={event}
          onSave={handleSaveEvent}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
};
