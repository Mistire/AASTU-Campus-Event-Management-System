"use client";

import { useParams, useRouter } from "next/navigation";
import { useEventDetail } from "@/features/events/api/useEventDetail";
import { useRegistration } from "@/features/events/api/useRegistration";
import { useRegistrationStatus } from "@/features/events/api/useRegistrationStatus";
import { useCancelRegistration } from "@/features/events/api/mutations";
import { AgendaTimeline } from "@/features/events/components/AgendaTimeline";
import { EventInfoGrid } from "@/features/events/components/EventInfoGrid";
import { SimilarEventsRail } from "@/features/events/components/SimilarEventsRail";
import { EventHeroHeader } from "@/features/events/components/EventHeroHeader";
import { RegistrationSidebar } from "@/features/events/components/RegistrationSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, CalendarPlus } from "lucide-react";
import { generateICS } from "@/lib/ics";
import { toast } from "sonner";
import { EventDetailSkeleton, EventErrorState } from "@/features/events/components/EventDetailUIStates";
import { useMemo } from "react";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: event, isLoading, isError } = useEventDetail(id);
  const { data: regInfo, isLoading: statusLoading } = useRegistrationStatus(id);
  const { mutateAsync: register, isPending: isRegistering } = useRegistration();
  const { mutateAsync: cancel, isPending: isCancelling } = useCancelRegistration();

  const handleRegister = async () => {
    if (!event) return;
    try {
      await register(id);
      toast.success("Registration Successful", {
        description: `You are now registered for ${event.title}.`,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleCancelRegistration = async () => {
    if (!regInfo || regInfo.kind === "none") return;
    
    const regId = regInfo.kind === "registered" ? regInfo.registration.id : regInfo.waitlistEntry.id;

    try {
      await cancel(regId);
      toast.success("Registration Cancelled", {
        description: "Your spot has been released.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error("Cancellation failed", {
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    generateICS({
      title: event.title,
      description: event.description || "",
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.venue?.name || "AASTU Campus",
    });
    toast.success("Calendar file generated");
  };

  const capacityPercent = Math.min(
    100,
    Math.round((event?._count.registrations || 0) / (event?.capacity || 1) * 100)
  );

  const regStatus = useMemo(() => {
    if (!regInfo) return "none";
    if (regInfo.kind === "registered") {
      return regInfo.registration.status.name.toLowerCase() as any;
    }
    if (regInfo.kind === "waitlisted") return "waitlisted";
    return "none";
  }, [regInfo]);

  const isEnded = event?.endTime ? new Date(event.endTime) < new Date() : false;

  if (isLoading || statusLoading) return <EventDetailSkeleton />;
  if (isError || !event) return <EventErrorState onBack={() => router.back()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-brand font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Back to Discover
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied!");
            }}
            className="rounded-xl p-2.5 h-auto text-gray-400 border-gray-100 shadow-sm"
          >
            <Share2 size={16} />
          </Button>
          <Button
            variant="outline"
            onClick={handleAddToCalendar}
            className="rounded-xl p-2.5 h-auto text-gray-400 border-gray-100 shadow-sm"
          >
            <CalendarPlus size={16} />
          </Button>
        </div>
      </div>

      <EventHeroHeader event={event} />

      <EventInfoGrid
        startTime={event.startTime}
        endTime={event.endTime}
        venueName={event.venue?.name || "Unassigned"}
        organizerName="AASTU Student Union"
        capacity={event.capacity}
        registrations={event._count?.registrations || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        <div className="lg:col-span-8 space-y-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase flex items-center gap-3">
              About <span className="text-brand">this Event</span>
            </h2>
            <div className="prose prose-brand max-w-none text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-100">
              {event.description ||
                "Organizers haven't provided a full description yet."}
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {event.tags?.map((t) => (
                <Badge
                  key={t.id}
                  variant="secondary"
                  className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border-none"
                >
                  #{t.tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {event.sessions && event.sessions.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase flex items-center gap-3">
                Agenda <span className="text-brand">& Sessions</span>
              </h2>
              <AgendaTimeline sessions={event.sessions} />
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <RegistrationSidebar
            isRegistering={isRegistering}
            isCancelling={isCancelling}
            isFull={capacityPercent >= 100}
            capacityPercent={capacityPercent}
            handleRegister={handleRegister}
            handleCancel={handleCancelRegistration}
            status={regStatus}
            waitlistPosition={regInfo?.kind === "waitlisted" ? regInfo.waitlistEntry.position : undefined}
            isEnded={isEnded}
          />
        </div>
      </div>

      <SimilarEventsRail eventId={id} />

      <div className="py-12 flex flex-col items-center justify-center border-t border-gray-100 mt-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
          [ Event Detail — CEMS Experience ]
        </div>
      </div>
    </div>
  );
}
