import { Plus, Trash2, Clock, MapPin, Layers, Info, Calendar, Users } from "lucide-react";
import { InputController } from "@/components/shared/InputController";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";

interface SessionsStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function SessionsStep({ data, onUpdate }: SessionsStepProps) {
  const sessions = data.sessions || [];

  const addSession = () => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
      
    const newSession = {
      id: newId,
      title: "",
      description: "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      location: "",
      sessionType: "WORKSHOP",
      speakers: []
    };
    onUpdate({ sessions: [...sessions, newSession] });
  };

  const removeSession = (id: string) => {
    onUpdate({ sessions: sessions.filter((s) => s.id !== id) });
  };

  const updateSession = (id: string, field: keyof EventFormData["sessions"][number], value: string | string[]) => {
    const updated = sessions.map((s) => 
      s.id === id ? { ...s, [field]: value } : s
    );
    onUpdate({ sessions: updated });
  };

  return (
    <div className="space-y-12">
      <WizardSection 
        icon={Layers} 
        title="Project Agenda" 
        subtitle="Define sessions, workshops & keynotes"
      >
        <div className="flex justify-end -mt-16 sm:mt-0 relative z-10">
          <Button
            type="button"
            onClick={addSession}
            className="rounded-lg bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-widest h-11 px-6 shadow-lg shadow-brand/20 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>

        <div className="space-y-8 mt-6">
          <AnimatePresence mode="popLayout">
            {sessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/30"
              >
                <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                  <Layers className="text-gray-300" size={24} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No sessions defined yet</p>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Start by adding your first event activity</p>
              </motion.div>
            ) : (
              sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 pb-10 bg-white rounded-lg border border-gray-100 shadow-sm relative group"
                >
                  <div className="absolute -top-3 left-8 bg-brand text-white text-[10px] font-black px-4 py-1 rounded-lg uppercase tracking-tighter shadow-md">
                    Session {index + 1}
                  </div>

                  <div className="absolute top-6 right-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSession(session.id!)}
                      className="h-10 w-10 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <InputController
                      label="Session Theme"
                      icon={Info}
                      value={session.title || ""}
                      onChange={(e) => updateSession(session.id!, "title", e.target.value)}
                      placeholder="e.g. Masterclass: Product Strategy"
                    />
                    <InputController
                      label="Venue / Room"
                      icon={MapPin}
                      value={session.location || ""}
                      onChange={(e) => updateSession(session.id!, "location", e.target.value)}
                      placeholder="e.g. Room 402 or Online"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <InputController
                      label="Start Time"
                      icon={Calendar}
                      type="datetime-local"
                      value={session.startTime || ""}
                      onChange={(e) => updateSession(session.id!, "startTime", e.target.value)}
                    />
                    <InputController
                      label="End Time"
                      icon={Clock}
                      type="datetime-local"
                      value={session.endTime || ""}
                      onChange={(e) => updateSession(session.id!, "endTime", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4 mt-8">
                    <div className="flex items-center gap-2 px-1">
                      <Users size={12} className="text-brand/50" />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Speakers</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(session.speakers || []).map((speaker, sIndex) => (
                        <div key={sIndex} className="flex items-center gap-2 bg-brand/5 border border-brand/10 px-3 py-1.5 rounded-lg group/speaker transition-all hover:bg-brand/10">
                          <span className="text-xs font-bold text-brand">{speaker}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const newSpeakers = session.speakers!.filter((_, i) => i !== sIndex);
                              updateSession(session.id!, "speakers", newSpeakers);
                            }}
                            className="text-brand/30 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <InputController
                          placeholder="Speaker name..."
                          className="h-10 text-xs w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const name = (e.target as HTMLInputElement).value.trim();
                              if (name) {
                                const current = session.speakers || [];
                                updateSession(session.id!, "speakers", [...current, name]);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Press Enter to add</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-8">
                    <InputController
                      label="Session Context"
                      icon={Plus}
                      value={session.description || ""}
                      onChange={(e) => updateSession(session.id!, "description", e.target.value)}
                      placeholder="Provide context for this specific session..."
                      className="h-24 pt-3 items-start"
                    />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </WizardSection>
    </div>
  );
}
