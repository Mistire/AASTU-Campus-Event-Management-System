import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { AuthProfile } from "@/features/auth/store/useAuthStore";

const getUsers = async (): Promise<AuthProfile[]> => {
  const res = await apiFetch(`/api/users`, {
    method: "GET",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch users");
  
  return (result.data?.data || result.data) || [];
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["event-organizers"],
    queryFn: getUsers,
  });
};
