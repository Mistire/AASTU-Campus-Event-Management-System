"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { User, Mail, ShieldCheck, MapPin, Phone, Edit2, Camera, LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { profile, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header section (Bento style) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand/10 transition-colors duration-700" />
        
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2rem] bg-brand/5 flex items-center justify-center border-2 border-brand/10 shadow-xl overflow-hidden group-hover:border-brand/30 transition-all duration-500">
             <User size={64} className="text-brand/20 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-xl text-brand hover:bg-brand hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-brand/10">
            <Camera size={18} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">{profile?.full_name || "Staff Member"}</h1>
            <span className="w-fit px-4 py-1.5 bg-brand/5 border border-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
               {profile?.role || "ORGANIZER"}
            </span>
          </div>
          <p className="text-gray-400 font-bold text-sm tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Mail size={14} className="text-brand/40" />
            {profile?.email}
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Button className="rounded-2xl border-gray-100 text-gray-600 font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-xl shadow-gray-200/50 hover:bg-gray-50 bg-white" variant="outline">
            <Edit2 size={14} className="mr-2" />
            Edit Profile
          </Button>
          <Button 
            className="rounded-2xl bg-red-50 text-red-500 font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-xl shadow-red-100/50 hover:bg-red-500 hover:text-white transition-all border-none"
            onClick={handleLogout}
          >
            <LogOut size={14} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Status Bento Card */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/5 rounded-2xl text-brand">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">Account Status</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification & Access</p>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <StatusRow icon={ShieldCheck} label="Account Verified" value="YES" active />
                <StatusRow icon={User} label="Access Role" value={profile?.role || "STAFF"} active />
                <StatusRow icon={Calendar} label="Member Since" value="April 2026" />
            </div>
        </div>

        {/* Essential Info Bento Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 text-brand/5 group-hover:text-brand/10 transition-colors duration-500">
                <User size={120} strokeWidth={1} />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-brand/5 rounded-2xl text-brand">
                    <User size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">Essential Information</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity & Contact details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 relative z-10">
                <InfoItem icon={User} label="Full Name" value={profile?.full_name || "N/A"} />
                <InfoItem icon={Mail} label="Email Address" value={profile?.email || "N/A"} />
                <InfoItem icon={Phone} label="Phone Number" value={profile?.phone || "+251 (00) 000-0000"} />
                <InfoItem icon={MapPin} label="Campus Location" value="Main Campus, block 24" />
            </div>
        </div>

      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="space-y-1.5 group cursor-default">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-brand/20 group-hover:shadow-lg group-hover:shadow-brand/5 transition-all duration-300">
            <Icon size={18} className="text-brand/50 group-hover:text-brand transition-colors" />
            <span className="text-sm font-bold text-gray-900 truncate">{value}</span>
        </div>
    </div>
);

const StatusRow = ({ icon: Icon, label, value, active }: { icon: React.ElementType, label: string, value: string, active?: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-brand/20 transition-all duration-300 group">
        <div className="flex items-center gap-3">
            <Icon size={16} className={active ? "text-brand" : "text-gray-300"} />
            <span className="text-sm font-bold text-gray-600">{label}</span>
        </div>
        <span className={active ? "text-[10px] font-black text-brand uppercase tracking-widest" : "text-[10px] font-black text-gray-400 uppercase tracking-widest"}>
            {value}
        </span>
    </div>
);
