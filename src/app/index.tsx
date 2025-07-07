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
import { ActivityIndicator, Image, View } from "react-native";

interface DecodedToken {
  exp: number;
  role?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  const tokenCheck = async () => {
    try {
      const access_token = await tokenStorage.get("access_token");
      const refresh_token = await tokenStorage.get("refresh_token");

      if (access_token && refresh_token) {
        const decodedAccessToken = jwtDecode<DecodedToken>(access_token);
        const decodeRefreshToken = jwtDecode<DecodedToken>(refresh_token);
        const currentTime = Date.now() / 1000;

        // Check refresh token expiration
        if (decodeRefreshToken?.exp < currentTime) {
          await logout();
          router.replace("/role");
          return;
        }

        // Check access token expiration
        if (decodedAccessToken?.exp < currentTime) {
          try {
            await refresh_tokens();
          } catch (error) {
            console.error("Error refreshing token:", error);
            router.replace("/role");
            return;
          }
        }

        // Navigate based on role
        const role = decodedAccessToken?.role;
        if (role === 'driver') {
          router.replace("/(driver)/home");
        } else if (role === 'parent') {
          router.replace("/(parent)/home");
        } else {
          router.replace("/role");
        }
      } else {
        router.replace("/role");
      }
    } catch (error) {
      console.error("Error checking tokens:", error);
      router.replace("/role");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      const timeoutId = setTimeout(() => {
        tokenCheck();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[commonStyles.container, { backgroundColor: '#fff' }]}>
        <Image
          source={require("@/assets/images/bus-location.png")}
          style={splashStyles.img}
        />
        <CustomText variant="h5" fontFamily="Medium" style={splashStyles.text}>
          Made in 🇳🇵
        </CustomText>
        <ActivityIndicator 
          size="large" 
          color="#4CAF50" 
          style={{ position: 'absolute', bottom: 40 }}
        />
      </View>
    );
  }

  return null;
};

export default Main;
