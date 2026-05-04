"use client";

import { motion } from "framer-motion";
import { Event } from "../api/useEvents";
import { CountdownClock } from "./CountdownClock";
import { useState } from "react";
import { EventCardImage } from "./subcomponents/EventCardImage";
import { EventCardDetails } from "./subcomponents/EventCardDetails";
import { EventCardFooter } from "./subcomponents/EventCardFooter";
import { EventCardHoverPreview } from "./subcomponents/EventCardHoverPreview";

import { useRegistration } from "../api/useRegistration";
import { useBookmarkStatus, useToggleBookmark } from "../api/useBookmarks";
import { toast } from "sonner";

interface EventFeedCardProps {
  event: Event;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export function EventFeedCard({ event, isSaved: initialIsSaved, onToggleSave }: EventFeedCardProps) {
  const { data: isBookmarkedStatus } = useBookmarkStatus(event.id);
  const { mutate: toggleBookmark } = useToggleBookmark();

  const capacityPercent = Math.min(100, Math.round(((event._count?.registrations || 0) / event.capacity) * 100));
  const isAlmostFull = capacityPercent > 85 && capacityPercent < 100;
  const isFull = capacityPercent >= 100;
  const isEnded = new Date(event.endTime) < new Date();

  const { mutateAsync: register, isPending: isRegistering } = useRegistration();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({ eventId: event.id, isBookmarked: !!isBookmarkedStatus });
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await register(event.id);
      toast.success("Registration Successful", {
        description: `You are now registered for ${event.title}`,
      });
    } catch (err: any) {
      toast.error("Registration Failed", {
        description: err.message || "Please try again later.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 overflow-hidden"
    >
      {/* Visual Header */}
      <EventCardImage event={event} />

      {/* Main Content */}
      <div className="p-6">
        <EventCardDetails 
          event={event} 
          isSaved={!!isBookmarkedStatus} 
          onToggleSave={handleSave} 
        />

        <div className="mt-4">
          <EventCardFooter 
            registrationsCount={event._count?.registrations || 0}
            capacity={event.capacity}
            isFull={isFull}
            isAlmostFull={isAlmostFull}
            capacityPercent={capacityPercent}
            onRegister={handleRegister}
            isRegistering={isRegistering}
            isEnded={isEnded}
          />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-16">
        <CountdownClock targetDate={event.startTime} />
      </div>
      
      {/* Hover Preview */}
      <EventCardHoverPreview event={event} />
    </motion.div>
  );
}
