"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Tag, 
  Layers, 
  Settings, 
  Eye,
  Lock,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateEvent } from "@/features/events/api/mutations";
import { ToastController } from "@/components/shared/ToastController";
import { useEventTypes } from "@/features/events/api/get-event-types";

// Step Components
import { BasicInfoStep } from "@/features/events/components/steps/BasicInfoStep";
import { CategorizationStep } from "@/features/events/components/steps/CategorizationStep";
import { SessionsStep } from "@/features/events/components/steps/SessionsStep";
import { AdvancedConfigStep } from "@/features/events/components/steps/AdvancedConfigStep";
import { AccessStep } from "@/features/events/components/steps/AccessStep";
import { MediaStep } from "@/features/events/components/steps/MediaStep";
import { ReviewStep } from "@/features/events/components/steps/ReviewStep";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Schedule & Details", icon: Calendar },
  { id: 2, title: "Categories", description: "Tags & Topics", icon: Tag },
  { id: 3, title: "Agenda", description: "Event Sessions", icon: Layers },
  { id: 4, title: "Config", description: "Advanced Settings", icon: Settings },
  { id: 5, title: "Access", description: "Visibility & Invites", icon: Lock },
  { id: 6, title: "Media", description: "Visual Identity", icon: ImageIcon },
  { id: 7, title: "Review", description: "Complete Setup", icon: Eye },
];

export interface EventFormData {
  title: string;
  description: string;
  eventTypeId: string;
  venueId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  requiresApproval: boolean;
  categoryIds: string[];
  tagIds: string[];
  sessions: {
    id?: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    sessionType: string;
    speakers: string[];
  }[];
  hackathonConfig: {
    teamSizeMin: number;
    teamSizeMax: number;
    submissionDeadline: string;
    judgingCriteria: string;
  };
  accessType: string;
  invites: string[];
  thumbnailUrl: string;
  guestLimitPerUser?: number;
}

export function EventCreateWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventTypeId: "",
    venueId: "",
    startTime: "",
    endTime: "",
    capacity: 100,
    requiresApproval: false,
    categoryIds: [],
    tagIds: [],
    sessions: [],
    hackathonConfig: {
      teamSizeMin: 2,
      teamSizeMax: 5,
      submissionDeadline: "",
      judgingCriteria: ""
    },
    accessType: "PUBLIC",
    invites: [],
    thumbnailUrl: "",
    guestLimitPerUser: 0,
  });

  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const { data: eventTypes } = useEventTypes();

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.description && formData.eventTypeId && formData.venueId && formData.startTime && formData.endTime);
      case 2:
        return formData.categoryIds.length > 0;
      case 3:
        // All sessions must have title and times if added
        return formData.sessions.every((s) => s.title && s.startTime && s.endTime);
      case 4:
        // If it's a hackathon, check config
        const selectedType = eventTypes?.find(t => t.id === formData.eventTypeId);
        if (selectedType?.name?.toUpperCase() === "HACKATHON") {
          return !!(formData.hackathonConfig.submissionDeadline && formData.hackathonConfig.judgingCriteria);
        }
        return true;
      case 5:
        if (formData.accessType === "INVITE_ONLY") {
          return formData.invites.length > 0;
        }
        return true;
      case 6:
        return !!formData.thumbnailUrl;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleCreateEvent = async () => {
    const toastId = ToastController.loading({ 
      message: "Initializing Event Protocol", 
      description: "Writing records to the blockchain of truth..." 
    });

    try {
      // Find selected event type
      const selectedType = eventTypes?.find(t => t.id === formData.eventTypeId);
      const typeName = selectedType?.name?.toUpperCase() || "";
      const isHackathon = typeName === "HACKATHON";
      const isGraduation = typeName === "GRADUATION";

      // Prepare payload
      const payload = {
        ...formData,
        thumbnailUrl: formData.thumbnailUrl,
        // Ensure numbers are numbers
        capacity: Number(formData.capacity),
        // Clean sessions (remove temporary IDs if they exist)
        sessions: formData.sessions.map((s) => ({
          title: s.title,
          description: s.description,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          sessionType: s.sessionType,
          speakers: s.speakers
        })),
        // Only include hackathon config if it's a hackathon
        hackathonConfig: isHackathon ? formData.hackathonConfig : undefined,
        // Only include guest limit if it's graduation (or explicitly set)
        guestLimitPerUser: (isGraduation || (formData.guestLimitPerUser ?? 0) > 0) ? Number(formData.guestLimitPerUser) : undefined,
        accessType: formData.accessType,
        invites: formData.invites
      };

      await createEventMutation.mutateAsync(payload);
      
      ToastController.dismiss(toastId);
      ToastController.success({ 
        message: "Event Initialized", 
        description: "Your masterpiece is now live in the system." 
      });
      
      router.push("/dashboard/events");
    } catch (err) {
      ToastController.dismiss(toastId);
      ToastController.error({ 
        message: "Initialization Failed", 
        description: err instanceof Error ? err.message : "An unexpected error occurred during event creation." 
      });
      console.error("Event creation error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Stepper Header */}
      <div className="hidden sm:flex items-center justify-between mb-12 relative px-4">
        {/* Connection Line */}
        <div className="absolute top-5 left-8 right-8 h-px bg-gray-100 -z-10" />
        <div 
          className="absolute top-5 left-8 h-px bg-brand transition-all duration-500 ease-in-out -z-10" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative">
              <div 
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                  isActive 
                    ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-110" 
                    : isCompleted 
                      ? "bg-white border-brand text-brand" 
                      : "bg-white border-gray-100 text-gray-300"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-gray-900" : "text-gray-400"
                )}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper Info */}
      <div className="sm:hidden mb-8 border-b border-gray-100 pb-4">
        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">
          Step {currentStep} of {STEPS.length}
        </p>
        <h2 className="text-lg font-black text-gray-900">{STEPS[currentStep-1].title}</h2>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {currentStep === 1 && <BasicInfoStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 2 && <CategorizationStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 3 && <SessionsStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 4 && <AdvancedConfigStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 5 && <AccessStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 6 && <MediaStep data={formData} onUpdate={updateFormData} />}
            {currentStep === 7 && <ReviewStep data={formData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="rounded-lg font-bold text-xs uppercase tracking-widest h-12 px-8 border-gray-100 hover:bg-gray-50 transition-all disabled:opacity-30"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-lg bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-brand/20 transition-all active:scale-95 disabled:opacity-50"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateEvent}
            disabled={createEventMutation.isPending || !isStepValid()}
            className="rounded-lg bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-widest h-12 px-10 shadow-xl shadow-brand/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
