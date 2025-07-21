import { useQuery } from '@tanstack/react-query';
import { getDriverProfile, DriverProfile } from '@/service/driver';
import { queryKeys } from '@/service/QueryProvider';
import { useDriverStore } from '@/store/driverStore';
import { useCallback, useMemo } from 'react';

export const useDriverProfile = () => {
  const { user, loadFromStorage } = useDriverStore();
  
  // Optimization: Memoize the enabled condition to prevent unnecessary re-renders
  const shouldFetch = useMemo(() => !!user?.id, [user?.id]);
  
  // Optimization: Memoize the query function to prevent recreating it on every render
  const queryFn = useCallback(async () => {
    if (__DEV__) {
      console.log('[useDriverProfile] Fetching driver profile...');
    }
    
    // If no user in store, try loading from storage first
    if (!user?.id) {
      if (__DEV__) {
        console.log('[useDriverProfile] No user in store, loading from storage...');
      }
      await loadFromStorage();
    }
    
    return getDriverProfile();
  }, [user?.id, loadFromStorage]);

  // Optimization: Memoize the select function
  const selectData = useCallback((data: DriverProfile) => {
    if (!data) return null as any;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      address: data.address,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      assignedBus: data.assignedBus,
    };
  }, []);
  
  // Debug logging with reduced frequency (development only)
  if (__DEV__ && shouldFetch) {
    console.log('[useDriverProfile] Query enabled for user:', user?.id);
  }
  
  return useQuery({
    queryKey: queryKeys.driverProfile,
    queryFn,
    enabled: shouldFetch,
    
    // Optimization: Extended stale time for driver profile (more static data)
    staleTime: 1000 * 60 * 30, // 30 minutes (increased from 15)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours (increased from 1)
    
    // Optimization: Reduced refetch frequency
    refetchOnWindowFocus: false,
    refetchOnMount: (query) => query.isStale(), // Only refetch if stale
    refetchOnReconnect: true,
    
    // Optimization: Smart retry with exponential backoff
    retry: (failureCount, error: any) => {
      if (__DEV__) {
        console.log('[useDriverProfile] Retry attempt:', failureCount, 'Error status:', error?.response?.status);
      }
      // Don't retry client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // Error handling
    throwOnError: false,
    
    // Optimization: Memoized select function
    select: selectData,
  });
}; 