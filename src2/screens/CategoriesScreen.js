import React, { useEffect, useState, useRef } from "react";
import {
 
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { api } from "../utils/config";
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Animation ref
  const fadeAnim = useRef(new Animated.Value(0)).current;

const categoryImages = {
  Hoodie: "https://images.pexels.com/photos/1231234/pexels-photo-1231234.jpeg",
  Pant: "https://images.pexels.com/photos/5675678/pexels-photo-5675678.jpeg",
  Shirt: "https://images.pexels.com/photos/9109101/pexels-photo-9109101.jpeg",
  Jacket: "https://images.pexels.com/photos/1122334/pexels-photo-1122334.jpeg",
  Tshirt: "https://images.pexels.com/photos/4455667/pexels-photo-4455667.jpeg",
  default: "https://images.pexels.com/photos/3344556/pexels-photo-3344556.jpeg",
};

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        const apiCategories = res.data?.categories || [];
        const withImages = apiCategories.map((cat) => ({
          ...cat,
          image: categoryImages[cat.name] || categoryImages.default,
        }));
        setCategories(withImages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);

        // ✅ Animate fade + scale once data is ready
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loaderText}>Loading collections...</Text>
      </SafeAreaView>
    );
  }

  const hero = categories[0];
  const grid = categories.slice(1);
  const trending = grid.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.brand}>DRIPZONE</Text>
          <Text style={styles.subtitle}>Shop your style. Stay iconic.</Text>
        </View>

        {/* HERO CARD */}
        {hero && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [0.95,1] }) }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("CategoryProducts", { category: hero })}
              style={styles.heroCard}
            >
              <Image source={{ uri: hero.image }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroText}>{hero.name}</Text>
                <Text style={styles.heroSub}>New Collection →</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* TRENDING HORIZONTAL SLIDER */}
        <Text style={styles.sectionTitle}>Trending</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trending.map((item, index) => (
            <Animated.View
              key={item._id}
              style={{
                opacity: fadeAnim,
                transform: [
                  { scale: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [0.9,1] }) }
                ],
                marginRight: index === trending.length - 1 ? 0 : 16,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate("CategoryProducts", { category: item })}
                style={styles.trendingCard}
              >
                <Image source={{ uri: item.image }} style={styles.trendingImage} />
                <View style={styles.overlay}>
                  <Text style={styles.cardText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* GRID SECTION */}
        <View style={styles.gridContainer}>
          {grid.map((item, index) => {
            const isWide = index % 3 === 0;
            const cardWidth = isWide ? width - 32 : (width - 48) / 2;
            const cardHeight = isWide ? 220 : 160;
            const isRightColumn = !isWide && index % 3 === 2;

            return (
              <Animated.View
                key={item._id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { scale: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [0.9,1] }) }
                  ],
                  marginBottom: 14,
                  marginRight: isRightColumn ? 0 : 16, // no extra margin on rightmost column
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("CategoryProducts", { category: item })}
                  style={[styles.card, { width: cardWidth, height: cardHeight }]}
                >
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <View style={styles.overlay}>
                    <Text style={styles.cardText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Text style={styles.footerText}>crafted for the modern wardrobe</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: { marginTop: 20, marginBottom: 12 },
  brand: { fontSize: 34, fontWeight: "900", letterSpacing: 2, color: "#000" },
  subtitle: { color: "#555", fontSize: 15, marginTop: 4 },
  heroCard: { borderRadius: 18, overflow: "hidden", marginBottom: 22 },
  heroImage: { width: "100%", height: 320, resizeMode: "cover" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)", padding: 18 },
  heroText: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: 1 },
  heroSub: { color: "#ddd", fontSize: 15, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  trendingCard: { borderRadius: 16, overflow: "hidden", width: 180, height: 220, backgroundColor: "#f5f5f5",marginBottom:12 },
  trendingImage: { width: "100%", height: "100%", resizeMode: "cover" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  card: { borderRadius: 14, overflow: "hidden", backgroundColor: "#f5f5f5", elevation: 3 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.25)", padding: 12 },
  cardText: { color: "#fff", fontSize: 20, fontWeight: "800", textTransform: "uppercase" },
  footerText: { textAlign: "center", color: "#999", marginTop: 24, marginBottom: 60, letterSpacing: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { color: "#666", marginTop: 8 },
});
