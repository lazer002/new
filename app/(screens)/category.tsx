
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import api from "@/utils/config";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

/* ✅ TYPE */
type Category = {
  _id: string;
  name: string;
  image: string;
  slug: string;
};

export default function CategoriesScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const animatedValues = useRef<Animated.Value[]>([]).current;

  /* 📦 FETCH */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        const apiCategories: any[] = res?.data?.categories || [];

        const withImages: Category[] = apiCategories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.photo,
        }));

        setCategories(withImages);

        animatedValues.length = withImages.length;
        withImages.forEach((_, i) => {
          animatedValues[i] = new Animated.Value(0);
        });

        Animated.stagger(
          100,
          animatedValues.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            })
          )
        ).start();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* 🔁 NAV */
  const goToCategory = (item: Category) => {
    router.push({
      pathname: "/CategoryProducts",
      params: { category: JSON.stringify(item) },
    });
  };

  /* 📱 RESPONSIVE */
  const numColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const cardSize = (width - 32 - (numColumns - 1) * 12) / numColumns;

  /* 🎯 ANIMATION */
  const getAnimatedStyle = (index: number) => ({
    opacity: animatedValues[index] || 1,
    transform: [
      {
        translateY:
          animatedValues[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }) || 0,
      },
      {
        scale:
          animatedValues[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }) || 1,
      },
    ],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const hero = categories[0];
  const bundles = categories.slice(0, 2); // 🔥 bundle section
  const data = categories.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <Text style={styles.brand}>DRIPZONE</Text>
            <Text style={styles.subtitle}>Shop your style</Text>

            {/* HERO */}
            {hero && (
              <TouchableOpacity onPress={() => goToCategory(hero)}>
                <Image source={{ uri: hero.image }} style={styles.hero} />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroText}>{hero.name}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 🔥 BUNDLES SECTION */}
            <Text style={styles.section}>Bundles</Text>
            <View style={styles.bundleRow}>
              {bundles.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => goToCategory(item)}
                  style={styles.bundleCard}
                >
                  <Image source={{ uri: item.image }} style={styles.bundleImg} />
                  <Text style={styles.bundleText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>Categories</Text>
          </>
        }

        renderItem={({ item, index }) => (
          <Animated.View
            style={[
              getAnimatedStyle(index),
              {
                width: cardSize,
                marginBottom: 12,
                marginRight:
                  (index + 1) % numColumns === 0 ? 0 : 12,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => goToCategory(item)}
              style={[styles.card, { height: cardSize * 1.2 }]}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.overlay}>
                <Text style={styles.text}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

/* 🎨 STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  brand: { fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#666", marginBottom: 12 },

  hero: {
    width: "100%",
    height: width > 600 ? 300 : 200,
    borderRadius: 16,
    marginBottom: 20,
  },

  heroOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },

  heroText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  section: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  /* 🔥 BUNDLES */
  bundleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  bundleCard: {
    width: "48%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },

  bundleImg: {
    width: "100%",
    height: 120,
  },

  bundleText: {
    padding: 8,
    fontWeight: "700",
  },

  /* GRID */
  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
  },

  image: { width: "100%", height: "100%" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  text: { color: "#fff", fontWeight: "800" },
});

