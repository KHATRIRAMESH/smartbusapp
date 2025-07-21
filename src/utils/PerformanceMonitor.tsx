import React, { useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface PerformanceMetrics {
  componentRenders: Map<string, number>;
  apiCalls: Map<string, { count: number; totalTime: number; errors: number }>;
  memoryUsage: Map<string, number>;
  batteryOptimizations: {
    locationUpdatesSkipped: number;
    backgroundTransitions: number;
    socketReconnections: number;
  };
  cacheHits: Map<string, { hits: number; misses: number }>;
  lastUpdated: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private isEnabled: boolean;
  private startTime: number;

  private constructor() {
    this.isEnabled = __DEV__;
    this.startTime = Date.now();
    this.metrics = {
      componentRenders: new Map(),
      apiCalls: new Map(),
      memoryUsage: new Map(),
      batteryOptimizations: {
        locationUpdatesSkipped: 0,
        backgroundTransitions: 0,
        socketReconnections: 0,
      },
      cacheHits: new Map(),
      lastUpdated: Date.now(),
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component renders for optimization monitoring
  trackComponentRender(componentName: string) {
    if (!this.isEnabled) return;
    
    const current = this.metrics.componentRenders.get(componentName) || 0;
    this.metrics.componentRenders.set(componentName, current + 1);
    this.metrics.lastUpdated = Date.now();
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number, isError: boolean = false) {
    if (!this.isEnabled) return;

    const current = this.metrics.apiCalls.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
    this.metrics.apiCalls.set(endpoint, {
      count: current.count + 1,
      totalTime: current.totalTime + duration,
      errors: current.errors + (isError ? 1 : 0),
    });
    this.metrics.lastUpdated = Date.now();
  }

  // Track memory usage (simplified)
  trackMemoryUsage(component: string, size: number) {
    if (!this.isEnabled) return;
    
    this.metrics.memoryUsage.set(component, size);
    this.metrics.lastUpdated = Date.now();
  }

  // Track battery optimization metrics
  trackLocationUpdateSkipped() {
    if (!this.isEnabled) return;
    this.metrics.batteryOptimizations.locationUpdatesSkipped++;
    this.metrics.lastUpdated = Date.now();
  }

  trackBackgroundTransition() {
    if (!this.isEnabled) return;
    this.metrics.batteryOptimizations.backgroundTransitions++;
    this.metrics.lastUpdated = Date.now();
  }

  trackSocketReconnection() {
    if (!this.isEnabled) return;
    this.metrics.batteryOptimizations.socketReconnections++;
    this.metrics.lastUpdated = Date.now();
  }

  // Track cache performance
  trackCacheHit(cacheKey: string, isHit: boolean) {
    if (!this.isEnabled) return;

    const current = this.metrics.cacheHits.get(cacheKey) || { hits: 0, misses: 0 };
    if (isHit) {
      current.hits++;
    } else {
      current.misses++;
    }
    this.metrics.cacheHits.set(cacheKey, current);
    this.metrics.lastUpdated = Date.now();
  }

  // Get comprehensive performance report
  getPerformanceReport(): string {
    if (!this.isEnabled) return 'Performance monitoring disabled in production';

    const uptime = Date.now() - this.startTime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);

    let report = `\n📊 SmartBus Performance Report (${uptimeHours}h uptime)\n`;
    report += `${'='.repeat(50)}\n\n`;

    // Component Render Analysis
    report += `🔄 Component Renders:\n`;
    const sortedRenders = Array.from(this.metrics.componentRenders.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedRenders.forEach(([component, count]) => {
      const rendersPerHour = (count / (uptime / (1000 * 60 * 60))).toFixed(1);
      report += `  ${component}: ${count} renders (${rendersPerHour}/hr)\n`;
    });

    // API Performance Analysis
    report += `\n🌐 API Performance:\n`;
    this.metrics.apiCalls.forEach((stats, endpoint) => {
      const avgTime = (stats.totalTime / stats.count).toFixed(2);
      const errorRate = ((stats.errors / stats.count) * 100).toFixed(1);
      report += `  ${endpoint}:\n`;
      report += `    Calls: ${stats.count}, Avg: ${avgTime}ms, Errors: ${errorRate}%\n`;
    });

    // Battery Optimization Metrics
    report += `\n🔋 Battery Optimizations:\n`;
    const batt = this.metrics.batteryOptimizations;
    report += `  Location updates skipped: ${batt.locationUpdatesSkipped}\n`;
    report += `  Background transitions: ${batt.backgroundTransitions}\n`;
    report += `  Socket reconnections: ${batt.socketReconnections}\n`;

    // Cache Performance
    report += `\n💾 Cache Performance:\n`;
    let totalHits = 0;
    let totalMisses = 0;
    this.metrics.cacheHits.forEach((stats, key) => {
      totalHits += stats.hits;
      totalMisses += stats.misses;
      const hitRate = ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1);
      report += `  ${key}: ${hitRate}% hit rate (${stats.hits}/${stats.hits + stats.misses})\n`;
    });
    
    const overallHitRate = totalHits + totalMisses > 0 
      ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1)
      : '0';
    report += `  Overall cache hit rate: ${overallHitRate}%\n`;

    // Memory Usage
    if (this.metrics.memoryUsage.size > 0) {
      report += `\n🧠 Memory Usage:\n`;
      this.metrics.memoryUsage.forEach((size, component) => {
        report += `  ${component}: ${(size / 1024 / 1024).toFixed(2)} MB\n`;
      });
    }

    // Optimization Recommendations
    report += `\n💡 Optimization Recommendations:\n`;
    
    if (batt.socketReconnections > 5) {
      report += `  ⚠️  High socket reconnections (${batt.socketReconnections}) - Check network stability\n`;
    }
    
    const highRenderComponents = sortedRenders.filter(([, count]) => count > 100);
    if (highRenderComponents.length > 0) {
      report += `  ⚠️  High render components detected - Consider memoization\n`;
    }
    
    if (overallHitRate !== '0' && parseFloat(overallHitRate) < 80) {
      report += `  ⚠️  Low cache hit rate (${overallHitRate}%) - Review caching strategy\n`;
    }
    
    if (totalHits + totalMisses === 0) {
      report += `  ✅ No cache issues detected\n`;
    }
    
    if (batt.locationUpdatesSkipped > 0) {
      report += `  ✅ Battery optimization active (${batt.locationUpdatesSkipped} updates skipped)\n`;
    }

    report += `\n📱 Report generated: ${new Date().toLocaleString()}\n`;
    
    return report;
  }

  // Reset metrics for fresh monitoring session
  resetMetrics() {
    if (!this.isEnabled) return;
    
    this.startTime = Date.now();
    this.metrics = {
      componentRenders: new Map(),
      apiCalls: new Map(),
      memoryUsage: new Map(),
      batteryOptimizations: {
        locationUpdatesSkipped: 0,
        backgroundTransitions: 0,
        socketReconnections: 0,
      },
      cacheHits: new Map(),
      lastUpdated: Date.now(),
    };
  }

  // Get metrics for debugging
  getMetrics(): PerformanceMetrics | null {
    return this.isEnabled ? { ...this.metrics } : null;
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled && __DEV__;
  }
}

// React Hook for component performance tracking
export const usePerformanceTracker = (componentName: string) => {
  const renderCount = useRef(0);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    renderCount.current++;
    monitor.trackComponentRender(componentName);
  });

  return {
    renderCount: renderCount.current,
    logPerformance: () => {
      if (__DEV__) {
        console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);
      }
    },
  };
};

// React Hook for API call tracking
export const useApiPerformanceTracker = () => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    trackApiCall: (endpoint: string, duration: number, isError: boolean = false) => {
      monitor.trackApiCall(endpoint, duration, isError);
    },
    trackCacheHit: (cacheKey: string, isHit: boolean) => {
      monitor.trackCacheHit(cacheKey, isHit);
    },
  };
};

// React Hook for app state performance monitoring
export const useAppStatePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        monitor.trackBackgroundTransition();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [monitor]);
};

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for manual tracking
export const trackLocationOptimization = () => {
  performanceMonitor.trackLocationUpdateSkipped();
};

export const trackSocketReconnection = () => {
  performanceMonitor.trackSocketReconnection();
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

export const resetPerformanceMetrics = () => {
  performanceMonitor.resetMetrics();
};

// Development utility to log performance report
export const logPerformanceReport = () => {
  if (__DEV__) {
    console.log(performanceMonitor.getPerformanceReport());
  }
};

export default PerformanceMonitor; 