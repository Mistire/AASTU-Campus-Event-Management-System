import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export const useBookmarks = () => {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await apiFetch("/api/bookmarks");
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const result = await res.json();
      return result.data ?? result;
    },
  });
};

export const useBookmarkStatus = (eventId: string) => {
  return useQuery({
    queryKey: ["bookmark-status", eventId],
    queryFn: async () => {
      const res = await apiFetch(`/api/bookmarks/${eventId}/check`);
      if (!res.ok) throw new Error("Failed to check bookmark status");
      const result = await res.json();
      return (result.data ?? result) as boolean;
    },
    enabled: !!eventId,
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isBookmarked }: { eventId: string; isBookmarked: boolean }) => {
      const res = await apiFetch(`/api/bookmarks/${eventId}`, {
        method: isBookmarked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle bookmark");
      return res.json();
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-status", eventId] });
      toast.success("Bookmark updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bookmark");
    },
  });
};
