"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ModalFooter } from "@/components/shared/ModalFooter";
import { InputController } from "@/components/shared/InputController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "../api/get-venues";
import { useEventTypes } from "../api/get-event-types";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Type, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  AlignLeft, 
  Tag, 
  Info 
} from "lucide-react";

import { Event } from "../types";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
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
        eventTypeId: "",
        venueId: "",
        startTime: "",
        endTime: "",
        capacity: 100,
      });
    }
  }, [event, open]);

  const handleSubmit = () => {
    if (!formData.title || !formData.venueId || !formData.startTime || !formData.endTime) {
      return;
    }
    
    const payload = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };
    
    onSave(payload);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-md z-50 animate-in fade-in duration-300" />
        <DialogContent 
          showCloseButton={false} 
          className="p-0 border-none rounded-[2.5rem] gap-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] bg-white max-w-2xl sm:max-w-2xl w-full z-50 animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh] overflow-hidden"
        >
          <ModalHeader title={event ? "Edit Event" : "Create Event"} />
          
          <div className="flex-1 overflow-y-auto min-h-0 p-10 space-y-10">
            <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="space-y-12"
            >
              {/* Section 1: Event Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center border border-brand/10">
                    <Info className="text-brand" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Discovery Info</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Title & Categorization</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputController 
                    label="Event Title"
                    icon={Type}
                    value={formData.title || ""} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Annual Tech Symposium" 
                  />
                  
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 px-1">
                       <Tag size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors">Category</label>
                    </div>
                    <Select value={formData.eventTypeId || ""} onValueChange={(val) => setFormData({...formData, eventTypeId: val || ""})}>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 rounded-xl text-sm font-semibold focus:bg-white transition-all shadow-sm shadow-gray-200/20">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                        {eventTypes?.map(t => (
                          <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 focus:text-brand transition-colors">{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <InputController 
                  label="Detailed Description"
                  icon={AlignLeft}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Share the vision, goals, and what to expect..."
                  className="h-32 pt-3 items-start"
                />
              </motion.div>

              {/* Section 2: Location & Capacity */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center border border-brand/10">
                    <MapPin className="text-brand" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Venue & Space</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Location & Attendance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2 px-1">
                       <MapPin size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors">Physical Venue</label>
                    </div>
                    <Select value={formData.venueId || ""} onValueChange={(val) => setFormData({...formData, venueId: val || ""})}>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 rounded-xl text-sm font-semibold focus:bg-white transition-all shadow-sm shadow-gray-200/20">
                        <SelectValue placeholder="Choose a Location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1">
                        {venues?.map(v => (
                          <SelectItem key={v.id} value={v.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 focus:text-brand transition-colors">{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <InputController 
                    label="Max Capacity"
                    icon={Users}
                    type="number"
                    value={String(formData.capacity ?? "")} 
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </motion.div>
              
              {/* Section 3: Schedule */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center border border-brand/10">
                    <Calendar className="text-brand" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Timing</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Schedule & Duration</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputController 
                    label="Event Starts"
                    icon={Clock}
                    type="datetime-local"
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                    className="cursor-pointer"
                  />
                  
                  <InputController 
                    label="Event Ends"
                    icon={Clock}
                    type="datetime-local"
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                    className="cursor-pointer"
                  />
                </div>
              </motion.div>
            </motion.div>
            
          </div>
          
          <ModalFooter 
            onSave={handleSubmit} 
            onCancel={() => onOpenChange(false)} 
            isSubmitting={isSaving}
            saveText={event ? "Update Event" : "Create Event"}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
