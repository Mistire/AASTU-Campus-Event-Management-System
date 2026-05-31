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

export interface VenueQuery {
  page?: number;
  limit?: number;
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

export const useVenues = (query: VenueQuery = {}) => {
  return useQuery({
    queryKey: ['venues', query],
    queryFn: async (): Promise<Venue[]> => {
      const searchParams = new URLSearchParams();
      if (query.page) searchParams.append('page', query.page.toString());
      if (query.limit) searchParams.append('limit', query.limit.toString());
      if (query.search) searchParams.append('search', query.search);
      if (query.minCapacity) searchParams.append('minCapacity', query.minCapacity.toString());
      if (query.maxCapacity) searchParams.append('maxCapacity', query.maxCapacity.toString());

      const res = await apiFetch(`/api/venues?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch venues');
      const result = await res.json();
      return (result.data?.data || result.data || result || []) as Venue[];
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
