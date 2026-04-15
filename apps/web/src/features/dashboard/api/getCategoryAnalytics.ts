import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiFetch } from '@/lib/api-client';

export interface CategoryAnalytics {
  categoryId: string;
  name: string;
  registrations: number;
  attendanceRate: number;
}

async function fetchCategoryAnalytics(range?: string): Promise<CategoryAnalytics[]> {
  const params = range ? `?range=${range}` : '';
  const res = await apiFetch(`/api/analytics/admin/categories${params}`);
  if (!res.ok) throw new Error('Failed to fetch category analytics');
  return res.json();
}

export function useCategoryAnalytics(range = '30d') {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['category-analytics', range],
    queryFn: () => fetchCategoryAnalytics(range),
    enabled: !!token,
  });
}
