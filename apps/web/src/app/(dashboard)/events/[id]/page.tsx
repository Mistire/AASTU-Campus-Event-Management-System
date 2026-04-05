"use client";

import { useParams } from "next/navigation";
import { EventDetail } from "@/features/events";

export default function EventDetailPage() {
  const params = useParams();
  return <EventDetail eventId={params.id as string} />;
}
