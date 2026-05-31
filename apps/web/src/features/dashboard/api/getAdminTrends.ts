import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface TrendPoint {
  date: string;
  count: number;
}

const RANGE_TO_PRESET: Record<string, string> = {
  '7d': 'last_7_days',
  '30d': 'last_30_days',
  '90d': 'last_90_days',
};

async function fetchAdminTrends(range?: string): Promise<TrendPoint[]> {
  const preset = range ? RANGE_TO_PRESET[range] : undefined;
  const params = preset ? `?preset=${preset}` : '';
  const res = await apiFetch(`/api/analytics/admin/trends${params}`);
  if (!res.ok) throw new Error('Failed to fetch trends');
  const result = await res.json();
  return result.data as TrendPoint[];
}

export function useAdminTrends(range = '30d') {
  const { token } = useAuthStore();
  const preset = RANGE_TO_PRESET[range] || range;

  return useQuery({
    queryKey: ['admin-trends', preset],
    queryFn: () => fetchAdminTrends(range),
    enabled: !!token,
  });
}
