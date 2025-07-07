import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useParentChildren } from "@/hooks/parent/useParentChildren";
import { useParentProfile } from "@/hooks/parent/useParentProfile";
import CustomText from "@/components/shared/CustomText";
import ChildCard from "@/components/parent/ChildCard";
import ParentMapScreen from "@/components/parent/ParentMapScreen";
import { Child } from "@/utils/types/types";
import { Colors } from "@/utils/Constants";
import { useAuthStore } from "@/store/authStore";
import SettingModal from "@/components/parent/SettingModal";
import { Ionicons } from "@expo/vector-icons";

const ParentHomeScreen = () => {
  const {
    data: children,
    isLoading: isLoadingChildren,
    error: childrenError,
    refetch: refetchChildren,
    isRefetching: isRefetchingChildren,
  } = useParentChildren();
  const { data: profile, isLoading: isLoadingProfile } = useParentProfile();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const user = useAuthStore((state) => state.user);

  console.log(profile);

  const handleChildSelect = (child: Child) => {
    if (child.bus) {
      setSelectedChild(child);
    }
  };

  const isLoading = isLoadingChildren || isLoadingProfile;
  const error = childrenError;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <CustomText variant="h5" style={styles.loadingText}>
            Loading...
          </CustomText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText variant="h5" style={styles.errorText}>
            {error instanceof Error ? error.message : "Error loading data"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchChildren()}
          >
            <CustomText variant="h6" style={styles.retryText}>
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedChild) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedChild(null)}
          >
            <CustomText variant="h6" style={styles.backButtonText}>
              ← Back to Children
            </CustomText>
          </TouchableOpacity>
          <CustomText variant="h4" style={styles.headerTitle}>
            Tracking {selectedChild.name}
          </CustomText>
        </View>
        <ParentMapScreen child={selectedChild} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <CustomText variant="h3" fontFamily="SemiBold" style={styles.title}>
          My Children
        </CustomText>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingChildren}
            onRefresh={refetchChildren}
            colors={[Colors.primary]}
          />
        }
      >
        {children && children.length > 0 ? (
          children.map((child) => (
            <TouchableOpacity
              key={child.id}
              onPress={() => handleChildSelect(child)}
              activeOpacity={0.7}
            >
              <ChildCard
                child={child}
                onTrackPress={() => handleChildSelect(child)}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText variant="h5" style={styles.emptyText}>
              No children found. Pull down to refresh.
            </CustomText>
          </View>
        )}
      </ScrollView>

      <SettingModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        parent={profile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    color: Colors.text,
    marginTop: 8,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
  },
  title: {
    marginVertical: 16,
    marginHorizontal: 16,
    color: Colors.text,
  },
  profileButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: Colors.textLight,
    textAlign: "center",
  },
});

export { ParentHomeScreen as default };
