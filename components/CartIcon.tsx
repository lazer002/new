import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartContext";
const { width ,height} = Dimensions.get("window");
export default function CartIcon() {
  const router = useRouter();
  const { items } = useCart();

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/cart")}
      activeOpacity={0.8}
    >
      <Ionicons name="bag-outline" size={26} color="#111" />

      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {

    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
       // 🔥 Android
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#e11d48",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
