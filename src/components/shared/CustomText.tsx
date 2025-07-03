import React from 'react';
import { Text, TextProps } from 'react-native';
import { Colors } from "@/utils/Constants";
import { CustomTextProps } from "@/utils/types";
import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const fontSizes = {
  h1: 24,
  h2: 22,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  h7: 12,
  h8: 10,
};

const CustomText: React.FC<CustomTextProps & TextProps> = ({ 
  variant = 'h5',
  fontFamily = 'Regular',
  style,
  children,
  ...props 
}) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: RFValue(fontSizes[variant]),
          fontFamily: `NotoSans-${fontFamily}`,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
    textAlign: "left",
  },
});

export default CustomText;
