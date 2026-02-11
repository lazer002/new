import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "@/context/FilterContext";

const { height, width } = Dimensions.get("window");

type Screen =
  | "main"
  | "category"
  | "size"
  | "color"
  | "price"
  | "sale"
  | "stock"
  | "new";

type Props = {
  visible: boolean;
  categories: any[];
  onClose: () => void;
};

export default function BottomFilterSheet({
  visible,
  categories,
  onClose,
}: Props) {
  const { filters, setFilters, resetFilters, activeCount } = useFilter();
  const [screen, setScreen] = useState<Screen>("main");

  const translateY = useSharedValue(height);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, {
      duration: visible ? 380 : 260,
    });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Header */}
        <View style={styles.header}>
          {screen !== "main" ? (
            <Pressable onPress={() => setScreen("main")}>
              <Ionicons name="arrow-back" size={22} />
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )}

          <Text style={styles.headerTitle}>Filter</Text>

          <Pressable onPress={onClose}>
            <Ionicons name="close" size={22} />
          </Pressable>
        </View>

        {/* Body */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* MAIN */}
          {screen === "main" && (
            <>
              <MainRow
                label="Category"
                value={
                  categories.find((c) => c._id === filters.category)?.name
                }
                active={!!filters.category}
                onPress={() => setScreen("category")}
              />

              <MainRow
                label="Size"
                value={filters.sizes.join(", ")}
                active={filters.sizes.length > 0}
                onPress={() => setScreen("size")}
              />

              <MainRow
                label="Color"
                value={filters.colors.join(", ")}
                active={filters.colors.length > 0}
                onPress={() => setScreen("color")}
              />

              <MainRow
                label="Price"
                value={
                  filters.price
                    ? `₹${filters.price.min} – ₹${filters.price.max}`
                    : undefined
                }
                active={!!filters.price}
                onPress={() => setScreen("price")}
              />

              <MainRow
                label="On Sale"
                value={filters.onSale ? "Yes" : undefined}
                active={filters.onSale}
                onPress={() => setScreen("sale")}
              />

              <MainRow
                label="In Stock"
                value={filters.inStockOnly ? "Only" : undefined}
                active={filters.inStockOnly}
                onPress={() => setScreen("stock")}
              />

              <MainRow
                label="New Arrivals"
                value={filters.isNewProduct ? "Only" : undefined}
                active={filters.isNewProduct}
                onPress={() => setScreen("new")}
              />
            </>
          )}

          {/* CATEGORY */}
          {screen === "category" &&
            categories.map((cat) => (
              <ItemRow
                key={cat._id}
                label={cat.name}
                active={filters.category === cat._id}
                onPress={() =>
                  setFilters((f) => ({ ...f, category: cat._id }))
                }
              />
            ))}

          {/* SIZE */}
          {screen === "size" &&
            ["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <ItemRow
                key={s}
                label={s}
                active={filters.sizes.includes(s)}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    sizes: f.sizes.includes(s)
                      ? f.sizes.filter((x) => x !== s)
                      : [...f.sizes, s],
                  }))
                }
              />
            ))}

          {/* COLOR */}
          {screen === "color" &&
            ["Black", "White", "Blue", "Red"].map((c) => (
              <ItemRow
                key={c}
                label={c}
                active={filters.colors.includes(c)}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    colors: f.colors.includes(c)
                      ? f.colors.filter((x) => x !== c)
                      : [...f.colors, c],
                  }))
                }
              />
            ))}

          {/* PRICE */}
          {screen === "price" &&
            [499, 999, 1499, 1999, 2499].map((p) => (
              <ItemRow
                key={p}
                label={`Under ₹${p}`}
                active={filters.price?.max === p}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    price: { min: 0, max: p },
                  }))
                }
              />
            ))}

          {/* SALE */}
          {screen === "sale" && (
            <ItemRow
              label="Only sale products"
              active={filters.onSale}
              onPress={() =>
                setFilters((f) => ({ ...f, onSale: !f.onSale }))
              }
            />
          )}

          {/* STOCK */}
          {screen === "stock" && (
            <ItemRow
              label="Only in-stock items"
              active={filters.inStockOnly}
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  inStockOnly: !f.inStockOnly,
                }))
              }
            />
          )}

          {/* NEW */}
          {screen === "new" && (
            <ItemRow
              label="Only new arrivals"
              active={filters.isNewProduct}
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  isNewProduct: !f.isNewProduct,
                }))
              }
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable onPress={resetFilters}>
            <Text style={styles.clear}>
              Clear all {activeCount > 0 && `(${activeCount})`}
            </Text>
          </Pressable>

          <Pressable style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

/* ───────────────── ROW COMPONENTS ───────────────── */

function MainRow({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.mainRow} onPress={onPress}>
      <View>
        <Text style={styles.mainLabel}>{label}</Text>
        {value && <Text style={styles.mainValue}>{value}</Text>}
      </View>

      <View style={styles.right}>
        {active && <View style={styles.dot} />}
        <Ionicons name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function ItemRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      <Text>{label}</Text>
      {active && <Ionicons name="checkmark" size={18} />}
    </Pressable>
  );
}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    height: height * 0.8,
    width: width * 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  mainRow: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },

  mainLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  mainValue: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },

  itemRow: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },

  clear: {
    fontWeight: "700",
  },

  applyBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  applyText: {
    color: "#fff",
    fontWeight: "800",
  },
});
