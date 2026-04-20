import { CheckCircle2, MapPin, Layers, Info, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";
import { useCategories, Category } from "@/features/categories/api";
import { useTags, Tag as TagType } from "@/features/tags/api";
import { useVenues } from "@/features/events/api/get-venues";
import { useEventTypes } from "@/features/events/api/get-event-types";
import { Venue, EventType } from "@/features/events/types";

interface ReviewStepProps {
  data: EventFormData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const { data: venues } = useVenues();
  const { data: eventTypes } = useEventTypes();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    try {
      return format(new Date(dateStr), "PPP 'at' p");
    } catch {
      return dateStr;
    }
  };

  const getCategoryName = (id: string) => {
    return categories?.find((c: Category) => c.id === id)?.name || id;
  };

  const getTagName = (id: string) => {
    return tags?.find((t: TagType) => t.id === id)?.name || id;
  };

  const getVenueName = (id: string) => {
    return venues?.find((v: Venue) => v.id === id)?.name || "Location TBD";
  };

  const getEventTypeName = (id: string) => {
    return eventTypes?.find((e: EventType) => e.id === id)?.name || "Standard Event";
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center justify-center py-10 bg-brand/5 border border-brand/10 rounded-xl text-center">
        <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-brand/20 border-4 border-brand/10 mb-6 group animate-bounce">
          <CheckCircle2 className="text-brand" size={40} />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Ready for Launch?</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs">Please review your event protocol before initialization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Basic Info Summary */}
        <WizardSection 
          icon={Info} 
          title="Discovery & Schedule" 
          subtitle="Core event details"
          className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6"
        >
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Event Title</p>
              <p className="text-sm font-black text-gray-900 mt-1">{data.title || "Untitled Event"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Event Type</p>
                <Badge variant="outline" className="mt-1 bg-brand/5 text-brand border-brand/10 text-[9px] font-black rounded-lg py-0.5">
                  {getEventTypeName(data.eventTypeId)}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Venue</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={10} className="text-brand" />
                  <p className="text-[11px] font-bold text-gray-600 truncate">{getVenueName(data.venueId)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Timing</p>
                <p className="text-[11px] font-bold text-gray-600 mt-1">{formatDate(data.startTime)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Capacity</p>
                <p className="text-[11px] font-bold text-gray-600 mt-1">{data.capacity} Participants</p>
              </div>
            </div>
            {data.requiresApproval && (
              <Badge className="bg-brand/5 text-brand border-brand/10 text-[9px] font-black rounded-lg py-1 px-3">
                <CheckCircle2 size={10} className="mr-1" />
                MANUAL APPROVAL ENABLED
              </Badge>
            )}
          </div>
        </WizardSection>

        {/* Categorization Summary */}
        <WizardSection 
          icon={Tag} 
          title="Taxonomy & Tags" 
          subtitle="Search & discoverability"
          className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6"
        >
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Categories Selected</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.categoryIds && data.categoryIds.length > 0 ? (
                  data.categoryIds.map((id) => (
                    <Badge key={id} variant="secondary" className="bg-brand/5 text-brand border-brand/20 text-[10px] font-black rounded-lg">
                      {getCategoryName(id)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-gray-300 uppercase">No categories</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Tags Applied</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tagIds && data.tagIds.length > 0 ? (
                  data.tagIds.map((id) => (
                    <Badge key={id} variant="outline" className="border-gray-200 text-gray-500 text-[10px] font-black rounded-lg">
                      {getTagName(id)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-gray-300 uppercase">No tags</p>
                )}
              </div>
            </div>
          </div>
        </WizardSection>

        {/* Agenda Summary */}
        <WizardSection 
          icon={Layers} 
          title={`Project Agenda (${data.sessions?.length || 0})`} 
          subtitle="Detailed session breakdown"
          className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6 md:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.sessions?.map((session, i) => (
              <div key={session.id || i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-brand uppercase tracking-tighter">Session {i+1}</p>
                <p className="text-[11px] font-black text-gray-900 mt-1 truncate">{session.title || "Untitled"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin size={10} className="text-gray-300" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase">{session.location || "Venue TBD"}</p>
                </div>
              </div>
            ))}
            {(!data.sessions || data.sessions.length === 0) && (
              <p className="text-[10px] font-bold text-gray-300 uppercase md:col-span-3 pb-4">No sessions defined</p>
            )}
          </div>
        </WizardSection>
      </div>
    </div>
  );
}
