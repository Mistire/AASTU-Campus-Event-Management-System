"use client";

import { useSimilarEvents } from "../api/useRecommendations";
import { EventFeedCard } from "./EventFeedCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers } from "lucide-react";

interface SimilarEventsRailProps {
  eventId: string;
}

export function SimilarEventsRail({ eventId }: SimilarEventsRailProps) {
  const { data: events, isLoading } = useSimilarEvents(eventId, 4);

  if (!isLoading && (!events || events.length === 0)) return null;

  return (
    <section className="space-y-8 py-12">
      <div className="flex items-center gap-3">
        <Layers className="text-brand" size={24} />
        <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Similar Events</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))
        ) : (
          events?.map((event) => (
            <EventFeedCard key={event.id} event={event} />
          ))
        )}
      </div>
    </section>
  );
}
