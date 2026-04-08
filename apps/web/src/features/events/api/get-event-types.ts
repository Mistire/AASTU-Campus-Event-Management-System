import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { EventType } from "../types";

const getEventTypes = async (): Promise<EventType[]> => {
  const res = await apiFetch(`/api/event-types`, {
    method: "GET",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch event types");

  // Handle both paginated { data, meta } and direct array responses
  return (result.data?.data || result.data) as EventType[];
};

export const useEventTypes = () => {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: getEventTypes,
  });
};
