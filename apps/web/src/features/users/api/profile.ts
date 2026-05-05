import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  profileImage?: string;
}

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { setAuth, token, refreshToken, profile } = useAuthStore.getState();

  return useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      const res = await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update profile");
      return result.data ?? result;
    },
    onSuccess: (updatedProfile) => {
      // Update the local auth store with the new profile data
      if (token && refreshToken && profile) {
        // Map backend response fields to AuthProfile fields if necessary
        const newProfile = {
            ...profile,
            full_name: updatedProfile.fullName || updatedProfile.full_name || profile.full_name,
            phone: updatedProfile.phone || profile.phone,
            profileImage: updatedProfile.profileImage || profile.profileImage
        };
        useAuthStore.setState({ profile: newProfile });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      // If we use "me" in auth store, we might not have a separate query for it, 
      // but let's invalidate just in case.
    },
  });
};
