"use client";

import { useState } from "react";
import { Search, UserPlus, Loader2, Mail, Check, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUsers } from "@/features/events/api/get-users";
import { useInviteOrganizer } from "@/features/events/api/mutations";
import { CemsButton } from "@/components/cems/CemsButton";
import { toast } from "sonner";

interface InviteOrganizerDialogProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  existingUserIds: string[];
}

export function InviteOrganizerDialog({
  eventId,
  isOpen,
  onClose,
  existingUserIds,
}: InviteOrganizerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const inviteMutation = useInviteOrganizer();

  const filteredUsers = users?.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const handleInvite = async (userId: string) => {
    try {
      await inviteMutation.mutateAsync({ eventId, userId, role: "Co-Organizer" });
      toast.success("Invitation sent successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-lg p-8 border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
            <UserPlus className="text-brand" size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
            Invite <span className="text-brand">Co-Organizer</span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            Search for a user by name or email to add them to your event management team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand/30 outline-none transition-all"
            />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {isLoadingUsers ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Fetching directory...
                </p>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isAlreadyInTeam = existingUserIds.includes(user.id);
                
                return (
                  <div
                    key={user.id}
                    className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                      isAlreadyInTeam 
                        ? "bg-gray-50 border-gray-100 opacity-60" 
                        : "bg-gray-50/50 border-gray-100 hover:bg-white hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand font-black text-xs uppercase">
                        {user.fullName?.substring(0, 2) || "??"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none mb-1">
                          {user.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          <Mail size={10} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    {isAlreadyInTeam ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                        <Check size={10} />
                        In Team
                      </div>
                    ) : (
                      <CemsButton
                        onClick={() => handleInvite(user.id)}
                        disabled={inviteMutation.isPending}
                        className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-brand hover:text-white hover:border-brand transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        {inviteMutation.isPending ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <UserPlus size={12} />
                        )}
                        Invite
                      </CemsButton>
                    )}
                  </div>
                );
              })
            ) : searchTerm ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">
                  No users found matching "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Start typing to search users
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Shield size={14} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
            Invited co-organizers will have full access to manage this event, including attendance and registrations, once they accept.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
