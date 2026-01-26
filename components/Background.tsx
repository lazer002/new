import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

const { width, height } = Dimensions.get("window");

function Blob({ color, size, delay, top, left }: any) {
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const move = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          backgroundColor: color,
          width: size,
          height: size,
          top,
          left,
          transform: [{ translateX: move }, { translateY: move }],
        },
      ]}
    />
  );
}

export default function Background() {


  return (
<View style={StyleSheet.absoluteFill}>
  <Blob
    color="rgba(255, 255, 255, 0.35)"
    size={400}
    delay={0}
    top={-200}
    left={-200}
  />

  <Blob
    color="rgba(255, 255, 255, 0.25)"
    size={400}
    delay={2500}
    top={height * 0.25}
    left={width * 0.5}
  />

  <Blob
    color="rgba(255, 255, 255, 0.36)"
    size={450}
    delay={3000}
    top={height * 0.55}
    left={-150}
  />

  <Blob
    color="rgba(255, 255, 255, 0.15)"
    size={500}
    delay={7500}
    top={height * 0.15}
    left={width * 0.1}
  />
</View>

  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 9999,
    filter: "blur(40px)", // ignored on native, safe to keep
  },
});
