import { logout } from "@/service/authService";
import { useWS } from "@/service/WSProvider";
import { useDriverStore } from "@/store/driverStore";
import { uiStyles } from "@/styles/uiStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "react-native/Libraries/NewAppScreen";
import CustomText from "../shared/CustomText";

const LocationBar = () => {
  // const { location } = useUserStore();
  const { location } = useDriverStore(); // For driver only. TODO: Add parentStore for parent logic if needed.
  const { disconnect } = useWS();

  return (
    <View style={uiStyles.absoluteTop}>
      <SafeAreaView />
      <View style={uiStyles.container}>
        <TouchableOpacity
          style={uiStyles.btn}
          onPress={() => logout(disconnect)}
        >
          <Ionicons
            name="menu-outline"
            size={RFValue(18)}
            color={Colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={uiStyles.locationBar}
          onPress={() => router.navigate("/user/selectLocation" as any)}
        >
          <View style={uiStyles.dot} />
          <CustomText numberOfLines={1} style={uiStyles.locationText}>
            {location?.address || "Getting address..."}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default LocationBar;
