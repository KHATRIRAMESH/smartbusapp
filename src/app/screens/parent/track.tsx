import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator, Alert } from "react-native";
import GoogleMapView from "@/components/shared/GoogleMapView";
import BottomSheet from "@gorhom/bottom-sheet";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useLocalSearchParams } from "expo-router";
import { useParentChildren } from '@/hooks/parent/useParentChildren';
import { useParentTracking } from '../../../hooks/parent/useParentTracking';
import { Child, BusTracking } from '@/utils/types/types';

const { height } = Dimensions.get("window");

const TimelineItem = React.memo(({ item }: { item: any }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconWrap}>
      <Text style={styles.timelineIcon}>{item.icon}</Text>
      <View style={styles.timelineLine} />
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTime}>{item.time}</Text>
      <Text style={styles.timelineTitle}>{item.title}</Text>
      <Text style={styles.timelineAddress}>{item.address}</Text>
    </View>
  </View>
));

const TrackScreen = () => {
  const { childId } = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height * 0.45, height * 0.85], []);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "status", title: "Status" },
    { key: "history", title: "History" },
    { key: "businfo", title: "Bus Info" },
  ]);

  // Fetch children and find the selected child
  const {
    data: children = [],
    isLoading: loadingChildren,
    error: errorChildren,
  } = useParentChildren();
  const child = useMemo(() => children.find((c) => c.id === childId), [children, childId]);

  // Fetch tracking info for the selected child
  const {
    data: tracking,
    isLoading: loadingTracking,
    error: errorTracking,
  } = useParentTracking(childId as string, !!childId);

  const loading = loadingChildren || loadingTracking;
  const error = errorChildren || errorTracking;

  // Timeline data for status tab
  const timelineData = tracking
    ? [
        {
          time: tracking.currentLocation.estimatedArrival,
          title: tracking.currentLocation.status,
          address: `${tracking.currentLocation.latitude}, ${tracking.currentLocation.longitude}`,
          icon: "🚌",
        },
      ]
    : [];

  const StatusRoute = useCallback(() => (
    <FlatList
      data={timelineData}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => <TimelineItem item={item} />}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text>No status data.</Text>}
    />
  ), [timelineData]);
  const HistoryRoute = () => (
    <View style={styles.tabContent}><Text>History (placeholder)</Text></View>
  );
  const BusInfoRoute = () => (
    <View style={styles.tabContent}><Text>Bus Info (placeholder)</Text></View>
  );

  const renderScene = SceneMap({
    status: StatusRoute,
    history: HistoryRoute,
    businfo: BusInfoRoute,
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#23235B" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#23235B" }}>
        <Text style={{ color: "#fff" }}>Failed to load data.</Text>
      </View>
    );
  }
  if (!child || !tracking) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23235B" }}>
      {/* Map at the top, fills the screen */}
      <View style={StyleSheet.absoluteFill}>
        <GoogleMapView role="user" />
      </View>
      {/* Draggable Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        {/* Child Info Header */}
        <View style={styles.childHeader}>
          <View style={styles.childAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childStatus}>
              <Text style={styles.statusDot}>●</Text> {tracking.currentLocation.status}
            </Text>
          </View>
        </View>
        {/* Tabs */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={styles.tabIndicator}
              style={styles.tabBar}
              activeColor="#23235B"
              inactiveColor="#888"
              pressColor="#F5E6E0"
              tabStyle={{ minHeight: 48 }}
            />
          )}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetHandle: {
    backgroundColor: "#23235B",
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
    marginRight: 16,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23235B",
  },
  childStatus: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "bold",
    marginTop: 2,
  },
  statusDot: {
    color: "#2ecc71",
    fontSize: 18,
    marginRight: 4,
  },
  tabBar: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: -2,
  },
  tabLabel: {
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "none",
  },
  tabIndicator: {
    backgroundColor: "#23235B",
    height: 3,
    borderRadius: 2,
    marginHorizontal: 24,
  },
  tabContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  timelineIconWrap: {
    alignItems: "center",
    width: 32,
    marginRight: 8,
  },
  timelineIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#F5E6E0",
    marginTop: 2,
    marginBottom: -2,
    alignSelf: "center",
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineTime: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#23235B",
  },
  timelineAddress: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
});

export default TrackScreen; 