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

async function fetchTopEvents(range?: string): Promise<TopEvent[]> {
  const params = range ? `?range=${range}` : '';
  const res = await apiFetch(`/api/analytics/admin/top-events${params}`);
  if (!res.ok) throw new Error('Failed to fetch top events');
  return res.json();
}

export function useTopEvents(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['top-events', range],
    queryFn: () => fetchTopEvents(range),
    enabled: !!token,
  });
}
