"use client";

import { useMyOrganizerInvitations } from "@/features/events/api/get-organizers";
import { useRespondToOrganizerInvitation } from "@/features/events/api/mutations";
import { CemsButton } from "@/components/cems/CemsButton";
import { Check, X, Shield, Calendar, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InvitationsPage() {
  const { data: invitations, isLoading } = useMyOrganizerInvitations();
  const respondMutation = useRespondToOrganizerInvitation();

  const handleResponse = async (id: string, accept: boolean) => {
    try {
      await respondMutation.mutateAsync({ id, accept });
      toast.success(accept ? "Invitation accepted!" : "Invitation declined");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to invitation");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading your invitations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
          <Shield className="text-brand" size={40} />
          Your <span className="text-brand">Invitations</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          Review and respond to event co-organization requests
        </p>
      </div>

      <div className="grid gap-6">
        {invitations && invitations.length > 0 ? (
          invitations.map((inv) => (
            <div 
              key={inv.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-none hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8 group overflow-hidden relative"
            >
              {/* Brand Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand opacity-20 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-lg bg-brand/5 flex items-center justify-center text-brand shrink-0">
                  <Calendar size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-brand transition-colors">
                    {inv.event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      <User size={14} className="text-brand/50" />
                      Invited by <span className="text-gray-600 dark:text-gray-300">Lead Organizer</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      {format(new Date(inv.invitedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CemsButton
                  onClick={() => handleResponse(inv.id, false)}
                  disabled={respondMutation.isPending}
                  variant="outline"
                  className="h-12 px-6 rounded-lg border-gray-100 dark:border-gray-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-900/30 font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <X size={16} className="mr-2" />
                  Decline
                </CemsButton>
                <CemsButton
                  onClick={() => handleResponse(inv.id, true)}
                  disabled={respondMutation.isPending}
                  className="h-12 px-8 rounded-lg bg-brand hover:bg-brand/80 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 transition-all flex items-center"
                >
                  {respondMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check size={16} className="mr-2" />
                  )}
                  Accept Invitation
                </CemsButton>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-2xl dark:shadow-none mb-6">
              <Shield size={40} className="text-gray-200 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">No pending invitations</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
