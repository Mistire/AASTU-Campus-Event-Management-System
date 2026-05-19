"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUpdateMyProfile } from "../api/profile";
import { 
  CemsDialog,
  CemsDialogContent,
  CemsDialogHeader,
  CemsDialogTitle,
  CemsDialogDescription,
  CemsDialogFooter
} from "@/components/cems/CemsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Loader2, Save, Camera, Edit2, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile } = useAuthStore();
  const updateProfile = useUpdateMyProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.profileImage as string || null);

  // Sync state when profile changes or modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullName: profile.full_name || "",
        phone: profile.phone || "",
      });
      setPreviewUrl(profile.profileImage as string || null);
      setSelectedFile(null);
    }
  }, [isOpen, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let uploadedUrl = profile?.profileImage as string;

      if (selectedFile) {
        toast.loading("Uploading image to Cloudinary...", { id: "profile-update" });
        uploadedUrl = await uploadToCloudinary(selectedFile);
      }

      await updateProfile.mutateAsync({
        ...formData,
        profileImage: uploadedUrl
      });
      
      toast.success("Profile updated successfully", { id: "profile-update" });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile", { id: "profile-update" });
    }
  };

  return (
    <CemsDialog open={isOpen} onOpenChange={onClose}>
      <CemsDialogContent size="md">
        <CemsDialogHeader icon={<Edit2 />}>
            <CemsDialogTitle>Edit Profile</CemsDialogTitle>
            <CemsDialogDescription>
                Update your identity and contact information
            </CemsDialogDescription>
        </CemsDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4 pb-4 border-b border-gray-50 dark:border-gray-800">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand/30 group-hover:shadow-xl shadow-brand/5">
                        {previewUrl ? (
                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                        ) : (
                            <User size={32} className="text-gray-300 dark:text-gray-600" />
                        )}
                        <div className="absolute inset-0 bg-brand/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-brand rounded-lg text-white shadow-lg border-2 border-white dark:border-gray-900">
                        <Camera size={12} />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Profile Picture</p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">Click to upload new image</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
                  <Input 
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="pl-12 h-14 rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-brand/50 transition-all font-bold text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Phone Number
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 (00) 000-0000"
                    className="pl-12 h-14 rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-brand/5 transition-all font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <CemsDialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-lg font-bold text-xs h-12"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="rounded-lg bg-brand text-white font-bold text-xs h-12 px-8 shadow-lg shadow-brand/20 hover:shadow-xl transition-all"
            >
              {updateProfile.isPending ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <Save className="mr-2" size={16} />
              )}
              Save Changes
            </Button>
          </CemsDialogFooter>
        </form>
      </CemsDialogContent>
    </CemsDialog>
  );
}
