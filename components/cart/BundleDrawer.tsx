import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { normalize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

type BundleProduct = {
  product: {
    _id: string;
    title: string;
    images: string[];
  };
  size: string;
};

type Props = {
  expanded: boolean;
  bundleProducts: BundleProduct[];
  onToggle: () => void;
};

export default function BundleDrawer({
  expanded,
  bundleProducts,
  onToggle,
}: Props) {
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: 220,
    });
  }, [expanded]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          progress.value,
          [0, 1],
          [0, 180]
        )}deg`,
      },
    ],
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [-8, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.previewRow}>
        {bundleProducts.map((p, index) => (
          <View
            key={p.product._id}
            style={[
              styles.previewBubble,
              {
                marginLeft: index === 0 ? 0 : -10,
              },
            ]}
          >
            <Image
              source={{
                uri: p.product.images?.[0],
              }}
              style={styles.previewImage}
            />
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggle}
          style={styles.arrowButton}
        >
          <Animated.View style={arrowStyle}>
            <Ionicons
              name="chevron-down"
              size={18}
              color="#111"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition.springify()}
          style={[styles.drawer, drawerStyle]}
        >
          {bundleProducts.map((item) => (
            <Animated.View
              key={item.product._id}
              entering={FadeIn.duration(200)}
              layout={LinearTransition.springify()}
              style={styles.row}
            >
              <Image
                source={{
                  uri: item.product.images?.[0],
                }}
                style={styles.image}
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                  minWidth: 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={styles.name}
                >
                  {item.product.title}
                </Text>

                <Text style={styles.size}>
                  Size {item.size}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    width: "100%",
    alignItems: "flex-start",
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  previewBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  arrowButton: {
    width: 28,
    height: 28,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  drawer: {
    width: 220,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    paddingVertical: 8,
  },

  image: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },

  name: {
    fontSize: normalize(14),
    fontWeight: "800",
    color: "#111",
  },

  size: {
    marginTop: 3,
    color: "#777",
    fontSize: normalize(12),
  },
});