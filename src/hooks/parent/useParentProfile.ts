import { useQuery } from '@tanstack/react-query';
import { getParentProfile, ParentProfile } from '../../service/parent';
import { queryKeys } from '@/service/QueryProvider';

export function useParentProfile() {
  return useQuery<ParentProfile>({
    queryKey: queryKeys.parentProfile,
    queryFn: getParentProfile,
    // Optimization: Profile data is relatively static
    staleTime: 1000 * 60 * 30, // 30 minutes
    // Optimization: Reduce unnecessary refetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    // Optimization: Profile data can be cached longer
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    // Optimization: Custom retry for profile
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
} 