import { Info, Type, AlignLeft, MapPin, Users, Calendar, Clock, Lock } from "lucide-react";
import { InputController } from "@/components/shared/InputController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVenues } from "../../api/get-venues";
import { useEventTypes } from "../../api/get-event-types";
import { cn } from "@/lib/utils";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";
import { Venue, EventType } from "../../types";

interface BasicInfoStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const { data: venues, isLoading: loadingVenues } = useVenues();
  const { data: eventTypes, isLoading: loadingTypes } = useEventTypes();

  const handleUpdate = (field: keyof EventFormData, value: string | number | boolean | string[] | null | undefined) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-12">
      {/* Discovery Section */}
      <WizardSection 
        icon={Info} 
        title="Discovery Info" 
        subtitle="Title & Categorization"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputController
            label="Event Title"
            icon={Type}
            value={data.title}
            onChange={(e) => handleUpdate("title", e.target.value)}
            placeholder="e.g. Annual Tech Symposium"
          />

          <div className="space-y-2 group">
            <div className="flex items-center gap-2 px-1">
              <Lock size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors">Event Type</label>
            </div>
            <Select 
              value={data.eventTypeId} 
              onValueChange={(val) => handleUpdate("eventTypeId", val)}
              disabled={loadingTypes}
            >
              <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 rounded-xl text-sm font-semibold focus:bg-white transition-all shadow-sm shadow-gray-200/20">
                <SelectValue placeholder={loadingTypes ? "Loading types..." : "Choose Type"}>
                  {(eventTypes as EventType[])?.find((t) => t.id === data.eventTypeId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent sideOffset={4} className="rounded-xl border-gray-100 shadow-2xl p-1 w-(--radix-select-trigger-width)">
                {(eventTypes as EventType[])?.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 focus:text-brand transition-colors">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <InputController
          label="Detailed Description"
          icon={AlignLeft}
          value={data.description}
          onChange={(e) => handleUpdate("description", e.target.value)}
          placeholder="Share the vision, goals, and what to expect..."
          className="h-32 pt-3 items-start"
        />
      </WizardSection>

      {/* Logistics Section */}
      <WizardSection 
        icon={MapPin} 
        title="Logistics" 
        subtitle="Venue & Capacity"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 group">
            <div className="flex items-center gap-2 px-1">
              <MapPin size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors">Physical Venue</label>
            </div>
            <Select 
              value={data.venueId} 
              onValueChange={(val) => handleUpdate("venueId", val)}
              disabled={loadingVenues}
            >
              <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 rounded-xl text-sm font-semibold focus:bg-white transition-all shadow-sm shadow-gray-200/20">
                <SelectValue placeholder={loadingVenues ? "Loading venues..." : "Choose Location"}>
                  {(venues as Venue[])?.find((v) => v.id === data.venueId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent sideOffset={4} className="rounded-xl border-gray-100 shadow-2xl p-1 w-(--radix-select-trigger-width)">
                {(venues as Venue[])?.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 focus:text-brand transition-colors">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <InputController
            label="Max Capacity"
            icon={Users}
            type="number"
            value={data.capacity}
            onChange={(e) => handleUpdate("capacity", parseInt(e.target.value))}
          />
        </div>
      </WizardSection>

      {/* Timing & Security */}
      <WizardSection 
        icon={Clock} 
        title="Schedule & Security" 
        subtitle="Timing & Approval Rules"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputController
            label="Event Starts"
            icon={Calendar}
            type="datetime-local"
            value={data.startTime}
            onChange={(e) => handleUpdate("startTime", e.target.value)}
          />
          <InputController
            label="Event Ends"
            icon={Clock}
            type="datetime-local"
            value={data.endTime}
            onChange={(e) => handleUpdate("endTime", e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
          <Checkbox 
            id="requires-approval" 
            checked={data.requiresApproval}
            onCheckedChange={(checked) => handleUpdate("requiresApproval", !!checked)}
            className="w-5 h-5 rounded-lg border-gray-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
          />
          <div className="flex flex-col">
            <label 
              htmlFor="requires-approval"
              className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer"
            >
              Manual Registration Approval
            </label>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Organizers must review each participant request</p>
          </div>
        </div>
      </WizardSection>
    </div>
  );
}
