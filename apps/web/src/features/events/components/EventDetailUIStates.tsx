"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function EventDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8 space-y-8">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function EventErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <span className="flex items-center justify-center w-full h-full">
          <Info size={40} className="text-red-500" />
        </span>
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
