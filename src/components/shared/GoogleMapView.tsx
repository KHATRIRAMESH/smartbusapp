import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

type UserProps = {
  role: "user" | "driver";
};

const GoogleMapView = ({ role }: UserProps) => {
 
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          role === "user"
            ? {
                latitude:28.1872698,
                longitude: 84.0304962,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
        }
      />
    </View>
  );
};

export default GoogleMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
