import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomText } from '../shared/CustomText';
import { useAuthStore } from '../../store/authStore';

interface SettingModalProps {
  visible: boolean;
  onClose: () => void;
  parent: {
    name: string;
    email: string;
    phone: string;
  } | null | undefined;
}

const SettingModal: React.FC<SettingModalProps> = ({ visible, onClose, parent }) => {
  const logout = useAuthStore((state) => state.logout);

  if (!parent) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <CustomText style={styles.title}>Settings</CustomText>
            <TouchableOpacity onPress={onClose}>
              <CustomText style={styles.closeButton}>✕</CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <CustomText style={styles.sectionTitle}>Profile</CustomText>
            <View style={styles.profileInfo}>
              <CustomText style={styles.label}>Name</CustomText>
              <CustomText style={styles.value}>{parent.name}</CustomText>
            </View>
            <View style={styles.profileInfo}>
              <CustomText style={styles.label}>Email</CustomText>
              <CustomText style={styles.value}>{parent.email}</CustomText>
            </View>
            <View style={styles.profileInfo}>
              <CustomText style={styles.label}>Phone</CustomText>
              <CustomText style={styles.value}>{parent.phone}</CustomText>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <CustomText style={styles.logoutText}>Logout</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingModal;
