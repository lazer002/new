// src/components/AppHeader.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";

export default function AppHeader({
  title = "",
  showBack = false,
  showNotification = true,
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper} >
      <BlurView intensity={30} tint="dark" style={styles.glass}>
        {/* LEFT */}
        <View style={styles.side}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* CENTER */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* RIGHT */}
        <View style={styles.side}>
          {showNotification && (
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              {/* <Bell size={22} color="#fff" /> */}
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 44, // safe area feel
    paddingHorizontal: 16,
    position: "relative",
    zIndex: 20,
    backgroundColor: "transparent",
  },

  glass: {
    height: 56,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  side: {
    width: 40,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
    maxWidth: "70%",
    textAlign: "center",
  },
});
