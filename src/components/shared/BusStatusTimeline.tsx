import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BusTracking } from "@/utils/types";

interface BusStatusTimelineProps {
  busTracking: BusTracking[];
}

const getStatusText = (status: string) => {
  switch (status) {
    case "in_transit":
      return "In Bus";
    case "at_school":
      return "At School";
    case "at_pickup":
      return "At Pickup";
    case "at_drop":
      return "At Drop";
    default:
      return "Unknown";
  }
};

const BusStatusTimeline: React.FC<BusStatusTimelineProps> = ({ busTracking }) => (
  <View style={styles.timeline}>
    {busTracking.map((tracking) => (
      <View key={tracking.bus.id} style={styles.timelineItem}>
        <Text style={styles.timelineTime}>{tracking.currentLocation.estimatedArrival}</Text>
        <Text style={styles.timelineIcon}>🚌</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.timelineLabel}>
            Bus {tracking.bus.busNumber} - {getStatusText(tracking.currentLocation.status)}
          </Text>
          <Text style={styles.timelineAddress}>
            {tracking.children.length} children on board • {tracking.currentLocation.speed}
          </Text>
          {tracking.driver && (
            <Text style={styles.driverInfo}>
              Driver: {tracking.driver.name} • {tracking.driver.phone}
            </Text>
          )}
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  timeline: { paddingHorizontal: 16, marginBottom: 32 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  timelineTime: { width: 48, fontSize: 13, color: "#888", marginTop: 2 },
  timelineIcon: { fontSize: 20, marginRight: 8 },
  timelineLabel: { fontSize: 15, fontWeight: "bold" },
  timelineAddress: { fontSize: 13, color: "#888" },
  driverInfo: { fontSize: 12, color: "#666", marginTop: 2 },
});

export default React.memo(BusStatusTimeline); 