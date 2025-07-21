import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Optimization: Advanced query client configuration with intelligent caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimization: Smart stale time based on data type
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30,   // 30 minutes garbage collection
      
      // Optimization: Intelligent retry logic
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry server errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Optimization: Reduce background refetches for battery saving
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: (query) => query.isStale(), // Only refetch if data is stale
      
      // Optimization: Network-aware behavior
      networkMode: 'online',
      
      // Optimization: Disable automatic intervals by default
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Optimization: Smart mutation retry
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false; // Don't retry client errors
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      networkMode: 'online',
    },
  },
});

// Optimization: Enhanced query key factory with better cache segmentation
export const queryKeys = {
  // Static data (longer cache) - 30 minutes stale time
  parentProfile: ['parentProfile'],
  driverProfile: ['driverProfile'],
  
  // Semi-static data (medium cache) - 15 minutes stale time
  busInfo: (driverId: string) => ['bus', driverId],
  parentChildren: ['parentChildren'],
  
  // Dynamic data (shorter cache) - 5 minutes stale time
  busLocation: (busId: string) => ['busLocation', busId],
  
  // Real-time data (minimal cache) - 30 seconds stale time
  tracking: (busId: string) => ['tracking', busId],
  
  // Invalidation helpers
  all: ['smartbus'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filter: string) => [...queryKeys.lists(), filter] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Optimization: Query client methods for advanced cache management
export const queryClientMethods = {
  // Invalidate all queries for a specific user role
  invalidateUserQueries: (role: 'parent' | 'driver') => {
    if (role === 'parent') {
      queryClient.invalidateQueries({ queryKey: queryKeys.parentProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.parentChildren });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
      queryClient.invalidateQueries({ queryKey: ['bus'] });
    }
  },
  
  // Prefetch critical data
  prefetchUserData: async (userId: string, role: 'parent' | 'driver') => {
    if (role === 'driver') {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.busInfo(userId),
        staleTime: 1000 * 60 * 15, // 15 minutes for bus info
      });
    }
  },
  
  // Clear all cached data (useful for logout)
  clearAllQueries: () => {
    queryClient.clear();
  },
  
  // Get cache size for debugging
  getCacheSize: () => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().length;
  },
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 