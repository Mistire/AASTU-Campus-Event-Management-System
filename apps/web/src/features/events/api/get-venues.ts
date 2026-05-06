import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Venue } from "../types";

const getVenues = async (): Promise<Venue[]> => {
  const res = await apiFetch(`/api/venues`, {
    method: "GET",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch venues");
  
  return result.data?.data || result.data || result || [];
};

export const useVenues = () => {
  return useQuery({
    queryKey: ["venues"],
    queryFn: getVenues,
  });
};
