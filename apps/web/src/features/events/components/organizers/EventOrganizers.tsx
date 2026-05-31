"use client";

import { useState } from "react";
import { Users, UserPlus, Trash2, Mail, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useEventOrganizers } from "../../api/get-organizers";
import { useRemoveOrganizer } from "../../api/mutations";
import { InviteOrganizerDialog } from "./InviteOrganizerDialog";
import { CemsButton } from "@/components/cems/CemsButton";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventOrganizersProps {
  eventId: string;
  canEdit: boolean;
  eventCreatorId?: string;
}

export function EventOrganizers({ eventId, canEdit, eventCreatorId }: EventOrganizersProps) {
  const { profile: user } = useAuthStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { data: organizers, isLoading } = useEventOrganizers(eventId);
  const removeMutation = useRemoveOrganizer();

  const isCreator = user?.id === eventCreatorId;

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the management team?`)) return;

    try {
      await removeMutation.mutateAsync({ id, eventId });
      toast.success("Team member removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove team member");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "PENDING":
        return <Clock size={14} className="text-amber-500" />;
      case "REJECTED":
        return <XCircle size={14} className="text-rose-500" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "REJECTED":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-lg border-4 border-brand/10 border-t-brand animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Management Team</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
             <Shield className="text-brand" size={32} />
             Management <span className="text-brand">Team</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            {organizers?.length || 0} Members active on this event
          </p>
        </div>

        {canEdit && (
          <CemsButton 
            onClick={() => setIsInviteOpen(true)}
            className="h-14 px-8 rounded-lg bg-brand hover:bg-brand/80 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 flex items-center gap-3 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Invite Co-Organizer
          </CemsButton>
        )}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {organizers?.map((org) => {
          const isOrgCreator = org.userId === eventCreatorId;
          const isSelf = org.userId === user?.id;
          
          return (
            <div 
              key={org.id}
              className="group relative flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-brand/20 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                org.status === 'ACCEPTED' ? 'bg-emerald-500' : 
                org.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />

              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-lg bg-brand/5 flex items-center justify-center text-brand font-black text-lg">
                    {org.user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  {isOrgCreator && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <Shield size={12} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">
                      {org.user.fullName}
                      {isSelf && <span className="ml-2 text-[10px] text-brand opacity-50">(You)</span>}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Mail size={12} />
                      {org.user.email}
                    </div>
                    <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusStyles(org.status)}`}>
                      {getStatusIcon(org.status)}
                      {org.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isCreator && !isOrgCreator && (
                  <button
                    onClick={() => handleRemove(org.id, org.user.fullName)}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                    title="Remove from team"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="p-3 text-gray-300">
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    {org.role === 'Creator' ? 'Lead' : 'Staff'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {organizers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/30 dark:bg-gray-800/30">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-xl shadow-gray-200/50 dark:shadow-none mb-4">
            <Users size={32} className="text-gray-200 dark:text-gray-800" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">The team is empty</h3>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Invite co-organizers to start collaborating</p>
        </div>
      )}

      <InviteOrganizerDialog 
        eventId={eventId}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        existingUserIds={organizers?.map(o => o.userId) || []}
      />
    </div>
  );
}
