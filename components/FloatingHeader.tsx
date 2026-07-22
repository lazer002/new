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
import { theme } from "@/utils/theme";
import {
  verticalScale,
  scale,
} from "@/utils/responsive";

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
         size={theme.icon.md}
          color={theme.colors.textMuted}
        />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />

        <Pressable
          style={styles.filter}
          onPress={openFilter}
        >
          <Ionicons
            name="options-outline"
            color={theme.colors.white}
         size={theme.icon.sm}
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
     size={theme.icon.xs}
        color={theme.colors.primary}
       style={ styles.sparkleIcon}
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
   size={theme.icon.xs}
      color={theme.colors.black}
      style={styles.sparkleIcon}
    />


  <Text
    style={[
      styles.bundlePillText,
      activeCategory === "bundle" && {
        color: theme.colors.white,
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
           size={theme.icon.xs}
            color={theme.colors.primary}
               style={styles.sparkleIcon}
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

    backgroundColor: theme.colors.background,

paddingTop: verticalScale(50),
paddingHorizontal: theme.spacing.md,
// paddingBottom: theme.spacing.sm,

  },
pillRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

pillText: {
  color: theme.colors.textSecondary,
  fontWeight: "700",
fontSize: theme.typography.md,
},

pillTextActive: {
  color: theme.colors.white,
},
  searchBox: {

   height: verticalScale(50),
borderRadius: theme.radius.full,
paddingHorizontal: theme.spacing.lg,

    backgroundColor:theme.colors.surface,

    flexDirection: "row",

    alignItems: "center",


  },

  input: {

    flex: 1,

   marginLeft: theme.spacing.md,

    color: theme.colors.black

  },

  filter: {

width: theme.layout.filterButton,
height: theme.layout.filterButton,
borderRadius: theme.radius.md,
...theme.shadow.sm,

    backgroundColor: theme.colors.black,

    justifyContent: "center",

    alignItems: "center",

  },

  tabs: {

paddingVertical: verticalScale(theme.spacing.lg),

  },

pill: {
height: theme.layout.pillHeight,
borderRadius: theme.radius.full,
paddingHorizontal: theme.spacing.xl,
marginRight: theme.spacing.md,
  backgroundColor: theme.colors.surface,

  justifyContent: "center",
  alignItems: "center",

},

  active: {

    backgroundColor: theme.colors.black,

  },
bundlePill: {
height: theme.layout.pillHeight,
  borderRadius: theme.radius.full,
  backgroundColor: theme.colors.primary,

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: theme.spacing.lg,
  marginRight: theme.spacing.md,

// ...theme.shadow.md
},
sparkleIcon: {
  marginRight: theme.spacing.xs,
},
bundlePillText: {
 color: theme.colors.black,
fontSize: theme.typography.md,
  fontWeight: "900",
},
});