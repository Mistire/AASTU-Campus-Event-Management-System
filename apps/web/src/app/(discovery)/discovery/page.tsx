"use client";

import { useState } from "react";
import { OnboardingGate } from "@/features/onboarding/components/OnboardingGate";
import { useEvents, EventQueryParams } from "@/features/events/api/useEvents";
import { useRecommendations } from "@/features/events/api/useRecommendations";
import { EventFeedCard } from "@/features/events/components/EventFeedCard";
import { EventHeroCard } from "@/features/events/components/EventHeroCard";
import { FilterBar } from "@/features/events/components/FilterBar";
import { DiscoveryHeader } from "@/features/discovery/components/DiscoveryHeader";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CalendarDays,
  SearchX,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentHomePage() {
  const [queryParams, setQueryParams] = useState<EventQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "newest",
    status: "APPROVED",
  });

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    isFetching: isFetchingEvents,
  } = useEvents(queryParams);

  const { data: recommendations, isLoading: isLoadingRecs } = useRecommendations(
    5
  );

  const handleFilterChange = (filters: {
    search: string;
    categoryId: string | null;
  }) => {
    setQueryParams((prev) => ({
      ...prev,
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
      page: 1,
    }));
  };

  const loadMore = () => {
    if (eventsData && queryParams.page! < eventsData.meta.totalPages) {
      setQueryParams((prev) => ({
        ...prev,
        page: prev.page! + 1,
      }));
    }
  };

  const hasFilters = queryParams.search || queryParams.categoryId;

  return (
    <OnboardingGate>
      <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
        <DiscoveryHeader />

        {!hasFilters && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Sparkles className="text-brand" size={24} />
                <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                  Recommended for You
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-brand"
              >
                View Personalized <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-6 overflow-x-auto pb-8 pt-2 px-2 scrollbar-hide">
                {isLoadingRecs ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-[420px] aspect-4/3 rounded-[2.5rem] shrink-0"
                    />
                  ))
                ) : recommendations && recommendations.length > 0 ? (
                  recommendations.map((event) => (
                    <EventHeroCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="w-full py-12 flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                    <p className="text-sm font-bold uppercase tracking-widest">
                      Feed is being personalized...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <FilterBar
          onFilterChange={handleFilterChange}
          isLoading={isFetchingEvents}
        />

        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-gray-400" size={24} />
              <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                {hasFilters ? "Search Results" : "All Upcoming Events"}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>
                Showing{" "}
                {Array.isArray(eventsData?.data) ? eventsData.data.length : 0} Events
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-brand">Newest First</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingEvents && !eventsData ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-3xl" />
              ))
            ) : !Array.isArray(eventsData?.data) ||
              eventsData.data.length === 0 ? (
              <div className="lg:col-span-2 py-32 flex flex-col items-center justify-center text-center">
                <SearchX className="text-gray-300" size={40} />
                <h3 className="text-xl font-bold text-gray-900 mt-6">
                  No matching events
                </h3>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleFilterChange({ search: "", categoryId: null })
                  }
                  className="mt-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {eventsData.data.map((event) => (
                  <EventFeedCard key={event.id} event={event} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {eventsData && queryParams.page! < eventsData.meta.totalPages && (
            <div className="flex justify-center pt-12">
              <Button
                onClick={loadMore}
                disabled={isFetchingEvents}
                className="group h-12 px-10 rounded-2xl bg-white border border-gray-100 text-gray-900 font-black uppercase tracking-widest text-[10px] shadow-sm hover:border-brand hover:text-brand transition-all"
              >
                {isFetchingEvents ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "Discover More"
                )}
              </Button>
            </div>
          )}
        </section>
      </div>
    </OnboardingGate>
  );
}
