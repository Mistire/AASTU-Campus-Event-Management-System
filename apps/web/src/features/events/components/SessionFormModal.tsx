"use client";

import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateSession } from "../api/mutations";
import { useSpeakers } from "../api/get-speakers";
import { toast } from "sonner";
import { Loader2, CalendarPlus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionFormModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  eventStartTime: string;
  eventEndTime: string;
}

interface SessionFormValues {
  title: string;
  description: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  location: string;
  speakerIds: string[];
}

const SESSION_TYPES = ["KEYNOTE", "WORKSHOP", "PANEL", "TALK", "BREAK", "NETWORKING", "OTHER"];

export function SessionFormModal({ 
  eventId, 
  isOpen, 
  onClose,
  eventStartTime,
  eventEndTime 
}: SessionFormModalProps) {
  const createSession = useCreateSession(eventId);
  const { data: speakersData, isLoading: isLoadingSpeakers } = useSpeakers();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SessionFormValues>({
    defaultValues: {
        speakerIds: []
    }
  });

  const selectedSpeakerIds = watch("speakerIds");

  const onSubmit = async (data: SessionFormValues) => {
    // Basic validation for event window
    const sTime = new Date(data.startTime);
    const eTime = new Date(data.endTime);
    const eventS = new Date(eventStartTime);
    const eventE = new Date(eventEndTime);

    if (sTime < eventS || eTime > eventE) {
        toast.error("Session must be within the event timeframe");
        return;
    }

    if (eTime <= sTime) {
        toast.error("End time must be after start time");
        return;
    }

    try {
      await createSession.mutateAsync(data);
      toast.success("Agenda item created successfully!");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create agenda item");
    }
  };

  const toggleSpeaker = (id: string) => {
    const current = selectedSpeakerIds || [];
    if (current.includes(id)) {
        setValue("speakerIds", current.filter(sid => sid !== id));
    } else {
        setValue("speakerIds", [...current, id]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
        <div className="bg-brand px-10 py-12 text-white relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-4xl font-black tracking-tight leading-none">
              Add <span className="text-white/80 underline underline-offset-8 decoration-white/20">Agenda</span> item
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs font-bold uppercase tracking-widest mt-4">
              Design the flow of your campus event
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Basic Info */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Title</Label>
                    <Input
                        placeholder="Opening Keynote..."
                        className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-brand"
                        {...register("title", { required: "Title is required" })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Start Time</Label>
                        <Input
                            type="datetime-local"
                            className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-brand"
                            {...register("startTime", { required: "Required" })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">End Time</Label>
                        <Input
                            type="datetime-local"
                            className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-brand"
                            {...register("endTime", { required: "Required" })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Type</Label>
                    <select
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 h-12 px-4 text-sm font-medium focus:ring-brand focus:border-brand"
                        {...register("sessionType")}
                    >
                        {SESSION_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Location</Label>
                    <Input
                        placeholder="Conference Room B-1"
                        className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 focus-visible:ring-brand"
                        {...register("location")}
                    />
                </div>
            </div>

            {/* Right side: Speaker selection  */}
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-between">
                    <span>Assign Speakers</span>
                    <span className="text-brand truncate ml-2">Selected: {selectedSpeakerIds?.length}</span>
                </Label>
                <div className="h-[280px] overflow-y-auto border border-gray-100 rounded-3xl p-4 bg-gray-50/20 space-y-2">
                    {isLoadingSpeakers ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-brand/20" size={32} />
                        </div>
                    ) : Array.isArray(speakersData) && speakersData.length > 0 ? (
                        speakersData.map(speaker => (
                            <div 
                                key={speaker.id}
                                onClick={() => toggleSpeaker(speaker.id)}
                                className={cn(
                                    "p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3",
                                    selectedSpeakerIds?.includes(speaker.id)
                                        ? "bg-brand/5 border-brand/20 ring-1 ring-brand/10"
                                        : "bg-white border-transparent hover:bg-gray-50"
                                )}
                            >
                                <div className="w-8 h-8 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                    {speaker.profileImage ? (
                                        <img src={speaker.profileImage} alt={speaker.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-black text-gray-400">{speaker.fullName[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 truncate">{speaker.fullName}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase truncate">{speaker.organization || "No organization"}</p>
                                </div>
                                {selectedSpeakerIds?.includes(speaker.id) && (
                                    <CheckCircle2 className="text-brand shrink-0" size={14} />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-xs text-gray-400 py-10">No speakers found. Create one first!</p>
                    )}
                </div>
                <Textarea 
                    placeholder="Brief agenda description..."
                    className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[80px] resize-none focus-visible:ring-brand"
                    {...register("description")}
                />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-50">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSession.isPending}
              className="rounded-xl bg-brand hover:bg-brand-hover text-white px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand/20 active:scale-95 transition-all"
            >
              {createSession.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <span className="flex items-center gap-2">
                  Create Agenda Item <CalendarPlus size={14} />
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
