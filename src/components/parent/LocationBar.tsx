import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useParentTracking } from '../../hooks/parent/useParentTracking';
import { useParentProfile } from '../../hooks/parent/useParentProfile';
import GoogleMapView from '../shared/GoogleMapView';
import BusStatusTimeline from '../shared/BusStatusTimeline';
import { locationStyles } from '../../styles/locationStyles';
import { CustomText } from '../shared/CustomText';

export const LocationBar = () => {
  const { profile, isLoading: profileLoading } = useParentProfile();
  const { busLocations, error, subscribeToBus, unsubscribeFromBus } = useParentTracking();

  useEffect(() => {
    // Subscribe to buses for all children
    if (profile?.children) {
      profile.children.forEach(child => {
        if (child.busId) {
          subscribeToBus(child.busId);
        }
      });
    }

    // Cleanup subscriptions
    return () => {
      if (profile?.children) {
        profile.children.forEach(child => {
          if (child.busId) {
            unsubscribeFromBus(child.busId);
          }
        });
      }
    };
  }, [profile]);

  if (profileLoading) {
    return (
      <View style={styles.container}>
        <CustomText>Loading...</CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.errorText}>{error}</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoogleMapView
        style={styles.map}
        markers={Object.values(busLocations).map(bus => ({
          id: bus.busId,
          coordinate: {
            latitude: bus.coords.latitude,
            longitude: bus.coords.longitude,
          },
          title: `Bus ${bus.busId}`,
          description: `Status: ${bus.status}`,
        }))}
      />
      <View style={styles.statusContainer}>
        {profile?.children?.map(child => {
          const bus = child.busId ? busLocations[child.busId] : null;
          return (
            <View key={child.id} style={styles.childStatus}>
              <CustomText style={styles.childName}>{child.name}</CustomText>
              <BusStatusTimeline
                status={bus?.status || 'offline'}
                lastUpdate={bus?.timestamp}
                pickupStop={child.pickupStop}
                dropStop={child.dropStop}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
  statusContainer: {
    padding: 16,
  },
  childStatus: {
    marginBottom: 16,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
});
