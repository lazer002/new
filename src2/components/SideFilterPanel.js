// components/SideFilterPanel.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useFilter } from "../context/FilterContext";

const { width } = Dimensions.get("window");

export default function SideFilterPanel({ visible, onClose }) {
  const { filters, setFilters, resetFilters } = useFilter();

  // 🔧 shared value
  const translateX = useSharedValue(-width);

  // 🔥 FIX: move animation logic to worklet
  useDerivedValue(() => {
    translateX.value = visible
      ? withTiming(0, { duration: 320 })
      : withTiming(-width, { duration: 260 });
  }, [visible]);

  // 🎨 animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // --- filter options ---
  const sizeOptions = ["S", "M", "L", "XL", "XXL"];
  const colorOptions = ["Black", "White", "Blue", "Red"];
  const priceOptions = [499, 999, 1499, 1999, 2499];

  const toggleSize = (size) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    setFilters({ ...filters, sizes: next });
  };

  const toggleColor = (color) => {
    const next = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    setFilters({ ...filters, colors: next });
  };

  const selectPrice = (price) => {
    setFilters({ ...filters, price });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* sliding panel */}
        <Animated.View style={[styles.panel, animatedStyle]}>
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* body */}
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Sizes */}
            <Text style={styles.section}>Sizes</Text>
            <View style={styles.row}>
              {sizeOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.chip,
                    filters.sizes.includes(size) && styles.chipActive,
                  ]}
                  onPress={() => toggleSize(size)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.sizes.includes(size) && styles.chipTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Colors */}
            <Text style={styles.section}>Colors</Text>
            <View style={styles.row}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.chip,
                    filters.colors.includes(color) && styles.chipActive,
                  ]}
                  onPress={() => toggleColor(color)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.colors.includes(color) && styles.chipTextActive,
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text style={styles.section}>Price Below</Text>
            <View style={styles.row}>
              {priceOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.chip,
                    filters.price === amount && styles.chipActive,
                  ]}
                  onPress={() => selectPrice(amount)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.price === amount && styles.chipTextActive,
                    ]}
                  >
                    ₹{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clear */}
            <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>

            {/* Apply */}
            <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  panel: {
    width: width * 0.78,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 26,
    paddingHorizontal: 18,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: { fontSize: 22, fontWeight: "900" },
  section: { marginTop: 16, marginBottom: 8, fontSize: 15, fontWeight: "700" },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  chip: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipActive: { backgroundColor: "#000" },

  chipText: { fontWeight: "800", color: "#000" },
  chipTextActive: { color: "#fff" },

  clearBtn: { marginTop: 20 },
  clearBtnText: { fontWeight: "700", color: "#333" },

  applyBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  applyBtnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
