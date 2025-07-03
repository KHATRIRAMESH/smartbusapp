import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useParentChildren } from '@/hooks/parent/useParentChildren';
import CustomText from '@/components/shared/CustomText';
import ChildCard from '@/components/parent/ChildCard';
import ParentMapScreen from '@/components/parent/ParentMapScreen';

interface Child {
  id: string;
  name: string;
  class: string;
  busId: string;
  busName: string;
  schoolName: string;
  pickupStop: string;
  dropStop: string;
  isPresent: boolean;
}

const ParentHomeScreen = () => {
  const { data: children, isLoading, error } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<{id: string, name: string, busId: string} | null>(null);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CustomText>Loading children...</CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CustomText style={styles.errorText}>Error loading children</CustomText>
      </View>
    );
  }

  if (selectedChild) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedChild(null)}>
            <CustomText style={styles.backButton}>← Back to Children</CustomText>
          </TouchableOpacity>
          <CustomText style={styles.title}>Tracking {selectedChild.name}</CustomText>
        </View>
        <ParentMapScreen busId={selectedChild.busId} childName={selectedChild.name} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>My Children</CustomText>
      <ScrollView style={styles.scrollView}>
        {children?.map((child: Child) => (
          <TouchableOpacity
            key={child.id}
            onPress={() => setSelectedChild({
              id: child.id,
              name: child.name,
              busId: child.busId
            })}
          >
            <ChildCard child={child} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginVertical: 16,
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
});

export default ParentHomeScreen; 