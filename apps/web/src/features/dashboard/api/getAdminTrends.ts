import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface TrendPoint {
  date: string;
  count: number;
}

async function fetchAdminTrends(range?: string): Promise<TrendPoint[]> {
  const params = range ? `?range=${range}` : '';
  const res = await apiFetch(`/api/analytics/admin/trends${params}`);
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
}

export function useAdminTrends(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['admin-trends', range],
    queryFn: () => fetchAdminTrends(range),
    enabled: !!token,
  });
}
