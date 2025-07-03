import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText } from './CustomText';
import { useParentTracking } from '../../hooks/parent/useParentTracking';

interface BusStatusTimelineProps {
  busId: string;
}

const BusStatusTimeline: React.FC<BusStatusTimelineProps> = ({ busId }) => {
  const { busLocations } = useParentTracking();
  const busLocation = busLocations[busId];

  if (!busLocation) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.noData}>No bus data available</CustomText>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_service':
        return '#4CAF50';
      case 'at_stop':
        return '#2196F3';
      case 'offline':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
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
        <View style={styles.statusLine} />
      </View>
      <View style={styles.content}>
        <CustomText style={styles.status}>
          {busLocation.status.replace('_', ' ').toUpperCase()}
        </CustomText>
        <CustomText style={styles.lastUpdate}>
          Last updated: {new Date(busLocation.timestamp).toLocaleTimeString()}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
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
  },
  statusLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E0E0E0',
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
  },
  noData: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default BusStatusTimeline; 