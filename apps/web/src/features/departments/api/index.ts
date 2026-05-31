import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Department } from '../types';


export interface CreateDepartmentDto {
  name: string;
  faculty?: string;
}

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<Department[]> => {
      const res = await apiFetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const result = await res.json();
      return (result.data?.data || result.data || result || []) as Department[];
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateDepartmentDto) => {
      const res = await apiFetch('/api/departments', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create department');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
