import React, { useCallback, useMemo } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomText from '../shared/CustomText';
import { logout } from '@/service/authService';
import DriverChangePasswordModal from './DriverChangePasswordModal';
import { Colors } from '@/utils/Constants';
import { DriverProfile } from '@/service/driver';
import { Ionicons } from '@expo/vector-icons';
import { useDriverProfile } from '@/hooks/useDriverProfile';
import { useDriverStore } from '@/store/driverStore';
import { tokenStorage } from '@/store/storage';
import { isSocketConnected } from '@/service/WSProvider';

interface DriverSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  driver: DriverProfile | null | undefined;
}

const DriverSettingsModal: React.FC<DriverSettingsModalProps> = React.memo(({ visible, onClose, driver }) => {
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const { refetch: refetchProfile, isLoading: isRefetching } = useDriverProfile();
  const { user, loadFromStorage } = useDriverStore();

  // Optimization: Memoize handlers to prevent child re-renders
  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const handleRefreshProfile = useCallback(async () => {
    try {
      console.log('[DriverSettingsModal] Manual refresh triggered');
      await loadFromStorage(); // Load from storage first
      await refetchProfile();
    } catch (error) {
      console.error('[DriverSettingsModal] Refresh error:', error);
    }
  }, [loadFromStorage, refetchProfile]);

  const handleDebugInfo = useCallback(async () => {
    try {
      const [accessToken, refreshToken, userRole, driverUser] = await Promise.all([
        tokenStorage.get('access_token'),
        tokenStorage.get('refresh_token'), 
        tokenStorage.get('user_role'),
        tokenStorage.get('driver_user'),
      ]);

      const info = {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken ? accessToken.length : 0,
        hasRefreshToken: !!refreshToken,
        userRole,
        hasDriverUser: !!driverUser,
        userFromStore: user,
        driverFromProp: driver,
        socketConnected: isSocketConnected(),
        timestamp: new Date().toLocaleTimeString(),
      };

      setDebugInfo(info);
      setShowDebugInfo(true);
      console.log('[DriverSettingsModal] Debug info:', info);
    } catch (error) {
      console.error('[DriverSettingsModal] Debug error:', error);
    }
  }, [user, driver]);

  const handleChangePasswordOpen = useCallback(() => {
    setShowChangePassword(true);
  }, []);

  const handleChangePasswordClose = useCallback(() => {
    setShowChangePassword(false);
  }, []);

  const handleDebugClose = useCallback(() => {
    setShowDebugInfo(false);
  }, []);

  // Optimization: Memoize computed values
  const shouldShowDebugButton = useMemo(() => !driver, [driver]);
  const isDriverDataAvailable = useMemo(() => !!driver, [driver]);

  // Optimization: Memoize bus details to prevent re-renders
  const busDetails = useMemo(() => {
    if (!driver?.assignedBus) return null;
    
    return {
      busNumber: driver.assignedBus.busNumber,
      plateNumber: driver.assignedBus.plateNumber,
      capacity: driver.assignedBus.capacity,
      model: driver.assignedBus.model,
    };
  }, [driver?.assignedBus]);

  // Optimization: Early return to prevent unnecessary renders
  if (!visible) {
    return null;
  }

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
              <View style={styles.headerLeft}>
                <Ionicons name="person-circle" size={24} color={Colors.primary} />
                <CustomText style={styles.title}>Driver Profile</CustomText>
              </View>
              <View style={styles.headerRight}>
                {shouldShowDebugButton && (
                  <>
                    <TouchableOpacity 
                      onPress={handleDebugInfo}
                      style={styles.debugButton}
                    >
                      <Ionicons 
                        name="bug" 
                        size={18} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleRefreshProfile}
                      style={styles.refreshButton}
                      disabled={isRefetching}
                    >
                      <Ionicons 
                        name="refresh" 
                        size={20} 
                        color={Colors.primary} 
                      />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={onClose}>
                  <CustomText style={styles.closeButton}>✕</CustomText>
                </TouchableOpacity>
              </View>
            </View>

            {showDebugInfo && debugInfo && (
              <DebugInfoSection debugInfo={debugInfo} onClose={handleDebugClose} />
            )}

            {!isDriverDataAvailable ? (
              <LoadingSection 
                isRefetching={isRefetching} 
                onRetry={handleRefreshProfile} 
              />
            ) : driver && (
              <DriverProfileContent 
                driver={driver}
                busDetails={busDetails}
                onChangePassword={handleChangePasswordOpen}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            )}
          </View>
        </View>
      </Modal>

      <DriverChangePasswordModal
        visible={showChangePassword}
        onClose={handleChangePasswordClose}
      />
    </>
  );
});

// Optimization: Separate memoized components for better performance
const DebugInfoSection = React.memo<{
  debugInfo: any;
  onClose: () => void;
}>(({ debugInfo, onClose }) => (
  <View style={styles.debugContainer}>
    <CustomText style={styles.debugTitle}>Debug Info ({debugInfo.timestamp}):</CustomText>
    <CustomText style={styles.debugText}>Access Token: {debugInfo.hasAccessToken ? `YES (${debugInfo.accessTokenLength} chars)` : 'NO'}</CustomText>
    <CustomText style={styles.debugText}>Refresh Token: {debugInfo.hasRefreshToken ? 'YES' : 'NO'}</CustomText>
    <CustomText style={styles.debugText}>User Role: {debugInfo.userRole || 'None'}</CustomText>
    <CustomText style={styles.debugText}>Driver User: {debugInfo.hasDriverUser ? 'YES' : 'NO'}</CustomText>
    <CustomText style={styles.debugText}>Socket Connected: {debugInfo.socketConnected ? 'YES' : 'NO'}</CustomText>
    <TouchableOpacity 
      style={styles.closeDebugButton}
      onPress={onClose}
    >
      <CustomText style={styles.closeDebugText}>Close Debug</CustomText>
    </TouchableOpacity>
  </View>
));

const LoadingSection = React.memo<{
  isRefetching: boolean;
  onRetry: () => void;
}>(({ isRefetching, onRetry }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <CustomText style={styles.loadingText}>
      {isRefetching ? 'Refreshing profile...' : 'Loading profile...'}
    </CustomText>
    <TouchableOpacity 
      style={styles.retryButton}
      onPress={onRetry}
      disabled={isRefetching}
    >
      <CustomText style={styles.retryButtonText}>Retry</CustomText>
    </TouchableOpacity>
  </View>
));

const DriverProfileContent = React.memo<{
  driver: DriverProfile;
  busDetails: any;
  onChangePassword: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}>(({ driver, busDetails, onChangePassword, onLogout, isLoggingOut }) => (
  <>
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Personal Information</CustomText>
      <ProfileInfoItem label="Name" value={driver.name} />
      <ProfileInfoItem label="Email" value={driver.email} />
      <ProfileInfoItem label="Phone" value={driver.phone} />
      <ProfileInfoItem label="License" value={driver.licenseNumber} />
      {driver.address && (
        <ProfileInfoItem label="Address" value={driver.address} />
      )}
    </View>

    {busDetails && (
      <BusInfoSection busDetails={busDetails} />
    )}

    <View style={styles.actionSection}>
      <TouchableOpacity 
        style={styles.changePasswordButton}
        onPress={onChangePassword}
      >
        <Ionicons name="lock-closed" size={18} color="#fff" />
        <CustomText style={styles.changePasswordText}>Change Password</CustomText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]} 
        onPress={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="log-out" size={18} color="#fff" />
            <CustomText style={styles.logoutText}>Logout</CustomText>
          </>
        )}
      </TouchableOpacity>
    </View>
  </>
));

const ProfileInfoItem = React.memo<{
  label: string;
  value: string;
}>(({ label, value }) => (
  <View style={styles.profileInfo}>
    <CustomText style={styles.label}>{label}</CustomText>
    <CustomText style={styles.value}>{value}</CustomText>
  </View>
));

const BusInfoSection = React.memo<{
  busDetails: any;
}>(({ busDetails }) => (
  <View style={styles.section}>
    <CustomText style={styles.sectionTitle}>Assigned Bus</CustomText>
    <View style={styles.busCard}>
      <View style={styles.busHeader}>
        <Ionicons name="bus" size={20} color={Colors.primary} />
        <CustomText style={styles.busNumber}>{busDetails.busNumber}</CustomText>
      </View>
      <View style={styles.busDetails}>
        <CustomText style={styles.busDetailText}>
          Plate: {busDetails.plateNumber}
        </CustomText>
        <CustomText style={styles.busDetailText}>
          Capacity: {busDetails.capacity} seats
        </CustomText>
        <CustomText style={styles.busDetailText}>
          Model: {busDetails.model}
        </CustomText>
      </View>
    </View>
  </View>
));

// Optimization: Set display names for better debugging
DriverSettingsModal.displayName = 'DriverSettingsModal';
DebugInfoSection.displayName = 'DebugInfoSection';
LoadingSection.displayName = 'LoadingSection';
DriverProfileContent.displayName = 'DriverProfileContent';
ProfileInfoItem.displayName = 'ProfileInfoItem';
BusInfoSection.displayName = 'BusInfoSection';

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
    minHeight: '65%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  debugButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  closeDebugButton: {
    backgroundColor: '#666',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  closeDebugText: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  busCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  busDetails: {
    gap: 4,
  },
  busDetailText: {
    fontSize: 13,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionSection: {
    gap: 12,
  },
  changePasswordButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
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

export default DriverSettingsModal; 