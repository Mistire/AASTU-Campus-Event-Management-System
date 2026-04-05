import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export interface EventType {
  id: string;
  name: string;
}

const getEventTypes = async (): Promise<EventType[]> => {
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

  const res = await fetch(`${apiUrl}/api/event-types`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch event types");
  
  return (result.data || result) as EventType[];
};

export const useEventTypes = () => {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: getEventTypes,
  });
};
