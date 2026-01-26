// app/_layout.tsx
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AnimatedBackground from "@/components/Background";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <View style={styles.container}>
              <View style={styles.darkBg} />
              <AnimatedBackground />
              <Slot />
            </View>
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


// import { AuthProvider } from "@/context/AuthContext";
// import { CartProvider } from "@/context/CartContext";
// import { WishlistProvider } from "@/context/WishlistContext";
// import { FilterProvider } from "@/context/FilterContext";
// import GlobalBackground from "@/components/Background";
// return (
//   <AuthProvider>
//     <CartProvider>
//       <WishlistProvider>
//         <FilterProvider>
//             <Slot />
//         </FilterProvider>
//       </WishlistProvider>
//     </CartProvider>
//   </AuthProvider>
// );