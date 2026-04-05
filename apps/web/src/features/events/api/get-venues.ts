import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export interface Venue {
  id: string;
  name: string;
  building?: string;
  roomNumber?: string;
  capacity?: number;
}

const getVenues = async (): Promise<Venue[]> => {
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

  const res = await fetch(`${apiUrl}/api/venues`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch venues");
  
  // result is expected to be { data: { data: Venue[], meta: any } } due to pagination
  // Note: Backend might wrap this in { data: [...] } if TransformInterceptor is applied
  if (result.data && Array.isArray(result.data.data)) {
    return result.data.data;
  }
  return (result.data || result) as Venue[];
};

export const useVenues = () => {
  return useQuery({
    queryKey: ["venues"],
    queryFn: getVenues,
  });
};
