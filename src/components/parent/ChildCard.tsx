import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Child, BusTracking } from "@/utils/types";

interface ChildCardProps {
  child: Child;
  busTrackingData?: BusTracking;
  onMarkAbsent: (childId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_transit":
      return "#2ecc71";
    case "at_school":
      return "#3498db";
    case "at_pickup":
      return "#f39c12";
    case "at_drop":
      return "#e74c3c";
    default:
      return "#95a5a6";
  }
};

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

const ChildCard: React.FC<ChildCardProps> = ({ child, busTrackingData, onMarkAbsent }) => {
  const status = busTrackingData?.currentLocation?.status || "unknown";
  return (
    <View style={styles.childCard}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childSchool}>{child.route?.name || "No route assigned"}</Text>
        <Text style={styles.childClass}>{child.class}</Text>
        <Text style={[styles.childStatus, { color: getStatusColor(status) }]}>● {getStatusText(status)}</Text>
        {busTrackingData && (
          <Text style={styles.etaText}>ETA: {busTrackingData.currentLocation.estimatedArrival}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.absentBtn, { backgroundColor: "#e67e22" }]}
        onPress={() => onMarkAbsent(child.id)}
      >
        <Text style={{ color: "#fff" }}>Mark Absent</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  childName: { fontSize: 16, fontWeight: "bold" },
  childSchool: { fontSize: 14, color: "#888" },
  childClass: { fontSize: 14, color: "#888" },
  childStatus: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  etaText: { fontSize: 12, color: "#666", marginTop: 2 },
  absentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
});

export default React.memo(ChildCard);
