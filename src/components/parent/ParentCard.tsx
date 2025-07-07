import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '../shared/CustomText';
import SettingModal from './SettingModal';
import { Ionicons } from '@expo/vector-icons';

interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ParentCardProps {
  parent: ParentProfile | null | undefined;
}

const ParentCard: React.FC<ParentCardProps> = ({ parent }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  if (!parent) {
    return null;
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.info}>
          <CustomText style={styles.name}>{parent.name}</CustomText>
          <CustomText style={styles.detail}>{parent.email}</CustomText>
          <CustomText style={styles.detail}>{parent.phone}</CustomText>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <CustomText>⚙️</CustomText>
        </TouchableOpacity>
      </View>

      <SettingModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        parent={parent}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  settingsButton: {
    padding: 8,
  },
});

export default ParentCard; 