import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ParentProfile } from "@/utils/types";

interface ParentCardProps {
  parentProfile: ParentProfile;
}

const ParentCard: React.FC<ParentCardProps> = ({ parentProfile }) => (
  <View style={styles.guardianCard}>
    <View style={styles.guardianAvatarPlaceholder}>
      <Text style={styles.guardianAvatarText}>{parentProfile.name.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.guardianName}>
        {parentProfile.name} <Text style={styles.guardianRelation}>(Parent)</Text>
      </Text>
      <Text style={styles.guardianContact}>{parentProfile.phone}</Text>
      <Text style={styles.guardianContact}>{parentProfile.email}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  guardianCard: {
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
  guardianAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  guardianAvatarText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  guardianName: { fontSize: 15, fontWeight: "bold" },
  guardianRelation: { fontSize: 13, color: "#888" },
  guardianContact: { fontSize: 13, color: "#888" },
});

export default React.memo(ParentCard); 