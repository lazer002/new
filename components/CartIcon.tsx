import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const router = useRouter();
  const { items } = useCart();

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => router.push("/cart")}
    >
      <BlurView
        intensity={70}
        tint="light"
        style={styles.container}
      >
        <Ionicons
          name="bag-handle-outline"
          size={22}
          color="#111"
        />
      </BlurView>

      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    position: "relative",
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    width: 54,
    height: 54,

    borderRadius: 27,

    overflow: "hidden",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,.12)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,.45)",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 12,
  },

  badge: {
    position: "absolute",

    top: -5,
    right: -5,

    minWidth: 22,
    height: 22,

    paddingHorizontal: 5,

    borderRadius: 11,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#FFF",

    zIndex: 9999,
    elevation: 9999,
  },

  badgeText: {
    color: "#111",
    fontSize: 11,
    fontWeight: "900",
    includeFontPadding: false,
  },

});