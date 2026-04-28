import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiFetch(`/api/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create event");
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiFetch(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update event");
      return result.data || result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete event");
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
    },
  });
};

export const useSubmitEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/events/${id}/submit`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to submit event");
      return result.data || result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};

export const useApproveEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/events/${id}/approve`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to approve event");
      return result.data || result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};

export const useRejectEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await apiFetch(`/api/events/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to reject event");
      return result.data || result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-organized-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};

export const useGoLiveEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/events/${id}/go-live`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to go live");
      return result.data || result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
};


export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { eventId: string; sessionId?: string; ticketToken: string }) => {
      const res = await apiFetch(`/api/attendance/check-in`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to check in");
      return result.data || result;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", eventId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats", eventId] });
    },
  });
};

export const useManualCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { eventId: string; userId: string; sessionId?: string }) => {
      const res = await apiFetch(`/api/attendance/manual-check-in`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to check in manually");
      return result.data || result;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", eventId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-registrations", eventId] });
    },
  });
};
export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/registrations/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to cancel registration");
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["registration-status"] });
    },
  });
};
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/registrations/${id}/approve`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to approve registration");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
};

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/registrations/${id}/reject`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to reject registration");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
};

export const useInviteOrganizer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId, role }: { eventId: string; userId: string; role?: string }) => {
      const res = await apiFetch(`/api/events/${eventId}/organizers/invite`, {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to invite organizer");
      return result.data || result;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
    },
  });
};

export const useRemoveOrganizer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const res = await apiFetch(`/api/organizers/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to remove organizer");
      return result.data || result;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
    },
  });
};

export const useRespondToOrganizerInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const res = await apiFetch(`/api/organizers/${id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ accept }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to respond to invitation");
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-organizer-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["event-organizers"] });
    },
  });
};
