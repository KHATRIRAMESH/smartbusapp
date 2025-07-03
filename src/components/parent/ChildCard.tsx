import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText } from '../shared/CustomText';
import BusStatusTimeline from '../shared/BusStatusTimeline';

interface Child {
  id: string;
  name: string;
  class: string;
  busId: string | null;
  pickupStop: string;
  dropStop: string;
  isPresent: boolean;
}

interface ChildCardProps {
  child: Child;
}

const ChildCard: React.FC<ChildCardProps> = ({ child }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CustomText style={styles.name}>{child.name}</CustomText>
        <CustomText style={styles.class}>Class {child.class}</CustomText>
      </View>

      <View style={styles.details}>
        <View style={styles.stopInfo}>
          <CustomText style={styles.label}>Pickup Stop:</CustomText>
          <CustomText style={styles.value}>{child.pickupStop}</CustomText>
        </View>
        <View style={styles.stopInfo}>
          <CustomText style={styles.label}>Drop Stop:</CustomText>
          <CustomText style={styles.value}>{child.dropStop}</CustomText>
        </View>
      </View>

      {child.busId && (
        <View style={styles.busStatus}>
          <BusStatusTimeline busId={child.busId} />
        </View>
      )}

      {!child.busId && (
        <CustomText style={styles.noBus}>No bus assigned yet</CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  class: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    marginBottom: 16,
  },
  stopInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
  busStatus: {
    marginTop: 8,
  },
  noBus: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
});

export default ChildCard;
