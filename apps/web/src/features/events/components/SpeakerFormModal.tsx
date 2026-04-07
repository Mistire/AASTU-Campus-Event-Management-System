"use client";

import { useState } from "react";
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
import { useCreateSpeaker } from "../api/mutations";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

interface SpeakerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpeakerFormValues {
  fullName: string;
  bio: string;
  organization: string;
  profileImage: string;
}

export function SpeakerFormModal({ isOpen, onClose }: SpeakerFormModalProps) {
  const createSpeaker = useCreateSpeaker();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SpeakerFormValues>();

  const onSubmit = async (data: SpeakerFormValues) => {
    try {
      await createSpeaker.mutateAsync(data);
      toast.success("Speaker profile created successfully!");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create speaker profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-brand px-8 py-10 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              Create <span className="text-white/80 underline decoration-white/30 underline-offset-8">Speaker</span> profile
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
              Add a new expert to the campus event network
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Dr. Jane Doe"
                className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-brand"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Organization / Affiliation</Label>
              <Input
                id="organization"
                placeholder="AASTU Computer Science Dept."
                className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-brand"
                {...register("organization")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile Image URL</Label>
              <Input
                id="profileImage"
                placeholder="https://example.com/avatar.jpg"
                className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-brand"
                {...register("profileImage")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Biography</Label>
              <Textarea
                id="bio"
                placeholder="Short bio about the speaker's expertise and background..."
                className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-brand min-h-[100px] resize-none"
                {...register("bio")}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-50">
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
              disabled={createSpeaker.isPending}
              className="rounded-xl bg-brand hover:bg-brand-hover text-white px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all"
            >
              {createSpeaker.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <span className="flex items-center gap-2">
                  Create Profile <UserPlus size={14} />
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
