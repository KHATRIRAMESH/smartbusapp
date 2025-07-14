import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import CustomText from "@/components/shared/CustomText";
import { Colors } from "@/utils/Constants";
import { useParentTracking } from "@/hooks/parent/useParentTracking";
import { Child } from "@/utils/types/types";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import LocationBar from "./LocationBar";
import ChildCard from "./ChildCard";
import { Ionicons } from "@expo/vector-icons";

interface ParentMapScreenProps {
  child: Child;
}

const ParentMapScreen: React.FC<ParentMapScreenProps> = ({ child }) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapRef = useRef<MapView>(null);
  const {
    busLocation,
    error,
    isTracking,
    isStale,
    startTracking,
    stopTracking,
  } = useParentTracking();

  useEffect(() => {
    if (child.bus?.id) {
      startTracking(child.bus.id);
    }
    return () => {
      stopTracking();
    };
  }, [child.bus?.id]);

  // Update map region when bus location changes
  useEffect(() => {
    if (busLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: busLocation.coords.latitude,
        longitude: busLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [busLocation]);

  if (!child.bus) {
    return (
      <View style={styles.container}>
        <CustomText variant="h5" style={styles.noBusText}>
          No bus assigned to this child yet
        </CustomText>
      </View>
    );
  }



  const BusMarker = () => (
    <View style={styles.busMarkerContainer}>
      <View style={[styles.busMarker, { backgroundColor: isStale ? '#ff6b6b' : Colors.primary }]}>
        <Ionicons 
          name="bus" 
          size={20} 
          color="#FFF" 
        />
      </View>
      <View style={styles.busMarkerLabel}>
        <CustomText variant="h8" style={styles.busMarkerText}>
          {child.bus?.busNumber || 'Bus'}
        </CustomText>
      </View>
      <View style={styles.markerPin} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={[styles.mapContainer, isMapExpanded && styles.expandedMap]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: busLocation?.coords.latitude || 28.12321,
            longitude: busLocation?.coords.longitude || 84.00536,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          followsUserLocation
        >
          {busLocation && busLocation.coords && (
            <Marker
              coordinate={{
                latitude: busLocation.coords.latitude,
                longitude: busLocation.coords.longitude,
              }}
              title={`Bus ${child.bus.busNumber}`}
              description={`Status: ${busLocation.status} | Speed: ${busLocation.coords.speed || 0} km/h`}
              anchor={{ x: 0.5, y: 1 }}
            >
              <BusMarker />
            </Marker>
          )}
        </MapView>

        {/* Location Status Bar */}
        <LocationBar
          isExpanded={isMapExpanded}
          onToggle={() => setIsMapExpanded(!isMapExpanded)}
          busLocation={busLocation}
          isStale={isStale}
          error={error}
        />
      </View>

      {/* Child Info Section */}
      {!isMapExpanded && (
        <ScrollView style={styles.infoContainer}>
          <ChildCard
            child={child}
            onTrackPress={() => setIsMapExpanded(true)}
          />

          {/* Bus Status Card */}
          {busLocation && (
            <View style={styles.busStatusCard}>
              <View style={styles.busStatusHeader}>
                <Ionicons name="bus" size={24} color={Colors.primary} />
                <CustomText variant="h5" style={styles.busStatusTitle}>
                  Bus Status
                </CustomText>
              </View>
              <View style={styles.busStatusInfo}>
                <View style={styles.statusRow}>
                  <CustomText variant="h6" style={styles.statusLabel}>Status:</CustomText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(busLocation.status) }]}>
                    <CustomText variant="h7" style={styles.statusText}>
                      {busLocation.status.toUpperCase()}
                    </CustomText>
                  </View>
                </View>
                <View style={styles.statusRow}>
                  <CustomText variant="h6" style={styles.statusLabel}>Speed:</CustomText>
                  <CustomText variant="h6" style={styles.statusValue}>
                    {busLocation.coords.speed ? `${Math.round(busLocation.coords.speed * 3.6)} km/h` : 'N/A'}
                  </CustomText>
                </View>
                <View style={styles.statusRow}>
                  <CustomText variant="h6" style={styles.statusLabel}>Last Update:</CustomText>
                  <CustomText variant="h6" style={styles.statusValue}>
                    {busLocation.lastUpdated ? new Date(busLocation.lastUpdated).toLocaleTimeString() : 'N/A'}
                  </CustomText>
                </View>
              </View>
            </View>
          )}

          {/* Status Messages */}
          {error && (
            <View style={styles.errorContainer}>
              <CustomText variant="h6" style={styles.errorText}>
                {error}
              </CustomText>
            </View>
          )}

          {isStale && (
            <View style={styles.warningContainer}>
              <CustomText variant="h6" style={styles.warningText}>
                Location data is stale. Last updated more than 30 seconds ago.
              </CustomText>
            </View>
          )}

          {/* Loading Indicator */}
          {isTracking && !busLocation && !error && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <CustomText variant="h6" style={styles.loadingText}>
                Fetching bus location...
              </CustomText>
            </View>
          )}


        </ScrollView>
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'online':
    case 'in_service':
      return '#4CAF50';
    case 'offline':
      return '#f44336';
    case 'on_trip':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    height: "40%",
    width: "100%",
  },
  expandedMap: {
    height: "100%",
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
  },
  // Bus Marker Styles
  busMarkerContainer: {
    alignItems: "center",
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  busMarkerLabel: {
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  busMarkerText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 10,
  },
  markerPin: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    marginTop: -1,
  },
  // Bus Status Card Styles
  busStatusCard: {
    margin: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  busStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  busStatusTitle: {
    marginLeft: 8,
    color: Colors.text,
    fontWeight: "bold",
  },
  busStatusInfo: {
    gap: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: Colors.textLight,
  },
  statusValue: {
    color: Colors.text,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  // Existing styles
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  markerText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  noBusText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.textLight,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#FFE7E7",
    borderRadius: 8,
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
  },
  warningContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
  },
  warningText: {
    color: "#856404",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textLight,
  },

});

export default ParentMapScreen;
