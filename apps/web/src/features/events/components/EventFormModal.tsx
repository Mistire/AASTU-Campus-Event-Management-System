import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ModalFooter } from "@/components/shared/ModalFooter";
import { InputController } from "@/components/shared/InputController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "../api/get-venues";
import { useEventTypes } from "../api/get-event-types";
import { Textarea } from "@/components/ui/textarea";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any | null; // The event to edit, null if creating
  onSave: (data: any) => void;
  isSaving?: boolean;
}

export function EventFormModal({
  open,
  onOpenChange,
  event,
  onSave,
  isSaving = false,
}: EventFormModalProps) {
  const { data: venues } = useVenues();
  const { data: eventTypes } = useEventTypes();
  console.log("MODAL VENUES =>", venues);
  console.log("MODAL EVENT TYPES =>", eventTypes);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventTypeId: "",
    venueId: "",
    startTime: "",
    endTime: "",
    capacity: 100,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        eventTypeId: event.eventType?.id || "",
        venueId: event.venue?.id || "",
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "",
        capacity: event.capacity || 100,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        eventTypeId: "", // In a real app we'd fetch event types
        venueId: "",
        startTime: "",
        endTime: "",
        capacity: 100,
      });
    }
  }, [event, open]);

  const handleSubmit = () => {
    // Basic validation
    if (!formData.title || !formData.venueId || !formData.startTime || !formData.endTime) {
      return; // Could show toast error here
    }
    
    const payload = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };
    
    
    if (!payload.eventTypeId) {
      // Simple validation bypass handling or notification could be added if needed.
    }
    
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm z-50" />
        <DialogContent 
          showCloseButton={false} 
          className="p-0 border-none rounded-xl gap-0 overflow-hidden shadow-2xl bg-white max-w-2xl sm:max-w-2xl w-full z-50"
        >
          <ModalHeader title={event ? "Edit Event" : "Create Event"} />
          
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">Event Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Event Title <span className="text-red-500">*</span></label>
                  <InputController 
                    value={formData.title || ""} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="Enter event title" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Event Type <span className="text-red-500">*</span></label>
                  <Select value={formData.eventTypeId || ""} onValueChange={(val) => setFormData({...formData, eventTypeId: val || ""})}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm">
                      <SelectValue placeholder="Select Type">
                        {eventTypes?.find(t => t.id === formData.eventTypeId)?.name || "Select Type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-medium text-gray-500">Description</label>
                 <Textarea 
                   value={formData.description || ""}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Enter detailed description"
                   className="resize-none h-24 bg-gray-50/50 border-gray-200"
                 />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">Location & Capacity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Venue <span className="text-red-500">*</span></label>
                  <Select value={formData.venueId || ""} onValueChange={(val) => setFormData({...formData, venueId: val || ""})}>
                    <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm">
                      <SelectValue placeholder="Select Venue">
                        {venues?.find(v => v.id === formData.venueId)?.name || "Select Venue"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {venues?.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Capacity <span className="text-red-500">*</span></label>
                  <InputController 
                    type="number"
                    value={String(formData.capacity ?? "")} 
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Start Time <span className="text-red-500">*</span></label>
                  <InputController 
                    type="datetime-local"
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">End Time <span className="text-red-500">*</span></label>
                  <InputController 
                    type="datetime-local"
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            
          </div>
          
          <ModalFooter 
            onSave={handleSubmit} 
            onCancel={() => onOpenChange(false)} 
            isSubmitting={isSaving}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
