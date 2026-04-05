import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export interface User {
  id: string;
  fullName: string;
  email: string;
}

const getUsers = async (): Promise<User[]> => {
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

  const res = await fetch(`${apiUrl}/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch users");

  // The backend's TransformInterceptor wraps the response in { statusCode, timestamp, data }
  return (result.data || result) as User[];
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};
