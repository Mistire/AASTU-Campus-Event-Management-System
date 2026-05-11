"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMyRegistrations } from "@/features/events/api/useRegistrationStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketModal } from "@/features/events/components/TicketModal";
import { MyEventsCalendar } from "@/features/discovery/components/MyEventsCalendar";
import { useRecommendations } from "@/features/events/api/useRecommendations";
import { useMyOrganizerInvitations } from "@/features/events/api/get-organizers";
import { EventFeedCard } from "@/features/events/components/EventFeedCard";

export default function MyEventsPage() {
  const { data, isLoading } = useMyRegistrations();
  const { data: recommendations } = useRecommendations(3);
  const { data: invitations } = useMyOrganizerInvitations();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-8">
          <Skeleton className="h-12 w-64 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const allEntries = [
    ...(data?.registrations || []).map((r: any) => ({
      ...r,
      entryType: "registered",
    })),
    ...(data?.waitlist || []).map((w: any) => ({
      ...w,
      entryType: "waitlisted",
    })),
  ];

  if (allEntries.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-full bg-brand/5 flex items-center justify-center mb-8"
            >
              <Calendar size={40} className="text-brand/40" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-brand font-black text-gray-900 tracking-tighter mb-4"
            >
              Your Schedule is <span className="text-brand">Empty</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg max-w-md mx-auto mb-10"
            >
              You haven&apos;t registered for any events yet. Start exploring
              the campus feed to find workshops, festivals, and more!
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/discovery">
                <Button
                  size="lg"
                  className="rounded-lg h-14 px-8 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 flex items-center gap-3"
                >
                  <Search size={18} />
                  Explore Events
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase leading-none">
              My <span className="text-brand">Schedule</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              Manage your active registrations & calendar
            </p>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center">
              <span className="text-2xl font-black text-gray-900">
                {data?.registrations?.length || 0}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                Registered
              </span>
            </div>
            <div className="px-6 py-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center">
              <span className="text-2xl font-black text-gray-900">
                {data?.waitlist?.length || 0}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                Waitlist
              </span>
            </div>
          </div>
        </div>

        {/* Invitations Alert Section */}
        {invitations &&
          invitations.some((i: any) => i.status === "PENDING") && (
            <section className="bg-brand/5 border-2 border-brand/10 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-lg bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/20">
                  <Ticket size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-gray-900 uppercase">
                    Pending Invitations
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    You have been invited to help organize an event. Check your
                    dashboard to respond.
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="rounded-lg h-12 px-8 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20">
                  View Invitations
                </Button>
              </Link>
            </section>
          )}

        {/* Calendar View - Primary */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Calendar size={20} className="text-brand" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Visual Schedule
            </h2>
          </div>
          <MyEventsCalendar 
            events={allEntries} 
            onViewTicket={(entry) => {
              setSelectedEntry(entry);
              setIsTicketOpen(true);
            }}
          />
        </section>

        {/* Discovery Recommendations Footer */}
        {recommendations && recommendations.length > 0 && (
          <section className="pt-24 space-y-10">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                Recommended <span className="text-brand">For You</span>
              </h2>
              <p className="text-gray-500 font-medium max-w-lg">
                Based on your schedule, you might also find these events
                interesting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {recommendations.map((event: any) => (
                <EventFeedCard key={event.id} event={event} />
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <Link href="/discovery">
                <Button
                  variant="outline"
                  className="rounded-lg h-12 px-8 font-black uppercase tracking-widest text-[10px] border-gray-200 hover:border-brand hover:text-brand transition-all"
                >
                  Browse All Events
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      {selectedEntry && (
        <TicketModal
          open={isTicketOpen}
          onOpenChange={setIsTicketOpen}
          event={selectedEntry.event}
          ticketToken={selectedEntry.ticketToken}
        />
      )}
    </div>
  );
}
