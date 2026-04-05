"use client";

import { useParams, useRouter } from "next/navigation";
import { useEventDetail } from "@/features/events/api/useEventDetail";
import { useRegistration } from "@/features/events/api/useRegistration";
import { AgendaTimeline } from "@/features/events/components/AgendaTimeline";
import { EventInfoGrid } from "@/features/events/components/EventInfoGrid";
import { SimilarEventsRail } from "@/features/events/components/SimilarEventsRail";
import { EventHeroHeader } from "@/features/events/components/EventHeroHeader";
import { RegistrationSidebar } from "@/features/events/components/RegistrationSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, CalendarPlus, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateICS } from "@/lib/ics";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: event, isLoading, isError } = useEventDetail(id);
  const { mutateAsync: register, isPending: isRegistering } = useRegistration();

  if (isLoading) return <EventDetailSkeleton />;
  if (isError || !event) return <EventErrorState onBack={() => router.back()} />;

  const handleRegister = async () => {
    try {
      await register(id);
      toast.success("Registration Successful", {
        description: `You are now registered for ${event.title}.`,
      });
    } catch (err: any) {
      toast.error("Registration failed", {
        description: err.message || "Please try again later.",
      });
    }
  };

  const handleAddToCalendar = () => {
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
    Math.round((event._count.registrations / event.capacity) * 100)
  );

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
        registrations={event._count.registrations}
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
            isFull={capacityPercent >= 100}
            capacityPercent={capacityPercent}
            handleRegister={handleRegister}
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

function EventDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8 space-y-8">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-[400px] w-full rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}

function EventErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <Info size={40} className="text-red-500" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-2">Event not found</h3>
      <Button
        onClick={onBack}
        className="mt-8 rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-[10px] h-12 px-10"
      >
        Back to Discovery
      </Button>
    </div>
  );
}
