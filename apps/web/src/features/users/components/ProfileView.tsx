"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUpdateMyProfile } from "../api/profile";
import {
  User,
  Mail,
  ShieldCheck,
  MapPin,
  Phone,
  Edit2,
  Camera,
  LogOut,
  Calendar,
  Verified,
  Award,
  Fingerprint,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserInterests } from "./UserInterests";
import { EditProfileModal } from "./EditProfileModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function ProfileView() {
  const { profile, clearAuth } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateProfile = useUpdateMyProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading("Uploading to Cloudinary...", { id: "profile-upload" });
        
        const uploadedUrl = await uploadToCloudinary(file);
        
        await updateProfile.mutateAsync({ profileImage: uploadedUrl });
        
        toast.success("Profile image updated successfully", { id: "profile-upload" });
      } catch (error: any) {
        toast.error(error.message || "Failed to upload image", { id: "profile-upload" });
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  } as const;

  const profileImageSrc = (() => {
    if (!profile?.profileImage) return null;
    if (profile.profileImage instanceof Blob) {
      return URL.createObjectURL(profile.profileImage);
    }
    return profile.profileImage;
  })();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Premium Header Card */}
      <motion.div
        variants={itemVariants}
        className="relative group rounded-lg overflow-hidden border border-white/20 shadow-2xl shadow-brand/10"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-brand  overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>
 
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-40 h-40 relative rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
              {profileImageSrc ? (
                <Image
                  src={profileImageSrc}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={80} className="text-white/40" />
              )}
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute -bottom-2 -right-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl text-brand hover:bg-brand hover:text-white transition-all transform hover:rotate-12 active:scale-95 border border-white/10 dark:border-gray-700"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">
                  {profile?.full_name || "Staff Member"}
                </h1>
                <div className="w-fit px-5 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg">
                  {profile?.role || "ORGANIZER"}
                </div>
              </div>
              <p className="text-white/70 font-bold text-lg tracking-tight flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} className="text-white/40" />
                {profile?.email}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-xs font-bold border border-white/10">
                <Verified size={14} className="text-emerald-400" />
                Verified Account
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-xs font-bold border border-white/10">
                <Award size={14} className="text-amber-400" />
                Senior Member
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full rounded-lg bg-white dark:bg-gray-800 text-brand font-black uppercase tracking-widest text-[10px] h-14 shadow-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-1 border border-white/10 dark:border-gray-700"
            >
              <Edit2 size={16} className="mr-3" />
              Edit Profile
            </Button>
            <Button
              className="w-full rounded-lg bg-black/20 backdrop-blur-md text-white font-black uppercase tracking-widest text-[10px] h-14 hover:bg-red-500/80 transition-all border border-white/10"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account DNA Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-1 bg-white dark:bg-gray-900 p-10 rounded-lg border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand/5 rounded-full blur-2xl" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-brand/5 rounded-lg text-brand shadow-inner">
              <Fingerprint size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Account DNA
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Security & Identity
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <StatusRow
              icon={ShieldCheck}
              label="Identity Verified"
              value="VERIFIED"
              active
              color="emerald"
            />
            <StatusRow
              icon={User}
              label="Access Tier"
              value={profile?.role || "STAFF"}
              active
              color="brand"
            />
            <StatusRow
              icon={Calendar}
              label="Active Since"
              value="April 2026"
              color="gray"
            />
          </div>
        </motion.div>

        {/* Identity Details Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-gray-900 p-10 rounded-lg border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8 relative group"
        >
          <div className="absolute top-0 right-0 p-12 text-brand/5 group-hover:text-brand/10 transition-colors duration-700 pointer-events-none">
            <User size={180} strokeWidth={0.5} />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-brand/5 rounded-lg text-brand">
              <User size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Identity Details
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Contact & Core Information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 pt-2 relative z-10">
            <InfoItem
              icon={User}
              label="Legal Full Name"
              value={profile?.full_name || "N/A"}
            />
            <InfoItem
              icon={Mail}
              label="Primary Email"
              value={profile?.email || "N/A"}
            />
            <InfoItem
              icon={Phone}
              label="Contact Number"
              value={profile?.phone || "+251 (00) 000-0000"}
            />
            <InfoItem
              icon={MapPin}
              label="Primary Campus"
              value="Main Campus, block 24"
            />
          </div>
        </motion.div>
      </div>

      {/* Personalization Section */}
      {profile?.role === "STUDENT" && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-900 p-10 rounded-lg border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full -ml-32 -mt-32 blur-3xl  transition-colors duration-700" />
          <UserInterests />
        </motion.div>
      )}

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </motion.div>
  );
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="space-y-2 group">
    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
      {label}
    </p>
    <div className="flex items-center gap-4 p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-800 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:border-brand/30 group-hover:shadow-2xl group-hover:shadow-brand/5 transition-all duration-500">
      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-brand/40 dark:text-brand/60 group-hover:text-brand group-hover:scale-110 transition-all duration-500 shadow-sm">
        <Icon size={20} />
      </div>
      <span className="text-[15px] font-bold text-gray-800 dark:text-gray-200 truncate tracking-tight">
        {value}
      </span>
    </div>
  </div>
);

const StatusRow = ({
  icon: Icon,
  label,
  value,
  active,
  color = "brand",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  active?: boolean;
  color?: "brand" | "emerald" | "gray";
}) => {
  const colorClasses = {
    brand: "bg-brand/5 text-brand border-brand/10",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    gray: "bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
  };

  return (
    <div className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-500 group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-2.5 rounded-lg border transition-all duration-500 group-hover:scale-110",
            active
              ? colorClasses[color]
              : "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800",
          )}
        >
          <Icon size={18} />
        </div>
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-tight">
          {label}
        </span>
      </div>
      <span
        className={cn(
          "text-[10px] font-black px-3 py-1 rounded-lg tracking-widest uppercase",
          active ? "bg-brand/10 text-brand" : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900",
        )}
      >
        {value}
      </span>
    </div>
  );
};
