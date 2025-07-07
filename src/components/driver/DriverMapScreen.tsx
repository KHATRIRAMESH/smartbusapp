import { useDriverLocation } from "@/hooks/useDriverLocation";
import { Image, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect } from "react";
import { useDriverStore } from "@/store/driverStore";

const DriverMapScreen = () => {
  const { location, error, isTracking, startTracking, stopTracking, updateBusStatus } = useDriverLocation();
  const { status } = useDriverStore();

  useEffect(() => {
    // Start tracking when component mounts
    startTracking().catch(console.error);
    return () => stopTracking();
  }, []);

  const toggleBusStatus = () => {
    const newStatus = status === "online" ? "offline" : "online";
    updateBusStatus(newStatus);
  };

  return (
    <View style={{ flex: 1 }}>
      {location?.coords && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker 
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }} 
            title="Your Bus Location"
          >
            <Image
              source={require("@/assets/images/bus-location.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        </MapView>
      )}

      {/* Status Controls */}
      <View style={styles.controls}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusText,
            { color: status === "online" ? "#4CAF50" : "#FF9800" }
          ]}>
            {status === "online" ? "On Duty" : "Off Duty"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: status === "online" ? "#FF9800" : "#4CAF50" }
          ]}
          onPress={toggleBusStatus}
        >
          <Text style={styles.buttonText}>
            {status === "online" ? "Go Off Duty" : "Start Duty"}
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </View>
  );
};

export default DriverMapScreen;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
    textAlign: 'center',
  },
});

