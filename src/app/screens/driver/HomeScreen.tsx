import DriverMapScreen from "@/components/driver/DriverMapScreen";
import LocationBar from "@/components/parent/LocationBar";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { homeStyles } from "@/styles/homeStyles";
import { StatusBar, View } from "react-native";
const DriverHome = () => {
  useDriverLocation();
  return (
    <View style={homeStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="orange"
        translucent={false}
      />
      <LocationBar />
      {/* <GoogleMapView role="driver" /> */}
      <DriverMapScreen />
    </View>
  );
};
export default DriverHome;
