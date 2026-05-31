import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Category } from "./useCategories";

export interface EventTag {
  id: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
  };
}

export interface EventCategory {
  id: string;
  categoryId: string;
  category: Category;
}

export interface EventSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
  sessionType?: string;
  speakers: {
    id: string;
    speaker: {
      id: string;
      fullName: string;
      bio?: string;
      profileImage?: string;
      title?: string;
    };
  }[];
  media?: {
    id: string;
    fileUrl: string;
    mediaType: string;
  }[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: number;
  requiresApproval: boolean;
  status: {
    id: string;
    statusName: string;
  };
  eventType: {
    id: string;
    name: string;
  };
  venue: {
    id: string;
    name: string;
    location?: string;
    capacity?: number;
  };
  tags: EventTag[];
  eventCategories: EventCategory[];
  sessions: EventSession[];
  media?: {
    id: string;
    fileUrl: string;
    mediaType: string;
  }[];
  _count: {
    registrations: number;
  };
  thumbnail?: string;
}

export const EVENT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath d='M400 200c-55 0-100 45-100 100s45 100 100 100 100-45 100-100-45-100-100-100zm0 150c-28 0-50-22-50-50s22-50 50-50 50 22 50 50-22 50-50 50z' fill='%23d1d5db'/%3E%3Cpath d='M250 450h300v-20c0-40-30-70-70-70h-160c-40 0-70 30-70 70v20z' fill='%23d1d5db'/%3E%3Ctext x='400' y='500' font-family='sans-serif' font-size='24' font-weight='bold' fill='%239ca3af' text-anchor='middle' uppercase='true' letter-spacing='2'%3ECEMS EVENT%3C/text%3E%3C/svg%3E";

export const getThumbnailUrl = (event: Event) => {
  if (event.thumbnail) return event.thumbnail;
  const thumbnailMedia = event.media?.find((m) => m.mediaType === "THUMBNAIL");
  return (
    thumbnailMedia?.fileUrl || event.media?.[0]?.fileUrl || EVENT_PLACEHOLDER
  );
};

export interface EventsResponse {
  data: Event[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface EventQueryParams {
  search?: string;
  date?: string;
  department?: string;
  sortBy?: "date" | "popularity" | "newest";
  status?: string;
  eventType?: string;
  tag?: string;
  categoryId?: string;
  venueId?: string;
  page?: number;
  limit?: number;
  upcomingOnly?: boolean;
}

export async function fetchEvents(queryParams: EventQueryParams = {}) {
  const query = new URLSearchParams();

  if (queryParams.page !== undefined)
    query.append("page", queryParams.page.toString());
  if (queryParams.limit !== undefined)
    query.append("limit", queryParams.limit.toString());
  if (queryParams.search) query.append("search", queryParams.search);
  if (queryParams.categoryId)
    query.append("categoryId", queryParams.categoryId);
  if (queryParams.status) query.append("status", queryParams.status);
  if (queryParams.venueId) query.append("venueId", queryParams.venueId);
  if (queryParams.upcomingOnly !== undefined)
    query.append("upcomingOnly", queryParams.upcomingOnly.toString());

  const res = await apiFetch(`/api/events?${query.toString()}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch events");
  }

  const result = await res.json();
  // The backend wraps responses in a TransformInterceptor envelope:
  // { statusCode, timestamp, data: { data: Event[], meta: {...} } }
  // We need to unwrap .data to get the actual EventsResponse.
  const payload = result.data ?? result;
  return payload as EventsResponse;
}

export function useEvents(queryParams: EventQueryParams = {}) {
  const query = useQuery({
    queryKey: ["events", queryParams],
    queryFn: () => fetchEvents(queryParams),
    retry: false,
  });

  const stableData =
    query.data && Array.isArray(query.data.data)
      ? query.data
      : {
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 10,
            totalPages: 0,
            currentPage: 1,
          },
        };

  return {
    ...query,
    data: stableData,
    isLoading: query.isLoading && !query.data,
  };
}
