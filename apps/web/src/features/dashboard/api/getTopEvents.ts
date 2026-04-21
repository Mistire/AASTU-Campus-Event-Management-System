import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface TopEvent {
  eventId: string;
  title: string;
  registrations: number;
  attendance: number;
  attendanceRate: number;
}

const RANGE_TO_PRESET: Record<string, string> = {
  '7d': 'last_7_days',
  '30d': 'last_30_days',
  '90d': 'last_90_days',
};

async function fetchTopEvents(range?: string): Promise<TopEvent[]> {
  const preset = range ? RANGE_TO_PRESET[range] : undefined;
  const params = preset ? `?preset=${preset}` : '';
  const res = await apiFetch(`/api/analytics/admin/top-events${params}`);
  if (!res.ok) throw new Error('Failed to fetch top events');
  const result = await res.json();
  return result.data as TopEvent[];
}

export function useTopEvents(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['top-events', range],
    queryFn: () => fetchTopEvents(range),
    enabled: !!token,
  });
}
