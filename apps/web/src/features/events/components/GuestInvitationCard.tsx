"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { CemsButton } from "@/components/cems/CemsButton";
import { InputController } from "@/components/shared/InputController";
import { UserPlus, Mail, Trash2, Send, Loader2, Users, Info } from "lucide-react";
import { toast } from "sonner";
import { Event } from "../types";

interface GuestInvitationCardProps {
  event: Event;
  userId: string;
}

export function GuestInvitationCard({ event, userId }: GuestInvitationCardProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  // Fetch user's existing invites
  const { data: invites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ["event-guest-invites", event.id, userId],
    queryFn: async () => {
      const res = await apiFetch(`/api/events/${event.id}/guest-invites`);
      const result = await res.json();
      return result.data || [];
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const res = await apiFetch(`/api/events/${event.id}/invite-guests`, {
        method: "POST",
        body: JSON.stringify({ emails }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to send invitations");
      return result.data;
    },
    onSuccess: () => {
      toast.success("Guest invitation sent successfully");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["event-guest-invites", event.id, userId] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteMutation.mutate([email]);
  };

  const guestLimit = event.guestLimitPerUser || 0;
  const invitedCount = invites?.length || 0;
  const remainingCount = Math.max(0, guestLimit - invitedCount);

  if (guestLimit === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-50 dark:border-gray-800 overflow-hidden">
      <div className="p-8 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand/5 flex items-center justify-center text-brand">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Guest Invitations</h3>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Invite your family & friends</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 rounded-lg border border-brand/10">
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">
                {invitedCount} / {guestLimit} Used
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Help box */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start gap-3 border border-gray-100 dark:border-gray-700">
          <Info className="text-gray-400 shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
            As a registered student, you can invite up to {guestLimit} guests to this {event.eventType?.name || "event"}. 
            Each guest will receive a unique QR code ticket via email.
          </p>
        </div>

        {/* Invite Form */}
        {remainingCount > 0 ? (
          <form onSubmit={handleInvite} className="flex gap-4">
            <div className="flex-1">
              <InputController
                label="Guest Email Address"
                icon={Mail}
                type="email"
                placeholder="e.g. family@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="pt-6">
              <CemsButton
                type="submit"
                cemsVariant="brand"
                disabled={inviteMutation.isPending}
                className="h-12 px-8 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 transition-all active:scale-95"
              >
                {inviteMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Invite
                  </>
                )}
              </CemsButton>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center bg-brand/5 dark:bg-brand/10 rounded-lg border border-dashed border-brand/20 dark:border-brand/30">
            <p className="text-[10px] font-black text-brand uppercase tracking-widest">
              You have reached your guest limit
            </p>
          </div>
        )}

        {/* Guest List */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Your Invited Guests
          </h4>
          
          <div className="space-y-2">
            {isLoadingInvites ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="animate-spin text-gray-200" size={24} />
              </div>
            ) : invites && invites.length > 0 ? (
              invites.map((invite: any) => (
                <div 
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-800 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-950 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-brand transition-colors border border-gray-50 dark:border-gray-800">
                      <Mail size={14} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{invite.invitedEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500">
                      {invite.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-300">
                <Users size={32} className="opacity-20 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">No guests invited yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
