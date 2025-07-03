import { useDriverLocation } from "@/hooks/useDriverLocation";
import { Image, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const DriverMapScreen = () => {
  const { coords, address } = useDriverLocation();

  console.log(
    `Driver address: ${address} at ${new Date().toLocaleTimeString()}`
  );

  return (
    <View style={{ flex: 1 }}>
      {coords && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01, // Adjust as needed
            longitudeDelta: 0.01, // Adjust as needed
          }}
        >
          <Marker coordinate={coords} title="You are here">
            <Image
              source={require("@/assets/images/bus-location.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        </MapView>
      )}
    </View>
  );
};

export default DriverMapScreen;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  markerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addressText: {
    color: "#fff",
    fontSize: 10,
  },
});
