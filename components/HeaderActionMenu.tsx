import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Action = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

export default function HeaderActionStack({ actions }: Props) {
  const [open, setOpen] = useState(false);

  const anims = useRef(
    actions.map(() => new Animated.Value(0))
  ).current;

  const toggle = () => {
    if (open) {
      Animated.stagger(
        60,
        anims
          .map((a) =>
            Animated.timing(a, {
              toValue: 0,
              duration: 160,
              useNativeDriver: true,
            })
          )
          .reverse()
      ).start(() => setOpen(false));
    } else {
      setOpen(true);
      Animated.stagger(
        80,
        anims.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* ACTION ICONS */}
      {actions.map((action, index) => {
        const translateY = anims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, (index + 1) * 54],
        });

        const opacity = anims[index];

        return (
          <Animated.View
            key={index}
            style={[
              styles.actionWrapper,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                toggle();
                action.onPress();
              }}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color="#ffffff"
              />
            </Pressable>
          </Animated.View>
        );
      })}

      {/* PLUS BUTTON */}
      <Pressable style={styles.plusBtn} onPress={toggle}>
        <Ionicons
          name={open ? "close" : "add"}
          size={26}
          color="#fff"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    overflow: "visible", // ✅ REQUIRED
  },

  plusBtn: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "rgba(102, 102, 102, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20, // ✅ stays on top
  },

  actionWrapper: {
    position: "absolute",
    top: 44,
    zIndex: 15,          // ✅ ABOVE header
    elevation: 15,       // ✅ ANDROID FIX
  },

  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "rgba(170, 170, 170, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});
