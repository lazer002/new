import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BasePill = ({ icon, bg, text }: any) => (
  <View style={[styles.container, { backgroundColor: bg }]}>
    <Ionicons name={icon} size={16} color="#fff" />
    <Text style={styles.text}>{text}</Text>
  </View>
);

export const pillToastConfig = {
  success: ({ text1 }: any) => (
    <BasePill
      icon="checkmark-circle"
      bg="#16a34a"      // green
      text={text1}
    />
  ),

  error: ({ text1 }: any) => (
    <BasePill
      icon="close-circle"
      bg="#dc2626"      // red
      text={text1}
    />
  ),

  info: ({ text1 }: any) => (
    <BasePill
      icon="information-circle"
      bg="#111"         // black
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
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
