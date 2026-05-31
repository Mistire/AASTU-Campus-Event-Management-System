"use client";

import { Users as UsersIcon, Mail, Shield, Calendar, Hash, X } from 'lucide-react';
import { UserRecord } from '../types';
import { cn } from '@/lib/utils';

import { CemsSheet } from "@/components/cems/CemsSheet";
import { CemsBadge } from "@/components/cems/CemsBadge";

interface UserPreviewPanelProps {
  user: UserRecord | null;
  onClose: () => void;
}

export const UserPreviewPanel = ({ user, onClose }: UserPreviewPanelProps) => {
  return (
    <CemsSheet 
      open={!!user} 
      onOpenChange={(open) => !open && onClose()}
      className="max-w-md"
    >
      {user && (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
          {/* Panel Header */}
          <div className="bg-brand p-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <UsersIcon size={120} />
            </div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/30 shadow-xl">
                {(user.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                  User Account
                </p>
                <h3 className="text-xl font-black tracking-tight leading-tight">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 pt-1">
                  <CemsBadge className="bg-white/20 text-white rounded-lg px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border-none">
                    {user.role}
                  </CemsBadge>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Access Level</span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{user.role}</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">System Permissions</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Registration</span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{user.joined}</p>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">Joined Date</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Account Status</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Currently {user.status}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                  user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                  user.status === 'inactive' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                  'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                )}>
                  {user.status}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact Details</h4>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-xs text-gray-900 dark:text-white font-bold truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-[10px]">
                <Hash className="w-3 h-3 text-gray-300" />
                <span className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Internal User ID</span>
                <span className="ml-auto text-gray-500 dark:text-gray-400 font-mono text-[9px]">{user.id}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </CemsSheet>
  );
};
