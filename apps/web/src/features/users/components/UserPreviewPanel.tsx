"use client";

import { Users as UsersIcon, Mail, Shield, Calendar, Hash, X } from 'lucide-react';
import { UserRecord } from '../types';
import { cn } from '@/lib/utils';

interface UserPreviewPanelProps {
  user: UserRecord;
  onClose: () => void;
}

export const UserPreviewPanel = ({ user, onClose }: UserPreviewPanelProps) => {
  return (
    <div className="w-96 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300 sticky top-24 self-start">
      {/* Panel Header */}
      <div className="bg-brand p-6 text-white relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <UsersIcon size={80} />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black border border-white/30">
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{user.name}</h3>
              <p className="text-white/60 text-xs font-medium">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="p-5 space-y-4">
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</span>
            </div>
            <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">{user.role}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{user.joined}</p>
          </div>
        </div>

        {/* Status */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Account Status</span>
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
              user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              user.status === 'inactive' ? 'bg-red-50 text-red-600 border-red-100' :
              'bg-amber-50 text-amber-600 border-amber-100'
            )}>
              {user.status}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</h4>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 font-medium truncate">{user.email}</span>
          </div>
        </div>

        {/* ID */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[11px]">
            <Hash className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400 font-medium">ID</span>
            <span className="ml-auto text-gray-500 font-mono">{user.id.slice(0, 16)}…</span>
          </div>
        </div>
      </div>
    </div>
  );
};
