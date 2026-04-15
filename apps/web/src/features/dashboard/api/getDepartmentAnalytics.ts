import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface DepartmentAnalytics {
  departmentId: string;
  name: string;
  registrations: number;
}

async function fetchDepartmentAnalytics(range?: string): Promise<DepartmentAnalytics[]> {
  const params = range ? `?range=${range}` : '';
  const res = await apiFetch(`/api/analytics/admin/departments${params}`);
  if (!res.ok) throw new Error('Failed to fetch department analytics');
  return res.json();
}

export function useDepartmentAnalytics(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['department-analytics', range],
    queryFn: () => fetchDepartmentAnalytics(range),
    enabled: !!token,
  });
}
