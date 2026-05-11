"use client";

import { useState } from "react";
import { GraduationCap, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useCreateDepartment } from "../api";
import { ToastController } from "@/components/shared/ToastController";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ModalFooter } from "@/components/shared/ModalFooter";
import { InputController } from "@/components/shared/InputController";

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDepartmentModal({ open, onOpenChange }: AddDepartmentModalProps) {
  const createDepartment = useCreateDepartment();
  
  const [formData, setFormData] = useState({
    name: "",
    faculty: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Department name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createDepartment.mutateAsync({
        name: formData.name,
        faculty: formData.faculty,
      });
      
      ToastController.success({ message: "Department created successfully" });
      setFormData({
        name: "",
        faculty: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      ToastController.error({ 
        message: error.message || "Failed to create department" 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-md">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
          <ModalHeader title="Add New Department" />
          
          <div className="p-8 space-y-6">
            <InputController
              label="Department Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Software Engineering"
              icon={GraduationCap}
            />

            <InputController
              label="Faculty / College"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g. College of Electrical & Mechanical"
              icon={Building}
            />
          </div>

          <ModalFooter 
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            saveText="Create Department"
            isSubmitting={createDepartment.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
