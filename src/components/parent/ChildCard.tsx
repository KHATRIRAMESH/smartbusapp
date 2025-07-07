import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import CustomText from '@/components/shared/CustomText';
import { Child } from '@/utils/types/types';
import { Colors } from '@/utils/Constants';

interface ChildCardProps {
  child: Child;
  onTrackPress?: () => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onTrackPress }) => {
  const router = useRouter();

  if (!child) {
    return null;
  }

  return (
    <View style={styles.card}>
      {/* Child Info Section */}
      <View style={styles.header}>
        <View style={styles.childInfo}>
          <Image 
            source={require('@/assets/images/boy-child.jpeg')} 
            style={styles.avatar} 
          />
          <View style={styles.nameContainer}>
            <CustomText variant="h4" fontFamily="SemiBold" style={styles.name}>
              {child.name || 'Unknown'}
            </CustomText>
            <CustomText variant="h6" style={styles.class}>
              Class {child.class || 'N/A'}
            </CustomText>
          </View>
        </View>
        <View style={[styles.statusBadge, child.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <CustomText variant="h7" style={styles.statusText}>
            {child.isActive ? 'Active' : 'Inactive'}
          </CustomText>
        </View>
      </View>

      {/* Bus Info Section */}
      {child.bus && (
        <View style={styles.busInfo}>
          <View style={styles.busHeader}>
            <CustomText variant="h5" fontFamily="SemiBold" style={styles.busNumber}>
              {child.bus.busNumber || 'No Bus Number'}
            </CustomText>
            <CustomText variant="h6" style={styles.plateNumber}>
              {child.bus.plateNumber || 'No Plate'}
            </CustomText>
          </View>
          {child.bus.driver && (
          <CustomText variant="h6" style={styles.driverName}>
              Driver: {child.bus.driver.name || 'Not Assigned'}
          </CustomText>
          )}
        </View>
      )}

      {/* Route Info Section */}
      {child.route && (
      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <CustomText variant="h6" fontFamily="SemiBold" style={styles.routeName}>
              {child.route.name || 'No Route'}
          </CustomText>
        </View>
        <View style={styles.stops}>
          <View style={styles.stopContainer}>
            <View style={styles.dot} />
            <CustomText variant="h6" style={styles.stopText}>
                Pickup: {child.pickupStop || 'Not Set'}
            </CustomText>
          </View>
          <View style={styles.stopContainer}>
            <View style={[styles.dot, styles.dropDot]} />
            <CustomText variant="h6" style={styles.stopText}>
                Drop: {child.dropStop || 'Not Set'}
            </CustomText>
          </View>
        </View>
      </View>
      )}

      {/* Action Buttons */}
      {child.bus && (
        <TouchableOpacity 
          style={[styles.trackButton, !child.bus && styles.disabledButton]} 
          onPress={onTrackPress}
          disabled={!child.bus}
        >
          <Image 
            source={require('@/assets/images/bus-location.png')} 
            style={[styles.trackIcon, !child.bus && styles.disabledIcon]} 
          />
          <CustomText variant="h6" fontFamily="SemiBold" style={[styles.trackText, !child.bus && styles.disabledText]}>
            {child.bus ? 'Track Bus Location' : 'No Bus Assigned'}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    color: Colors.text,
  },
  class: {
    color: Colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#E7F5EC',
  },
  inactiveBadge: {
    backgroundColor: '#FFE7E7',
  },
  statusText: {
    color: Colors.primary,
    textAlign: 'center',
  },
  busInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  busNumber: {
    color: Colors.primary,
    marginRight: 8,
  },
  plateNumber: {
    color: Colors.textLight,
  },
  driverName: {
    color: Colors.text,
  },
  routeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  routeHeader: {
    marginBottom: 8,
  },
  routeName: {
    color: Colors.primary,
  },
  stops: {
    marginTop: 8,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  dropDot: {
    backgroundColor: Colors.error,
  },
  stopText: {
    color: Colors.text,
    flex: 1,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  trackIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  disabledIcon: {
    tintColor: '#FFFFFF',
    opacity: 0.5,
  },
  trackText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#FFFFFF',
    opacity: 0.5,
  },
});

export default ChildCard;
