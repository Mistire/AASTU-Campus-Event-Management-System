import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export const useMyInterests = () => {
  return useQuery({
    queryKey: ["my-interests"],
    queryFn: async () => {
      const res = await apiFetch("/api/users/interests");
      if (!res.ok) throw new Error("Failed to fetch interests");
      const result = await res.json();
      return result.data ?? result;
    },
  });
};

export const useUpdateMyInterests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interests: string[]) => {
      const res = await apiFetch("/api/users/interests", {
        method: "POST",
        body: JSON.stringify({ interests }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update interests");
      return result.data ?? result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interests"] });
    },
  });
};

export const useMyCategoryPreferences = () => {
  return useQuery({
    queryKey: ["my-category-preferences"],
    queryFn: async () => {
      const res = await apiFetch("/api/users/categories/preferences");
      if (!res.ok) throw new Error("Failed to fetch category preferences");
      const result = await res.json();
      return result.data ?? result;
    },
  });
};

export const useUpdateMyCategoryPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const res = await apiFetch("/api/users/categories/preferences", {
        method: "POST",
        body: JSON.stringify({ categoryIds }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update category preferences");
      return result.data ?? result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-category-preferences"] });
    },
  });
};
