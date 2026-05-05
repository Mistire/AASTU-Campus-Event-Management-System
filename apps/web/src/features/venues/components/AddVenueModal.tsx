"use client";

import { useState } from "react";
import { MapPin, Building2, Users, Info, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateVenue } from "../api";
import { ToastController } from "@/components/shared/ToastController";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ModalFooter } from "@/components/shared/ModalFooter";
import { InputController } from "@/components/shared/InputController";
import { Textarea } from "@/components/ui/textarea";

interface AddVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVenueModal({ open, onOpenChange }: AddVenueModalProps) {
  const createVenue = useCreateVenue();

  const [formData, setFormData] = useState({
    name: "",
    building: "",
    roomNumber: "",
    capacity: "100",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Valid capacity is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createVenue.mutateAsync({
        name: formData.name,
        building: formData.building,
        roomNumber: formData.roomNumber,
        capacity: parseInt(formData.capacity),
        description: formData.description,
      });

      ToastController.success({ message: "Venue created successfully" });
      setFormData({
        name: "",
        building: "",
        roomNumber: "",
        capacity: "100",
        description: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      ToastController.error({
        message: error.message || "Failed to create venue",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 border-none bg-transparent shadow-none max-w-lg"
      >
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <ModalHeader title="Add New Venue" />

          <div className="p-8 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <InputController
                  label="Venue Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. Samsung Hall"
                  icon={MapPin}
                />
              </div>

              {/* Building */}
              <InputController
                label="Building / Block"
                name="building"
                value={formData.building}
                onChange={handleChange}
                placeholder="e.g. Block 24"
                icon={Building2}
              />

              {/* Room Number */}
              <InputController
                label="Room Number"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g. Room 102"
              />

              {/* Capacity */}
              <InputController
                label="Capacity (People)"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                error={errors.capacity}
                placeholder="e.g. 500"
                icon={Users}
              />

              {/* Description */}
              <div className="md:col-span-2 space-y-2 group">
                <div className="flex items-center gap-2 px-1">
                  <Info
                    size={12}
                    className="text-brand/50 group-focus-within:text-brand transition-colors"
                  />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors">
                    Description
                  </label>
                </div>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Any special notes about the venue (e.g. has projector, AC)..."
                  className="min-h-[100px] rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-semibold resize-none pr-4"
                />
              </div>
            </div>
          </div>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            saveText="Create Venue"
            isSubmitting={createVenue.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
