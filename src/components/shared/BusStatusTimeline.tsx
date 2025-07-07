import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from './CustomText';
import { useParentTracking } from '../../hooks/parent/useParentTracking';

interface BusStatusTimelineProps {
  busId: string;
}

const BusStatusTimeline: React.FC<BusStatusTimelineProps> = ({ busId }) => {
  const { busLocation, isTracking, error } = useParentTracking();

  if (!isTracking || !busLocation) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.noData}>
          {error ? 'Connection error' : 'No bus data available'}
        </CustomText>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'in_service':
        return '#4CAF50';
      case 'on_trip':
        return '#FF9800';
      case 'at_stop':
        return '#2196F3';
      case 'offline':
        return '#f44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'ONLINE';
      case 'on_trip':
        return 'ON TRIP';
      case 'in_service':
        return 'IN SERVICE';
      case 'at_stop':
        return 'AT STOP';
      case 'offline':
        return 'OFFLINE';
      default:
        return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(busLocation.status) },
          ]}
        />
        <View style={[
          styles.statusLine,
          { backgroundColor: busLocation.status === 'offline' ? '#f44336' : '#E0E0E0' }
        ]} />
      </View>
      <View style={styles.content}>
        <CustomText style={[
          styles.status,
          { color: getStatusColor(busLocation.status) }
        ]}>
          {getStatusText(busLocation.status)}
        </CustomText>
        <CustomText style={styles.lastUpdate}>
          Last updated: {busLocation.lastUpdated ? 
            new Date(busLocation.lastUpdated).toLocaleTimeString() : 
            'Never'
          }
        </CustomText>
        {busLocation.coords && (
          <CustomText style={styles.locationInfo}>
            Speed: {busLocation.coords.speed ? 
              `${Math.round(busLocation.coords.speed * 3.6)} km/h` : 
              'N/A'
            }
          </CustomText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusLine: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationInfo: {
    fontSize: 12,
    color: '#888',
  },
  noData: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default BusStatusTimeline; 