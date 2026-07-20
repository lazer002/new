import React, { useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
const { height } = require("react-native").Dimensions.get("window");

type Props = {
  visible: boolean;
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  openFilter: () => void;
};

export default function FloatingHeader({
  visible,
  categories,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  openFilter,
}: Props) {

  const translateY = useSharedValue(-140);
const opacity = useSharedValue(0);

useEffect(() => {
  translateY.value = withTiming(
    visible ? 0 : -200,
    {
      duration: 280,
    }
  );

  opacity.value = withTiming(
    visible ? 1 : 0,
    {
      duration: 220,
    }
  );
}, [visible]);

const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  };
});

  return (
  <Animated.View
pointerEvents={
  visible
    ? "auto"
    : "box-none"
}
  style={[
    styles.container,
    animatedStyle,
  ]}
>

      <View style={styles.searchBox}>

        <Ionicons
          name="search-outline"
          size={22}
          color="#888"
        />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Pressable
          style={styles.filter}
          onPress={openFilter}
        >
          <Ionicons
            name="options-outline"
            color="#FFF"
            size={20}
          />
        </Pressable>

      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
<Pressable
  onPress={() => setActiveCategory("all")}
  style={[
    styles.pill,
    activeCategory === null  && styles.active,
  ]}
>
  <View style={styles.pillRow}>
    {activeCategory === null  && (
      <Ionicons
        name="sparkles"
        size={14}
        color="#B6FF2E"
        style={{ marginRight: 6 }}
      />
    )}

    <Animated.Text
      style={[
        styles.pillText,
        activeCategory === null  &&
          styles.pillTextActive,
      ]}
    >
      All
    </Animated.Text>
  </View>
</Pressable>

<Pressable
  onPress={() => {
    setActiveCategory("bundle");
    router.push("/bundle");
  }}
  style={[
    styles.bundlePill,
    activeCategory === "bundle" && styles.active,
  ]}
>

    <Ionicons
      name="sparkles"
      size={14}
      color="#000000"
      style={{ marginRight: 6 }}
    />


  <Text
    style={[
      styles.bundlePillText,
      activeCategory === "bundle" && {
        color: "#FFF",
      },
    ]}
  >
    Bundle
  </Text>
</Pressable>

{categories.map((cat) => {
  const active = activeCategory === cat._id;

  return (
    <Pressable
      key={cat._id}
      onPress={() => setActiveCategory(cat._id)}
      style={[
        styles.pill,
        active && styles.active,
      ]}
    >
      <View style={styles.pillRow}>
        {active && (
          <Ionicons
            name="sparkles"
            size={14}
            color="#B6FF2E"
            style={{ marginRight: 6 }}
          />
        )}

        <Animated.Text
          numberOfLines={1}
          style={[
            styles.pillText,
            active && styles.pillTextActive,
          ]}
        >
          {cat.name}
        </Animated.Text>
      </View>
    </Pressable>
  );
})}

      </ScrollView>

    </Animated.View>
  );
}

const styles = StyleSheet.create({

  container: {

    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    zIndex: 999,

    backgroundColor: "#FAFAFA",

    paddingTop: 50,

    paddingHorizontal: 14,

    paddingBottom: 12,

  },
pillRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

pillText: {
  color: "#444",
  fontWeight: "700",
  fontSize: 15,
},

pillTextActive: {
  color: "#FFF",
},
  searchBox: {

    height: 58,

    borderRadius: 30,

    backgroundColor: "#F5F5F5",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

  },

  input: {

    flex: 1,

    marginLeft: 12,

    color: "#111",

  },

  filter: {

    width: 42,

    height: 42,

    borderRadius: 8,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

  },

  tabs: {

    paddingTop: 18,

    paddingBottom: 6,

  },

pill: {
  minHeight: 42,
  borderRadius: 21,
  backgroundColor: "#F5F5F5",

  justifyContent: "center",
  alignItems: "center",

  paddingHorizontal: 20,
  marginRight: 12,
},

  active: {

    backgroundColor: "#111",

  },
bundlePill: {
  height: height * 0.045,
  borderRadius: 21,
  backgroundColor: "#B6FF2E",

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 18,
  marginRight: 12,

  shadowColor: "#B6FF2E",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 6,
},

bundlePillText: {
  color: "#111",
  fontSize: 15,
  fontWeight: "900",
},
});