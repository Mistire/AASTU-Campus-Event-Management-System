"use client";

import { motion } from "framer-motion";
import { 
  Star, 
  ArrowUpRight, 
  Bookmark,
  Circle 
} from "lucide-react";
import Image from "next/image";
import { Event } from "../api/useEvents";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { getMediaUrl } from "@/lib/api-client";

interface EventHeroCardProps {
  event: Event;
  isSaved?: boolean;
}

export function EventHeroCard({ event, isSaved: initialIsSaved }: EventHeroCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const startTime = new Date(event.startTime);
  const isLive = event.status?.statusName === "LIVE";
  const imageUrl = getMediaUrl(event.thumbnail || event.media?.[0]?.fileUrl);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative w-[340px] sm:w-[420px] aspect-4/3 rounded-[2.5rem] overflow-hidden bg-gray-900 shadow-2xl shadow-brand/10 transition-all duration-500"
    >
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 340px, 420px"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand/40 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      {/* Glassmorphic Grains */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/20 backdrop-blur-md border border-brand/30">
              <Star size={12} className="text-brand-subtle fill-brand-subtle" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-subtle">
                Recommended
              </span>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30">
                <Circle
                  size={8}
                  fill="#ef4444"
                  className="animate-pulse text-red-500"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-100">
                  Live now
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className={cn(
              "p-3 rounded-2xl transition-all border shrink-0",
              isSaved
                ? "bg-brand border-brand text-white scale-110 shadow-lg shadow-brand/20"
                : "bg-white/10 backdrop-blur-sm border-white/20 text-white/40 hover:text-white hover:border-white/40"
            )}
          >
            <Bookmark
              size={18}
              fill={isSaved ? "currentColor" : "none"}
              strokeWidth={isSaved ? 0 : 2.5}
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-white/50 text-[9px] font-black uppercase tracking-widest">
              {event.eventCategories?.slice(0, 1).map((ec) => (
                <span key={ec.id} className="text-brand-subtle">
                  {ec.category.name}
                </span>
              ))}
              <span className="opacity-20">•</span>
              <span>{event.capacity} Capacity</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight leading-tight group-hover:text-brand-subtle transition-colors">
              {event.title}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                  Start Time
                </span>
                <span className="text-sm font-black text-white/90">
                  {format(startTime, "h:mm a")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                  Timeline
                </span>
                <span className="text-sm font-black text-white/90">
                  {format(startTime, "MMM d")}
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white text-gray-900 flex items-center justify-center shadow-xl shadow-black/20 group-hover:bg-brand group-hover:text-white group-hover:rotate-12 transition-all duration-500 shrink-0">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
