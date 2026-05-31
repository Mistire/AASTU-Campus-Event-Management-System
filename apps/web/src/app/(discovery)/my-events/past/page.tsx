"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMyRegistrations } from "@/features/events/api/useRegistrationStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EventFeedCard } from "@/features/events/components/EventFeedCard";

export default function PastEventsPage() {
  const { data, isLoading } = useMyRegistrations();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const pastEntries = [
    ...(data?.registrations || []),
  ].filter((entry: any) => new Date(entry.event.endTime) < new Date());

  if (pastEntries.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-8"
        >
          <History size={40} className="text-gray-300" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-brand font-black text-gray-900 dark:text-white tracking-tighter mb-4 uppercase"
        >
          No <span className="text-gray-400">Past Events</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto mb-10"
        >
          You haven&apos;t attended any events yet. Once you complete an event, it will appear here!
        </motion.p>

        <Link href="/discovery">
          <Button
            size="lg"
            className="rounded-lg h-14 px-8 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 flex items-center gap-3"
          >
            <Search size={18} />
            Explore Feed
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-6">
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
          Event <span className="text-gray-400">History</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Review events you have attended in the past
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pastEntries.map((entry: any) => (
          <EventFeedCard key={entry.id} event={entry.event} />
        ))}
      </div>
    </div>
  );
}
