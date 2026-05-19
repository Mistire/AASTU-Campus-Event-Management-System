"use client";

import { useEffect, useState } from "react";
import { useMyOrganizerInvitations } from "@/features/events/api/get-organizers";
import { useRespondToOrganizerInvitation } from "@/features/events/api/mutations";
import {
  CemsDialog,
  CemsDialogContent,
  CemsDialogHeader,
  CemsDialogTitle,
  CemsDialogDescription,
  CemsDialogFooter,
} from "@/components/cems/CemsDialog";
import { CemsButton } from "@/components/cems/CemsButton";
import { Shield, Check, X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function PendingInvitationsModal() {
  const { data: invitations, isLoading } = useMyOrganizerInvitations();
  const pendingInvitations = invitations?.filter(inv => inv.status === 'PENDING') || [];
  const respondMutation = useRespondToOrganizerInvitation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (pendingInvitations.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pendingInvitations.length]);

  const currentInvite = pendingInvitations[currentIndex];

  const handleResponse = async (accept: boolean) => {
    if (!currentInvite) return;

    try {
      await respondMutation.mutateAsync({ id: currentInvite.id, accept });
      toast.success(accept ? "Invitation accepted!" : "Invitation declined");
      
      if (pendingInvitations.length === 1) {
        setIsOpen(false);
      } else {
        // Move to next or close if last
        if (currentIndex < pendingInvitations.length - 1) {
          // Stay at same index as the array will shrink
        } else {
          setCurrentIndex(0);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to respond");
    }
  };

  if (isLoading || !currentInvite) return null;

  return (
    <CemsDialog open={isOpen} onOpenChange={setIsOpen}>
      <CemsDialogContent size="md">
        <CemsDialogHeader icon={<Shield className="text-brand" />}>
          <CemsDialogTitle>
            Event <span className="text-brand">Invitation</span>
          </CemsDialogTitle>
          <CemsDialogDescription>
            You've been invited to join the management team for an event.
          </CemsDialogDescription>
        </CemsDialogHeader>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 flex items-start gap-5">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-950 flex items-center justify-center shadow-sm text-brand shrink-0">
              <Calendar size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                {currentInvite.event.title}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Invited on {format(new Date(currentInvite.invitedAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              As a <span className="text-brand font-black uppercase tracking-tight">Co-Organizer</span>, 
              you will have access to manage attendees, scan tickets, and view event analytics.
            </p>
          </div>

          {pendingInvitations.length > 1 && (
            <div className="flex justify-center">
              <p className="text-[9px] font-black text-brand bg-brand/5 px-3 py-1 rounded-lg uppercase tracking-widest">
                {currentIndex + 1} of {pendingInvitations.length} Invitations
              </p>
            </div>
          )}
        </div>

        <CemsDialogFooter>
          <CemsButton
            onClick={() => handleResponse(false)}
            disabled={respondMutation.isPending}
            variant="outline"
            className="h-11 px-6 rounded-lg border-gray-100 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-500/20 font-black uppercase tracking-widest text-[9px] dark:bg-gray-900"
          >
            <X size={14} className="mr-2" />
            Decline
          </CemsButton>
          <CemsButton
            onClick={() => handleResponse(true)}
            disabled={respondMutation.isPending}
            className="h-11 px-8 rounded-lg bg-brand text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-brand/20"
          >
            {respondMutation.isPending ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Check size={14} className="mr-2" />
            )}
            Accept & Join Team
          </CemsButton>
        </CemsDialogFooter>
      </CemsDialogContent>
    </CemsDialog>
  );
}
