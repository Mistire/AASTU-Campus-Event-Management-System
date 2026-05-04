"use client";

import { motion } from "framer-motion";
import { Bookmark, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useBookmarks } from "@/features/events/api/useBookmarks";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFeedCard } from "@/features/events/components/EventFeedCard";
import { useRecommendations } from "@/features/events/api/useRecommendations";

export default function BookmarkedEventsPage() {
  const { data: bookmarks, isLoading } = useBookmarks();
  const { data: recommendations } = useRecommendations(3);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-brand/5 flex items-center justify-center mb-8"
        >
          <Bookmark size={40} className="text-brand/40" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-brand font-black text-gray-900 tracking-tighter mb-4 uppercase"
        >
          No <span className="text-brand">Bookmarks</span> Yet
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-gray-500 text-lg max-w-md mx-auto mb-10"
        >
          Save events you&apos;re interested in to keep track of them here. Just
          click the bookmark icon on any event card.
        </motion.p>

        <Link href="/discovery">
          <Button
            size="lg"
            className="rounded-2xl h-14 px-8 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 flex items-center gap-3"
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
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase leading-none">
          Saved <span className="text-brand">Events</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Quick access to events you have bookmarked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookmarks.map((bookmark: any) => (
          <EventFeedCard key={bookmark.id} event={bookmark.event} />
        ))}
      </div>
      {/* Discovery Recommendations Footer */}
      {recommendations && recommendations.length > 0 && (
        <section className="pt-24 space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Recommended <span className="text-brand">For You</span>
            </h2>
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
                className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] border-gray-200 hover:border-brand hover:text-brand transition-all"
              >
                Browse All Events
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
