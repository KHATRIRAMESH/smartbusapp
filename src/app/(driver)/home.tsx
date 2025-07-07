import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import CustomText from '@/components/shared/CustomText';
import DriverMapScreen from '@/components/driver/DriverMapScreen';
import { useDriverStore } from '@/store/driverStore';

const DriverHomeScreen = () => {
  const { isTracking, startTracking, stopTracking, updateBusStatus, error } = useDriverLocation();
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>Loading bus information...</CustomText>
        </View>
      </View>
    );
  }

  if (!busInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>No bus assigned to driver</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={loadDriverBus}>
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

        {/* Current Status Info */}
        <View style={styles.infoContainer}>
          <CustomText style={styles.infoText}>
            Location Sharing: {isTracking ? '🟢 Active' : '🔴 Inactive'}
          </CustomText>
          <CustomText style={styles.infoText}>
            Current Status: {getStatusText(status)}
          </CustomText>
        </View>
      </View>

      {error && (
        <CustomText style={styles.errorText}>{error}</CustomText>
      )}

      <DriverMapScreen />
    </View>
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Ensure Expo Router recognizes this as a screen component
export { DriverHomeScreen as default }; 