import { useQuery } from '@tanstack/react-query';
import { getDriverBus } from '@/service/driver';
import { queryKeys } from '@/service/QueryProvider';
import { useDriverStore } from '@/store/driverStore';

export const useDriverBus = () => {
  const { user } = useDriverStore();
  
  return useQuery({
    queryKey: queryKeys.busInfo(user?.id || ''),
    queryFn: getDriverBus,
    enabled: !!user?.id, // Only fetch if user exists
    
    // Optimization: Bus assignment is relatively static
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    
    // Optimization: Reduce unnecessary refetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    
    // Optimization: Custom retry logic
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
    
    // Optimization: Error handling
    throwOnError: false,
    
    // Optimization: Select only needed data
    select: (data) => {
      if (!data) return null;
      return {
        id: data.id,
        busNumber: data.busNumber,
        plateNumber: data.plateNumber,
        capacity: data.capacity,
        model: data.model,
        isActive: data.isActive,
      };
    },
  });
}; 