import CustomText from "@/components/shared/CustomText";
import { logout } from "@/service/authService";
import { refresh_tokens } from "@/service/refreshService";
import { tokenStorage } from "@/store/storage";
import { useDriverStore } from "@/store/driverStore";
import { commonStyles } from "@/styles/commonStyles";
import { splashStyles } from "@/styles/splashStyles";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Alert, Image, View } from "react-native";

interface DecodedToken {
  exp: number;
}

const Main = () => {
  const [fontsLoaded] = useFonts({
    'NotoSans-Bold': require("../assets/fonts/NotoSans-Bold.ttf"),
    'NotoSans-Regular': require("../assets/fonts/NotoSans-Regular.ttf"),
    'NotoSans-Medium': require("../assets/fonts/NotoSans-Medium.ttf"),
    'NotoSans-Light': require("../assets/fonts/NotoSans-Light.ttf"),
    'NotoSans-SemiBold': require("../assets/fonts/NotoSans-SemiBold.ttf"),
  });

  const { user } = useDriverStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  const tokenCheck = async () => {
    const access_token = tokenStorage.getString("access_token") as string;
    const refresh_token = tokenStorage.getString("refresh_token") as string;

    if (access_token) {
      const decodedAccessToken = jwtDecode<DecodedToken>(access_token);
      const decodeRefreshToken = jwtDecode<DecodedToken>(refresh_token);
      const currentTime = Date.now() / 1000;

      if (decodeRefreshToken?.exp < currentTime) {
        logout();
        Alert.alert("Session Expired", "Please log in again.");
      }
      if (decodedAccessToken?.exp < currentTime) {
        try {
          refresh_tokens();
        } catch (error) {
          console.error("Error refreshing token:", error);
          Alert.alert("Error", "Failed to refresh token. Please log in again.");
        }
      }
      if (user) {
        router.replace("/(driver)/home" as any);
      } else {
        router.replace("/role" as any);
      }
      return;
    }
    router.replace("/role" as any);
  };

  useEffect(() => {
    if (fontsLoaded && !hasNavigated) {
      const timeoutId = setTimeout(() => {
        tokenCheck();
        setHasNavigated(true);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [fontsLoaded, hasNavigated]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={commonStyles.container}>
      <Image
        source={require("@/assets/images/bus-location.png")}
        style={splashStyles.img}
      />
      <CustomText variant="h5" fontFamily="Medium" style={splashStyles.text}>
        Made in 🇳🇵
      </CustomText>
    </View>
  );
};

export default Main;
