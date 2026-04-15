import { Settings, Users, Target, Info, Calendar } from "lucide-react";
import { InputController } from "@/components/shared/InputController";
import { useEventTypes } from "../../api/get-event-types";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";
import { EventType } from "../../types";

interface AdvancedConfigStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function AdvancedConfigStep({ data, onUpdate }: AdvancedConfigStepProps) {
  const { data: eventTypes } = useEventTypes();
  const selectedType = (eventTypes as EventType[])?.find((t) => t.id === data.eventTypeId);
  const isHackathon = selectedType?.name?.toUpperCase() === "HACKATHON";

  const handleUpdate = (field: keyof EventFormData["hackathonConfig"], value: string | number) => {
    onUpdate({ 
      hackathonConfig: { ...data.hackathonConfig, [field]: value } 
    });
  };

  return (
    <div className="space-y-12">
      {/* General Advanced Settings */}
      <WizardSection 
        icon={Settings} 
        title="Global Overrides" 
        subtitle="Custom configurations & rules"
      >
        {!isHackathon && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Settings className="text-gray-200" size={24} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center max-w-xs">No advanced settings required for this event type</p>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Configure your event from basics and move to review</p>
          </div>
        )}

        {/* Conditional Hackathon Settings */}
        {isHackathon && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-brand/5 rounded-xl border border-brand/10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center border-4 border-white shadow-lg shadow-brand/20">
                  <Target className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Hackathon Protocol</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Define your builder environment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-4">
                  <InputController
                    label="Min Team"
                    icon={Users}
                    type="number"
                    value={data.hackathonConfig?.teamSizeMin || 2}
                    onChange={(e) => handleUpdate("teamSizeMin", parseInt(e.target.value))}
                  />
                  <InputController
                    label="Max Team"
                    icon={Users}
                    type="number"
                    value={data.hackathonConfig?.teamSizeMax || 5}
                    onChange={(e) => handleUpdate("teamSizeMax", parseInt(e.target.value))}
                  />
                </div>

                <InputController
                   label="Submission Deadline"
                   icon={Calendar}
                   type="datetime-local"
                   value={data.hackathonConfig?.submissionDeadline}
                   onChange={(e) => handleUpdate("submissionDeadline", e.target.value)}
                />
              </div>

              <InputController
                label="Judging Criteria"
                icon={Info}
                value={data.hackathonConfig?.judgingCriteria}
                onChange={(e) => handleUpdate("judgingCriteria", e.target.value)}
                placeholder="How will projects be evaluated?"
                className="h-32 pt-3 items-start bg-white"
              />
            </div>
          </div>
        )}
      </WizardSection>
    </div>
  );
}
