import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Venue } from '../types';


export interface CreateVenueDto {
  name: string;
  building?: string;
  roomNumber?: string;
  capacity?: number;
  description?: string;
}

export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async (): Promise<Venue[]> => {
      const res = await apiFetch('/api/venues');
      if (!res.ok) throw new Error('Failed to fetch venues');
      const data = await res.json();
      return (data.data || data) as Venue[];
    },
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateVenueDto) => {
      const res = await apiFetch('/api/venues', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create venue');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};
