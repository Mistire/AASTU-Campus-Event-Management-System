import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface MlHealth {
  status: 'healthy' | 'unhealthy';
  service: string;
  version?: string;
  models_loaded: boolean;
  last_trained: string | null;
}

export interface RetrainResponse {
  status: string;
  message: string;
  events_count: number;
  users_count: number;
  registrations_count: number;
}

export async function fetchMlHealth(): Promise<MlHealth> {
  const res = await apiFetch('/api/recommendations/health');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch ML health');
  }
  const result = await res.json();
  return result.data as MlHealth;
}

export async function triggerRetrain(): Promise<RetrainResponse> {
  const res = await apiFetch('/api/recommendations/retrain', {
    method: 'POST',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to trigger retrain');
  }
  const result = await res.json();
  return result.data as RetrainResponse;
}

export function useRecommendationManagement() {
  const queryClient = useQueryClient();

  const healthQuery = useQuery({
    queryKey: ['recommendation-health'],
    queryFn: fetchMlHealth,
    refetchInterval: 30000, // Poll every 30s
  });

  const retrainMutation = useMutation({
    mutationFn: triggerRetrain,
    onSuccess: () => {
      // Refresh health stats after a delay to allow training to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['recommendation-health'] });
      }, 5000);
    },
  });

  return {
    health: healthQuery.data,
    isLoadingHealth: healthQuery.isLoading,
    isRetraining: retrainMutation.isPending,
    triggerRetrain: retrainMutation.mutateAsync,
    lastError: retrainMutation.error,
  };
}
