import { useQuery } from '@tanstack/react-query';
import { api } from '@/service/apiInterceptors';
import { Child } from '@/utils/types/types';

interface ApiResponse {
  data: Child[];
}

export const useParentChildren = () => {
  return useQuery({
    queryKey: ['parentChildren'],
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
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}; 