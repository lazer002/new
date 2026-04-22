
import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";
const { width, height } = Dimensions.get("window");

export default function Viewer() {
  const router = useRouter();
  const { images, index } = useLocalSearchParams<any>();
const [isZoomed, setIsZoomed] = React.useState(false);
  const parsedImages = JSON.parse(images || "[]");
  const initialIndex = Number(index) || 0;

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  /* ================= PINCH ================= */
const pinch = Gesture.Pinch()
  .onUpdate((e) => {
    scale.value = e.scale;
    runOnJS(setIsZoomed)(e.scale > 1);
  })
  .onEnd(() => {
    if (scale.value < 1) {
      scale.value = withTiming(1);
      runOnJS(setIsZoomed)(false);
    }
  });

const pan = Gesture.Pan()
  .enabled(scale.value > 1) // 🔥 KEY FIX
  .onUpdate((e) => {
    translateX.value = e.translationX;
    translateY.value = e.translationY;
  })
  .onEnd(() => {
    if (scale.value === 1 && translateY.value > 150) {
      runOnJS(router.back)();
    }

    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  });

const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onStart(() => {
    if (scale.value > 1) {
      scale.value = withTiming(1);
      runOnJS(setIsZoomed)(false);
    } else {
      scale.value = withTiming(2);
      runOnJS(setIsZoomed)(true);
    }
  });

const composed = Gesture.Simultaneous(
  pinch,
  doubleTap,
  pan
);

  /* ================= STYLE ================= */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
<FlatList
  data={parsedImages}
  horizontal
  pagingEnabled
  scrollEnabled={!isZoomed}
  getItemLayout={(data, index) => ({
    length: width,
    offset: width * index,
    index,
  })}
  initialScrollIndex={initialIndex}
  keyExtractor={(_, i) => i.toString()}

  // 🔥 ADD THIS
  onMomentumScrollEnd={() => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    setIsZoomed(false);
  }}

  renderItem={({ item }) => (
    <View style={styles.page}>
      <GestureDetector gesture={composed}>
        <Animated.Image
          source={{ uri: item }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </GestureDetector>
    </View>
  )}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  page: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height,
  },
});

