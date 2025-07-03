import CustomButton from "@/components/shared/CustomButton";
import CustomText from "@/components/shared/CustomText";
import PasswordInput from "@/components/shared/PasswordInput";
import PhoneInput from "@/components/shared/PhoneInput";
import { signin } from "@/service/authService";
import { useWS } from "@/service/WSProvider";
import { authStyles } from "@/styles/authStyles";
import { commonStyles } from "@/styles/commonStyles";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const Auth = () => {
  const { updateAccessToken } = useWS();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleNext = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }
    signin({ role: "driver", phone }, updateAccessToken);
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.container}>
        <View style={commonStyles.flexRowBetween}>
          <Image
            source={require("@/assets/images/bus-location.png")}
            style={authStyles.logo}
          />
          <TouchableOpacity style={authStyles.flexRowGap}>
            <MaterialIcons name="help-outline" size={24} color="black" />
            <CustomText fontFamily="Medium" variant="h7">
              Help
            </CustomText>
          </TouchableOpacity>
        </View>
        <CustomText fontFamily="Medium" variant="h6">
          Continue as SmartBus Driver
        </CustomText>

        <CustomText
          variant="h7"
          fontFamily="Regular"
          style={commonStyles.lightText}
        >
          Please enter your phone number
        </CustomText>
        <PhoneInput onChangeText={setPhone} value={phone} />
        <CustomText
          variant="h7"
          fontFamily="Regular"
          style={commonStyles.lightText}
        >
          Password:
        </CustomText>
        <PasswordInput onChangeText={setPassword} value={password} />
        <Text style={{}}>Forget password?</Text>
      </ScrollView>
      <View style={authStyles.footerContainer}>
        <CustomText
          fontFamily="Regular"
          variant="h8"
          style={[
            commonStyles.lightText,
            { textAlign: "center", marginHorizontal: 20 },
          ]}
        >
          By continuing, you agree to the terms and privacy policy of SmartBus
          App.
        </CustomText>
        <CustomButton
          title="Next"
          onPress={handleNext}
          loading={false}
          disabled={false}
        />
      </View>
    </SafeAreaView>
  );
};
export default Auth;
