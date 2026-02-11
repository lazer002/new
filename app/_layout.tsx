// app/_layout.tsx
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import AnimatedBackground from "@/components/Background";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { FilterProvider } from "@/context/FilterContext";

export default function RootLayout() {
const [fontsLoaded] = useFonts({
  "RobotoCondensed-Thin": require("../assets/font/RobotoCondensed-Thin.ttf"),
  "RobotoCondensed-ThinItalic": require("../assets/font/RobotoCondensed-ThinItalic.ttf"),

  "RobotoCondensed-ExtraLight": require("../assets/font/RobotoCondensed-ExtraLight.ttf"),
  "RobotoCondensed-ExtraLightItalic": require("../assets/font/RobotoCondensed-ExtraLightItalic.ttf"),

  "RobotoCondensed-Light": require("../assets/font/RobotoCondensed-Light.ttf"),
  "RobotoCondensed-LightItalic": require("../assets/font/RobotoCondensed-LightItalic.ttf"),

  "RobotoCondensed-Regular": require("../assets/font/RobotoCondensed-Regular.ttf"),
  "RobotoCondensed-Italic": require("../assets/font/RobotoCondensed-Italic.ttf"),

  "RobotoCondensed-Medium": require("../assets/font/RobotoCondensed-Medium.ttf"),
  "RobotoCondensed-MediumItalic": require("../assets/font/RobotoCondensed-MediumItalic.ttf"),

  "RobotoCondensed-SemiBold": require("../assets/font/RobotoCondensed-SemiBold.ttf"),
  "RobotoCondensed-SemiBoldItalic": require("../assets/font/RobotoCondensed-SemiBoldItalic.ttf"),

  "RobotoCondensed-Bold": require("../assets/font/RobotoCondensed-Bold.ttf"),
  "RobotoCondensed-BoldItalic": require("../assets/font/RobotoCondensed-BoldItalic.ttf"),

  "RobotoCondensed-ExtraBold": require("../assets/font/RobotoCondensed-ExtraBold.ttf"),
  "RobotoCondensed-ExtraBoldItalic": require("../assets/font/RobotoCondensed-ExtraBoldItalic.ttf"),

  "RobotoCondensed-Black": require("../assets/font/RobotoCondensed-Black.ttf"),
  "RobotoCondensed-BlackItalic": require("../assets/font/RobotoCondensed-BlackItalic.ttf"),
});


  if (!fontsLoaded) return null;

  return (
  <SafeAreaProvider>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <FilterProvider>
            <View style={styles.container}>
              <View style={styles.darkBg} />
              <AnimatedBackground />
              <Slot />
            </View>
          </FilterProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
  },
});
