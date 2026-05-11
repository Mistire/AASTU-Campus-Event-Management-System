"use client";

import { EventCreateWizard } from "@/features/events/components/EventCreateWizard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventCreatePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">
            Create New Event
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Fill in the details below to initialize your campus event.
          </p>
        </div>
      </div>

      {/* Main Wizard */}
      <div className="bg-white rounded-lg p-4 sm:p-10 shadow-sm border border-gray-100">
        <EventCreateWizard />
      </div>
    </div>
  );
}
