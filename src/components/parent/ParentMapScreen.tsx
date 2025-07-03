import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useParentTracking } from '@/hooks/parent/useParentTracking';
import { Image } from 'react-native';
import CustomText from '../shared/CustomText';

interface ParentMapScreenProps {
  busId: string;
  childName: string;
}

const ParentMapScreen: React.FC<ParentMapScreenProps> = ({ busId, childName }) => {
  const { busLocation, error, isTracking, startTracking, stopTracking } = useParentTracking();

  useEffect(() => {
    startTracking(busId);
    return () => stopTracking();
  }, [busId]);

  if (error) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.errorText}>{error}</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {busLocation ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: busLocation.coords.latitude,
              longitude: busLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: busLocation.coords.latitude,
                longitude: busLocation.coords.longitude,
              }}
              title={`${childName}'s Bus`}
              description={`Status: ${busLocation.status}`}
            >
              <Image
                source={require('@/assets/images/bus-location.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          </MapView>
          <View style={styles.statusContainer}>
            <CustomText style={styles.statusText}>
              Status: {busLocation.status}
            </CustomText>
            <CustomText style={styles.updatedText}>
              Last updated: {new Date(busLocation.lastUpdated).toLocaleTimeString()}
            </CustomText>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <CustomText>Loading bus location...</CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  updatedText: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ParentMapScreen; 