import { PhoneInputProps } from "@/utils/types";
import { FC } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import CustomText from "./CustomText";
const PhoneInput: FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={styles.container}>
      <CustomText fontFamily="Medium" style={styles.text}>
        🇳🇵+977
      </CustomText>
      <TextInput
        placeholder="0000000000"
        keyboardType="phone-pad"
        value={value}
        maxLength={10}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholderTextColor="#ccc"
        style={styles.input}

      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 0,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: RFValue(13),
    fontFamily: "Medium",
    height: 45,
    width: "90%",
    borderRadius:10
  },
  text: {
    fontSize: RFValue(13),
    top: -1,
    fontFamily: "Medium",
  },
});
export default PhoneInput;
