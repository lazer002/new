import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";

import AppHeader from "../components/AppHeader";
import GlassProductCard from "../components/GlassProductCard";

export default function HomeScreen({ navigation }) {
return (
<View style={{ flex: 1, backgroundColor: "transparent" }}>

    <Text style={{ color: 'white', fontSize: 24 }}>
      SCREEN IS RENDERING
    </Text>
  </View>
);
}
