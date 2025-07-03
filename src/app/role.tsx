import CustomText from "@/components/shared/CustomText";
import { roleStyles } from "@/styles/roleStyles";
import { router } from "expo-router";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Role = () => {
  // TODO: Implement parent authentication screen and update navigation path
  const handleParentPress = () => {
    router.push("/(parent)/auth" as any);
  };

  const handleDriverPress = () => {
    router.push("/(driver)/auth" as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={roleStyles.container}>
        <CustomText fontFamily="Bold" variant="h6" style={roleStyles.title}>
          Select your role
        </CustomText>

        <TouchableOpacity style={roleStyles.card} onPress={handleParentPress}>
          <Image
            source={require("@/assets/images/mother.png")}
            style={roleStyles.image}
          />
          <View>
            <CustomText style={roleStyles.title}>Parent</CustomText>
            <CustomText style={roleStyles.description}>
              Track your children&apos;s school bus in real-time, ensuring their
              safety and punctuality.
            </CustomText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={roleStyles.card} onPress={handleDriverPress}>
          <Image
            source={require("@/assets/images/driver-inside.jpg")}
            style={roleStyles.image}
          />
          <View>
            <CustomText style={roleStyles.title}>Driver</CustomText>
            <CustomText style={roleStyles.description}>
              Share your location with children&apos;s parents and school
              authorities
            </CustomText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Role;
