import { useQuery } from "@tanstack/react-query";
import { EventQuery, PaginatedEventsResponse } from "../types";
import { apiFetch } from "@/lib/api-client";

const getEvents = async (query: EventQuery): Promise<PaginatedEventsResponse> => {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.append("page", query.page.toString());
  if (query.limit) searchParams.append("limit", query.limit.toString());
  if (query.search) searchParams.append("search", query.search);
  if (query.status) searchParams.append("status", query.status);
  if (query.eventType) searchParams.append("eventType", query.eventType);
  if (query.venueId) searchParams.append("venueId", query.venueId);
  if (query.createdById) searchParams.append("createdById", query.createdById);
  if (query.sortBy) searchParams.append("sortBy", query.sortBy);

  const res = await apiFetch(`/api/events?${searchParams.toString()}`, {
    method: "GET",
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch events");
  
  // The backend's TransformInterceptor wraps the response in { statusCode, timestamp, data }
  return result.data;
};

const getMyOrganizedEvents = async (query: EventQuery): Promise<PaginatedEventsResponse> => {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.append("page", query.page.toString());
  if (query.limit) searchParams.append("limit", query.limit.toString());
  if (query.search) searchParams.append("search", query.search);
  if (query.status) searchParams.append("status", query.status);

  const res = await apiFetch(`/api/events/my-organized?${searchParams.toString()}`, {
    method: "GET",
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch events");
  
  return result.data;
};

export const useEvents = (query: EventQuery, options?: any) => {
  return useQuery({
    queryKey: ["events", query],
    queryFn: () => getEvents(query),
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useMyOrganizedEvents = (query: EventQuery, options?: any) => {
  return useQuery({
    queryKey: ["my-organized-events", query],
    queryFn: () => getMyOrganizedEvents(query),
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
