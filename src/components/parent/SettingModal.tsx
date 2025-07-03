import { logout } from "@/service/authService";
import { useWS } from "@/service/WSProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SettingsModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const SettingsModal = ({ showModal, setShowModal }: SettingsModalProps) => {
  const { disconnect } = useWS();
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout(disconnect);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setShowModal(false);
    // Navigate to edit profile screen
    console.log("Navigate to edit profile");
  };

  const handleNotificationSettings = () => {
    setShowModal(false);
    // Navigate to notification settings
    console.log("Navigate to notification settings");
  };

  const handlePrivacySettings = () => {
    setShowModal(false);
    // Navigate to privacy settings
    console.log("Navigate to privacy settings");
  };

  const handleSupport = () => {
    setShowModal(false);
    // Navigate to support/help
    console.log("Navigate to support");
  };
  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Settings Options */}
          <ScrollView style={styles.settingsContent}>
            {/* Profile Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>Account</Text>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleEditProfile}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <Text style={styles.settingsItemText}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleNotificationSettings}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.settingsItemText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handlePrivacySettings}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="shield-outline" size={20} color="#666" />
                  <Text style={styles.settingsItemText}>
                    Privacy & Security
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>Support</Text>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleSupport}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="help-circle-outline" size={20} color="#666" />
                  <Text style={styles.settingsItemText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.settingsItemText}>
                    Terms & Conditions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.settingsItemText}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Logout Section */}
            <View style={styles.settingsSection}>
              <TouchableOpacity
                style={[styles.settingsItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="log-out-outline" size={20} color="#FF4444" />
                  <Text style={[styles.settingsItemText, styles.logoutText]}>
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  // New Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutItem: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ffe6e6",
  },
  logoutText: {
    color: "#FF4444",
    fontWeight: "600",
  },
});
