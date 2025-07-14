import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import CustomText from '@/components/shared/CustomText';
import DriverMapScreen from '@/components/driver/DriverMapScreen';
import { useDriverStore } from '@/store/driverStore';

const DriverHomeScreen = () => {
  const { 
    isTracking, 
    isBackgroundTracking, 
    startTracking, 
    stopTracking, 
    updateBusStatus, 
    error,
    syncStatus 
  } = useDriverLocation();
  const { busInfo, status, loadDriverBus, isLoading } = useDriverStore();

  useEffect(() => {
    loadDriverBus();
  }, []);

  const handleStatusChange = () => {
    const statusOptions = [
      { label: 'Online', value: 'online' },
      { label: 'On Trip', value: 'on_trip' },
      { label: 'Offline', value: 'offline' },
    ];

    Alert.alert(
      'Change Status',
      'Select your current status:',
      [
        ...statusOptions.map(option => ({
          text: option.label,
          onPress: () => updateBusStatus(option.value as 'online' | 'offline' | 'on_trip'),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'online': return '#4CAF50';
      case 'on_trip': return '#FF9800';
      case 'offline': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'online': return 'Online';
      case 'on_trip': return 'On Trip';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatLastSyncTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Over 24h ago';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>Loading bus information...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (!busInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>No bus assigned to driver</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={loadDriverBus}>
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.busInfo}>
          <CustomText style={styles.title}>Bus {busInfo.busNumber}</CustomText>
          <CustomText style={styles.subtitle}>Plate: {busInfo.plateNumber}</CustomText>
        </View>
        
        {/* Status Display and Control */}
        <View style={styles.statusContainer}>
          <CustomText style={styles.statusLabel}>Status:</CustomText>
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}
            onPress={handleStatusChange}
          >
            <CustomText style={styles.statusText}>
              {getStatusText(status)}
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Location Tracking Button */}
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <CustomText style={styles.buttonText}>
            {isTracking ? 'Stop Sharing Location' : 'Start Sharing Location'}
          </CustomText>
        </TouchableOpacity>

        {/* Enhanced Status Info with Background Tracking */}
        <View style={styles.infoContainer}>
          <CustomText style={styles.infoText}>
            Location Sharing: {isTracking ? '🟢 Active' : '🔴 Inactive'}
          </CustomText>
          <CustomText style={styles.infoText}>
            Current Status: {getStatusText(status)}
          </CustomText>
          
          {/* Background Tracking Status */}
          {isTracking && (
            <View style={styles.backgroundTrackingContainer}>
              <CustomText style={[styles.infoText, styles.backgroundTrackingText]}>
                Background Mode: {isBackgroundTracking ? '🌙 Active' : '☀️ Foreground'}
              </CustomText>
              <CustomText style={styles.backgroundDescription}>
                {isBackgroundTracking 
                  ? 'Location tracked even when using other apps'
                  : 'Switch to other apps to enable background tracking'
                }
              </CustomText>
            </View>
          )}

          {/* Sync Status */}
          {syncStatus && isTracking && (
            <View style={styles.syncStatusContainer}>
              <CustomText style={styles.syncStatusTitle}>Sync Status:</CustomText>
              {syncStatus.pendingCount > 0 ? (
                <CustomText style={[styles.syncStatusText, styles.pendingSync]}>
                  📤 {syncStatus.pendingCount} location{syncStatus.pendingCount > 1 ? 's' : ''} pending sync
                </CustomText>
              ) : (
                <CustomText style={[styles.syncStatusText, styles.syncedStatus]}>
                  ✅ All locations synced
                </CustomText>
              )}
              <CustomText style={styles.lastSyncText}>
                Last sync: {formatLastSyncTime(syncStatus.lastSyncTime)}
              </CustomText>
            </View>
          )}
        </View>

        {/* Background Location Permission Notice */}
        {isTracking && !isBackgroundTracking && (
          <View style={styles.permissionNotice}>
            <CustomText style={styles.permissionNoticeTitle}>💡 Background Location</CustomText>
            <CustomText style={styles.permissionNoticeText}>
              For continuous tracking when using other apps, ensure background location permission is granted in your device settings.
            </CustomText>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>{error}</CustomText>
        </View>
      )}

      <DriverMapScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  busInfo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  backgroundTrackingContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backgroundTrackingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backgroundDescription: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  syncStatusContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  syncStatusText: {
    fontSize: 13,
    marginBottom: 2,
  },
  pendingSync: {
    color: '#FF9800',
  },
  syncedStatus: {
    color: '#4CAF50',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#888',
  },
  permissionNotice: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: 12,
  },
  permissionNoticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  permissionNoticeText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { DriverHomeScreen as default }; 