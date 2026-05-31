"use client";

import { Badge } from "@/components/ui/badge";
import { Circle, MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Event, getThumbnailUrl } from "../api/useEvents";

interface EventHeroHeaderProps {
  event: Event;
}

export function EventHeroHeader({ event }: EventHeroHeaderProps) {
  const isLive = event.status?.statusName === "LIVE";
  const thumbnailUrl = getThumbnailUrl(event);

  return (
    <section className="relative rounded-lg overflow-hidden bg-gray-900 aspect-21/9 sm:aspect-video md:aspect-3/1 shadow-2xl group">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={event.title}
          fill
          priority
          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-brand/80 via-blue-600/60 to-purple-800/80 group-hover:scale-105 transition-transform duration-700" />
      )}

      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-brand/20 rounded-full blur-[100px] group-hover:bg-brand/30 transition-colors" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />

      <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/20 to-transparent z-0" />

      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white z-10">
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md",
                isLive ? "bg-red-500/20 text-red-100" : "bg-white/10 text-white"
              )}
            >
              {isLive ? (
                <span className="flex items-center gap-2">
                  <Circle
                    size={8}
                    fill="currentColor"
                    className="animate-pulse"
                  />
                  Live Now
                </span>
              ) : (
                event.status?.statusName || "Upcoming"
              )}
            </Badge>
            {event.eventType && (
              <Badge className="bg-brand/20 backdrop-blur-md border border-brand/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-brand-subtle">
                {event.eventType.name}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white/80">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                <MapPin size={14} className="text-brand-subtle" />
              </div>
              {event.venue?.name}
            </div>
            {event.requiresApproval && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <div className="p-2 rounded-lg bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20">
                  <ShieldCheck size={14} />
                </div>
                Fast Pass Required
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
