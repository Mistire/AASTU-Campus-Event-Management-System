import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Event } from "../types";

const getEventById = async (id: string): Promise<Event> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const authCookie = Cookies.get("auth-storage");
  let token = "";
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      token = parsed.state?.token || "";
    } catch (e) {
      console.error("Failed to parse auth cookie", e);
    }
  }

  const res = await fetch(`${apiUrl}/api/events/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch event details");
  
  // Unwrap from { data, meta } if the backend uses the transform interceptor
  return result.data || result;
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
};
