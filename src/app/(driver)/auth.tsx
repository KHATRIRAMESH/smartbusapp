import { View } from "react-native";
import CustomText from "@/components/shared/CustomText";

const DriverAuth = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <CustomText variant="h5" fontFamily="Medium">
        Driver Authentication
      </CustomText>
    </View>
  );
};

export default DriverAuth; 