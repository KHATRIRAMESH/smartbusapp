import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { appAxios } from "@/service/apiInterceptors";
import { Child, ParentProfile } from '../../../utils/types/types';
import ChildCard from "@/components/parent/ChildCard";
import ParentCard from "@/components/parent/ParentCard";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParentChildren } from '../../../hooks/parent/useParentChildren';
import { useParentProfile } from '../../../hooks/parent/useParentProfile';

const MemoizedChildCard = React.memo(ChildCard);

const ParentHome = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: children = [],
    isLoading: loadingChildren,
    refetch: refetchChildren,
    isRefetching: isRefetchingChildren,
  } = useParentChildren();
  const {
    data: parentProfile,
    isLoading: loadingProfile,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useParentProfile();

  const loading = loadingChildren || loadingProfile;
  const refreshing = isRefetchingChildren || isRefetchingProfile;

  const onRefresh = async () => {
    await Promise.all([refetchChildren(), refetchProfile()]);
  };

  const handleMarkAbsent = async (childId: string) => {
    try {
      // TODO: Implement mark absent/present API
      Alert.alert("Success", "Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["children"] });
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleTrackChild = useCallback((child: Child) => {
    router.push({ pathname: './track', params: { childId: child.id } });
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Header for FlatList
  const ListHeaderComponent = (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity>
          <Text style={styles.bell}>🔔</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Child Profile</Text>
    </>
  );

  // Footer for FlatList
  const ListFooterComponent = parentProfile ? (
    <View style={styles.guardianSection}>
      <Text style={styles.sectionTitle}>Guardian Profile</Text>
      <View style={styles.guardianList}>
        <ParentCard parentProfile={parentProfile!} />
      </View>
    </View>
  ) : null;

  return (
    <FlatList
      data={children}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.childCardWrapper}>
          <MemoizedChildCard
            child={item}
            onMarkAbsent={handleMarkAbsent}
          />
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => handleTrackChild(item)}
          >
            <Text style={styles.trackBtnText}>Track</Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={styles.cardList}
      ListEmptyComponent={<Text>No children found.</Text>}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#23235B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  bell: { fontSize: 22, color: "#fff" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
    color: "#23235B",
  },
  cardList: { paddingHorizontal: 16 },
  childCardWrapper: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  trackBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#23235B",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 8,
  },
  trackBtnText: { color: "#fff", fontWeight: "bold" },
  guardianSection: {
    backgroundColor: "#F5E6E0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  guardianList: { paddingHorizontal: 16 },
});

export default ParentHome;
