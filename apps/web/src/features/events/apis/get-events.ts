import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { EventQuery, PaginatedEventsResponse } from "../types";

const getEvents = async (query: EventQuery): Promise<PaginatedEventsResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = Cookies.get("access_token");

  const searchParams = new URLSearchParams();
  if (query.page) searchParams.append("page", query.page.toString());
  if (query.limit) searchParams.append("limit", query.limit.toString());
  if (query.search) searchParams.append("search", query.search);
  if (query.status) searchParams.append("status", query.status);
  if (query.eventType) searchParams.append("eventType", query.eventType);
  if (query.sortBy) searchParams.append("sortBy", query.sortBy);

  const res = await fetch(`${apiUrl}/api/events?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch events");
  
  // The backend returns { data, meta }
  return result;
};

export const useEvents = (query: EventQuery) => {
  return useQuery({
    queryKey: ["events", query],
    queryFn: () => getEvents(query),
    placeholderData: (previousData) => previousData, // Support for smooth pagination (TanStack Query v5)
  });
};
