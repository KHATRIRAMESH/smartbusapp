import { useQuery } from '@tanstack/react-query';
import { api } from '@/service/apiInterceptors';
import { Child } from '@/utils/types/types';
import { queryKeys } from '@/service/QueryProvider';

interface ApiResponse {
  data: Child[];
}

export const useParentChildren = () => {
  return useQuery({
    queryKey: queryKeys.parentChildren,
    queryFn: async (): Promise<Child[]> => {
      try {
        const response = await api.get<ApiResponse>('/parent/children');
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid response format');
        }
        return response.data.data;
      } catch (error) {
        console.error('Error fetching children:', error);
        throw error;
      }
    },
    // Optimization: Increased stale time for relatively static data
    staleTime: 1000 * 60 * 10, // 10 minutes (was 30 seconds)
    // Optimization: Reduced refetch frequency
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Only refetch if data is stale
    // Optimization: Enable background refetch for data freshness
    refetchOnReconnect: true,
    // Optimization: Custom retry logic
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}; 