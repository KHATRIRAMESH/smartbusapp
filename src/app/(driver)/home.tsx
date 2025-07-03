import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import CustomText from '@/components/shared/CustomText';
import DriverMapScreen from '@/components/driver/DriverMapScreen';

const DriverHomeScreen = () => {
  const { isTracking, startTracking, stopTracking, error } = useDriverLocation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Bus Location</CustomText>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <CustomText style={styles.buttonText}>
            {isTracking ? 'Stop Sharing Location' : 'Start Sharing Location'}
          </CustomText>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
});

export default DriverHomeScreen; 