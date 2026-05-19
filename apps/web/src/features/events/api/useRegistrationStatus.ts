import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type RegistrationStatusResponse = 
    | { kind: "none" }
    | { kind: "registered"; registration: any }
    | { kind: "waitlisted"; waitlistEntry: any };

export const useRegistrationStatus = (eventId: string) => {
    return useQuery<RegistrationStatusResponse>({
        queryKey: ["registration-status", eventId],
        queryFn: async () => {
            const res = await apiFetch(`/api/registrations/status/${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch registration status");
            const result = await res.json();
            return result.data ?? result;
        },
        enabled: !!eventId,
    });
};

export const useMyRegistrations = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["my-registrations"],
        queryFn: async () => {
            const res = await apiFetch("/api/registrations/my");
            if (!res.ok) throw new Error("Failed to fetch my registrations");
            const result = await res.json();
            return result.data ?? result;
        },
        enabled: options?.enabled,
    });
};

export const useEventRegistrations = (eventId: string) => {
    return useQuery({
        queryKey: ["event-registrations", eventId],
        queryFn: async () => {
            const res = await apiFetch(`/api/registrations/event/${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch event registrations");
            const result = await res.json();
            return result.data ?? result;
        },
        enabled: !!eventId,
    });
};
