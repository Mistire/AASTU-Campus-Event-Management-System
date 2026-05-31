import { useQuery } from "@tanstack/react-query";
import { Event } from "../types";
import { apiFetch } from "@/lib/api-client";

const getEvent = async (id: string): Promise<Event> => {
  const res = await apiFetch(`/api/events/${id}`, {
    method: "GET",
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch event");
  
  return result.data;
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
};
