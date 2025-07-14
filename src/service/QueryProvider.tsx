import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Optimization: Advanced query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimization: Longer stale time for relatively static data
      staleTime: 1000 * 60 * 10, // 10 minutes (increased from 5)
      gcTime: 1000 * 60 * 60,    // 1 hour (increased from 30 minutes)
      retry: (failureCount, error: any) => {
        // Optimization: Smart retry logic
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 403) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Optimization: Reduce background refetches
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Optimization: Network-aware refetching
      networkMode: 'online',
      
      // Optimization: Selective background refetch
      refetchInterval: false, // Disable automatic refetch by default
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Optimization: Mutation retry logic
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false; // Don't retry client errors
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

// Optimization: Enhanced query key factory for better cache management
export const queryKeys = {
  // Static data (longer cache)
  parentProfile: ['parentProfile'],
  driverProfile: ['driverProfile'],
  busInfo: (driverId: string) => ['bus', driverId],
  
  // Dynamic data (shorter cache)
  parentChildren: ['parentChildren'],
  busLocation: (busId: string) => ['busLocation', busId],
  
  // Real-time data (very short cache)
  tracking: (busId: string) => ['tracking', busId],
};

// Optimization: Cache invalidation utilities
export const invalidateQueries = {
  parentProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.parentProfile }),
  parentChildren: () => queryClient.invalidateQueries({ queryKey: queryKeys.parentChildren }),
  busInfo: (driverId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.busInfo(driverId) }),
  allBusLocations: () => queryClient.invalidateQueries({ queryKey: ['busLocation'] }),
};

// Optimization: Prefetch utilities for better UX
export const prefetchQueries = {
  parentProfile: () => queryClient.prefetchQuery({
    queryKey: queryKeys.parentProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes
  }),
  parentChildren: () => queryClient.prefetchQuery({
    queryKey: queryKeys.parentChildren,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export the query client for manual cache management
export { queryClient }; 