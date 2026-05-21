"use client";

import { useState, useEffect } from "react";
import { InputController } from "@/components/shared/InputController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "../api/get-venues";
import { useEventTypes } from "../api/get-event-types";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { CemsButton } from "@/components/cems/CemsButton";
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

import { cn } from "@/lib/utils";
import { Event } from "../types";
import { 
  CemsDialog, 
  CemsDialogContent, 
  CemsDialogHeader, 
  CemsDialogTitle, 
  CemsDialogFooter,
  CemsDialogDescription
} from "@/components/cems/CemsDialog";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    setErrors({});
  }, [event, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.eventTypeId) newErrors.eventTypeId = "Category is required";
    if (!formData.venueId) newErrors.venueId = "Venue is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      ...formData,
      eventTypeId: formData.eventTypeId || undefined,
      venueId: formData.venueId || undefined,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };
    
    onSave(payload);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <CemsDialog open={open} onOpenChange={onOpenChange}>
      <CemsDialogContent size="xl">
        <CemsDialogHeader icon={<Calendar />}>
          <CemsDialogTitle>{event ? "Edit Campus Event" : "Create Campus Event"}</CemsDialogTitle>
          <CemsDialogDescription>Fill in the core details for your event discovery.</CemsDialogDescription>
        </CemsDialogHeader>
          
        <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-10">
          <motion.div 
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="space-y-12"
          >
            {/* Section 1: Basic Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center border border-brand/10 dark:border-brand/20">
                  <Info className="text-brand" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Discovery Info</h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Title & Categorization</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputController 
                  label="Event Title"
                  icon={Type}
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Annual Tech Symposium" 
                  error={errors.title}
                />
                
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 px-1">
                     <Tag size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors">Category</label>
                  </div>
                  <Select value={formData.eventTypeId} onValueChange={(val) => setFormData({...formData, eventTypeId: val ?? ""})}>
                    <SelectTrigger className={cn(
                      "h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-sm font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all w-full",
                      errors.eventTypeId && "border-red-200 ring-1 ring-red-100"
                    )}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl p-1 bg-white dark:bg-gray-900">
                      {eventTypes?.map(t => (
                        <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 dark:focus:bg-brand/10 focus:text-brand transition-colors">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.eventTypeId && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">{errors.eventTypeId}</p>}
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center gap-2 px-1">
                  <AlignLeft size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors">Detailed Description</label>
                </div>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Share the vision, goals, and what to expect..."
                  className="min-h-32 rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all font-semibold p-4"
                />
              </div>
            </motion.div>

            {/* Section 2: Logistics */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center border border-brand/10 dark:border-brand/20">
                  <MapPin className="text-brand" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Venue & Space</h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Location & Attendance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 px-1">
                     <MapPin size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors">Physical Venue</label>
                  </div>
                  <Select value={formData.venueId} onValueChange={(val) => setFormData({...formData, venueId: val ?? ""})}>
                    <SelectTrigger className={cn(
                      "h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-sm font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all w-full",
                      errors.venueId && "border-red-200 ring-1 ring-red-100"
                    )}>
                      <SelectValue placeholder="Choose a Location" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl p-1 bg-white dark:bg-gray-900">
                      {venues?.map(v => (
                        <SelectItem key={v.id} value={v.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 dark:focus:bg-brand/10 focus:text-brand transition-colors">
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venueId && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">{errors.venueId}</p>}
                </div>
                
                <InputController 
                  label="Max Capacity"
                  icon={Users}
                  type="number"
                  value={String(formData.capacity)} 
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} 
                />
              </div>
            </motion.div>
            
            {/* Section 3: Schedule */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center border border-brand/10 dark:border-brand/20">
                  <Calendar className="text-brand" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Timing</h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Schedule & Duration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputController 
                  label="Event Starts"
                  icon={Clock}
                  type="datetime-local"
                  value={formData.startTime} 
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                  error={errors.startTime}
                />
                
                <InputController 
                  label="Event Ends"
                  icon={Clock}
                  type="datetime-local"
                  value={formData.endTime} 
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                  error={errors.endTime}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <CemsDialogFooter >
          <CemsButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-lg font-bold text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all text-xs uppercase tracking-widest px-6 h-10 dark:bg-gray-900"
          >
            Cancel
          </CemsButton>
          <CemsButton
            cemsVariant="brand"
            onClick={handleSubmit}
            loading={isSaving}
            disabled={isSaving}
            className="rounded-lg font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-brand/20 transition-all active:scale-95 h-10"
          >
            {event ? "Update Event" : "Create Event"}
          </CemsButton>
        </CemsDialogFooter>
      </CemsDialogContent>
    </CemsDialog>
  );
}
