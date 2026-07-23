import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { normalize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";

const BasePill = ({ icon, bg, text, color = "#111" }: any) => (
  <View style={[styles.container, { backgroundColor: bg }]}>
    <Ionicons
      name={icon}
      size={16}
      color={color}
    />
    <Text
      style={[
        styles.text,
        { color },
      ]}
    >
      {text}
    </Text>
  </View>
);

export const pillToastConfig = {
  success: ({ text1 }: any) => (
    <BasePill
      icon="checkmark-circle"
      bg="#B6FF2E"
      color="#111"
      text={text1}
    />
  ),

  error: ({ text1 }: any) => (
    <BasePill
      icon="close-circle"
      bg="#111111"
      color="#FF5A5F"
      text={text1}
    />
  ),

  warning: ({ text1 }: any) => (
    <BasePill
      icon="warning"
      bg="#111111"
      color="#FFC83D"
      text={text1}
    />
  ),

  info: ({ text1 }: any) => (
    <BasePill
      icon="information-circle"
      bg="#111111"
      color="#FFFFFF"
      text={text1}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 999,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },

  text: {
    fontSize: normalize(13),
    fontFamily: "RobotoCondensed-Bold",
  },
});