import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '@/components/shared/CustomText';
import { Colors } from '@/utils/Constants';

interface BusLocation {
  coords: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
  };
  status: string;
  lastUpdated: Date;
}

interface LocationBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  busLocation: BusLocation | null;
  isStale: boolean;
  error: string | null;
}

const LocationBar: React.FC<LocationBarProps> = ({
  isExpanded,
  onToggle,
  busLocation,
  isStale,
  error,
}) => {
  const getStatusColor = () => {
    if (error) return Colors.error;
    if (isStale) return '#856404';
    return Colors.success;
  };

  const getStatusText = () => {
    if (error) return 'Offline';
    if (isStale) return 'Stale';
    if (busLocation?.status) return busLocation.status;
    return 'Unknown';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isExpanded && styles.expandedContainer]} 
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.statusSection}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <CustomText variant="h6" style={styles.statusText}>
            {getStatusText()}
          </CustomText>
        </View>

        {busLocation && (
          <View style={styles.infoSection}>
            <CustomText variant="h7" style={styles.infoText}>
              Speed: {Math.round(busLocation.coords.speed || 0)} km/h
            </CustomText>
            <CustomText variant="h7" style={styles.infoText}>
              Updated: {new Date(busLocation.lastUpdated).toLocaleTimeString()}
            </CustomText>
          </View>
        )}
      </View>

      <CustomText variant="h7" style={styles.toggleText}>
        {isExpanded ? 'Show Details ▼' : 'Full Map ▲'}
      </CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expandedContainer: {
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: Colors.text,
    textTransform: 'capitalize',
  },
  infoSection: {
    alignItems: 'flex-end',
  },
  infoText: {
    color: Colors.textLight,
    marginBottom: 2,
  },
  toggleText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LocationBar;
