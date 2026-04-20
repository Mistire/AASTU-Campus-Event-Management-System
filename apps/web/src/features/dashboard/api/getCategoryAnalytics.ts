import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface CategoryAnalytics {
  categoryId: string;
  name: string;
  registrations: number;
  attendanceRate: number;
}

const RANGE_TO_PRESET: Record<string, string> = {
  '7d': 'last_7_days',
  '30d': 'last_30_days',
  '90d': 'last_90_days',
};

async function fetchCategoryAnalytics(range?: string): Promise<CategoryAnalytics[]> {
  const preset = range ? RANGE_TO_PRESET[range] : undefined;
  const params = preset ? `?preset=${preset}` : '';
  const res = await apiFetch(`/api/analytics/admin/categories${params}`);
  if (!res.ok) throw new Error('Failed to fetch category analytics');
  const result = await res.json();
  return result.data as CategoryAnalytics[];
}

export function useCategoryAnalytics(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['category-analytics', range],
    queryFn: () => fetchCategoryAnalytics(range),
    enabled: !!token,
  });
}
