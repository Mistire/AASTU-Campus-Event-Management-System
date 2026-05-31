import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface EventOrganizer {
  id: string;
  eventId: string;
  userId: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  invitedAt: string;
  respondedAt?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
}

export const getEventOrganizers = async (eventId: string, includeAll = true): Promise<EventOrganizer[]> => {
  const res = await apiFetch(`/api/events/${eventId}/organizers?includeAll=${includeAll}`, {
    method: "GET",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch event organizers");
  return result.data || result || [];
};

export const useEventOrganizers = (eventId: string, includeAll = true) => {
  return useQuery({
    queryKey: ["event-organizers", eventId, includeAll],
    queryFn: () => getEventOrganizers(eventId, includeAll),
    enabled: !!eventId,
  });
};

export const getMyOrganizerInvitations = async (): Promise<any[]> => {
  const res = await apiFetch(`/api/my/organizer-invitations`, {
    method: "GET",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch organizer invitations");
  return result.data || result || [];
};

export const useMyOrganizerInvitations = () => {
  return useQuery({
    queryKey: ["my-organizer-invitations"],
    queryFn: getMyOrganizerInvitations,
  });
};
