import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomText from '../shared/CustomText';
import { logout } from '@/service/authService';
import ChangePasswordModal from './ChangePasswordModal';
import { Colors } from '@/utils/Constants';

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
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
  }
  };

  return (
    <>
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

            {!parent ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <CustomText style={styles.loadingText}>Loading profile...</CustomText>
              </View>
            ) : (
              <>
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

                <TouchableOpacity 
                  style={styles.changePasswordButton}
                  onPress={() => setShowChangePassword(true)}
                >
                  <CustomText style={styles.changePasswordText}>Change Password</CustomText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]} 
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
            <CustomText style={styles.logoutText}>Logout</CustomText>
                  )}
          </TouchableOpacity>
              </>
            )}
        </View>
      </View>
    </Modal>

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textLight,
    fontSize: 16,
  },
  changePasswordButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  changePasswordText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default SettingModal;
