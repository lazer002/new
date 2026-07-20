
import React, { useEffect, useRef, useState } from "react";
import {

  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/config";
import { useRouter } from "expo-router";
import { SCREEN, scale, normalize } from "@/utils/responsive";

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
  const [bundles, setBundles] = useState<Bundle[]>([]);
 
  const animatedValues = useRef<Animated.Value[]>([]).current;



  /* 📦 FETCH */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        const apiCategories: any[] = res?.data?.categories || [];
   const bundleRes = await api.get("/api/bundles?limit=2");
   console.log("Bundle Response:", bundleRes.data);
        setBundles(bundleRes.data.items || []);
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
type Bundle = {
  _id: string;
  title: string;
  price: number;
  mainImages: string[];
  products: {
    _id: string;
    images: string[];
  }[];
};
  /* 🔁 NAV */
  const goToCategory = (item: Category) => {
    router.push({
      pathname: "/plpcategory",
         params: { category: item._id },
    });
  };

  /* 📱 RESPONSIVE */
  const numColumns = SCREEN.width > 900 ? 4 : SCREEN.width > 600 ? 3 : 2;
  const cardSize = (SCREEN.width - scale(32) - (numColumns - 1) * scale(12)) / numColumns;

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

  const data = categories.slice(1);

return (
  <SafeAreaView style={styles.container}>
    <FlatList
      data={data}
      key={numColumns}
      keyExtractor={(item) => item._id}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}

   ListHeaderComponent={
  <>
    {/* ===========================
          PREMIUM HEADER
    =========================== */}

    <View style={styles.header}>

      <View>
        <Text style={styles.greeting}>
          GOOD EVENING
        </Text>

        <Text style={styles.brand} onPress={()=> router.push("/(tabs)")}>
          GARRIB
        </Text>
      </View>

      <TouchableOpacity style={styles.searchButton}>
        <Text style={styles.searchIcon}>⌕</Text>
      </TouchableOpacity>

    </View>

    {/* ===========================
          FULL HERO
    =========================== */}

    {hero && (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => goToCategory(hero)}
        style={styles.heroContainer}
      >

        <Image
          source={{ uri: hero.image }}
          style={styles.heroImage}
        />

        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>

          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              NEW DROP
            </Text>
          </View>

          <Text style={styles.heroHeading}>
            {hero.name}
          </Text>

          <Text style={styles.heroDescription}>
            Discover timeless silhouettes,
            premium fabrics and modern essentials.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.heroButton}
            onPress={() => goToCategory(hero)}
          >
            <Text style={styles.heroButtonText}>
              SHOP NOW →
            </Text>
          </TouchableOpacity>

        </View>

      </TouchableOpacity>
    )}


{/* =======================
      BUNDLE STUDIO
======================= */}

<View style={styles.bundleSection}>

  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Bundle Studio</Text>

    <TouchableOpacity onPress={() => router.push("/bundle")}>
      <Text style={styles.viewAll}>View all</Text>
    </TouchableOpacity>
  </View>

  <FlatList
    horizontal
    showsHorizontalScrollIndicator={false}
    data={bundles.slice(0, 2)}
    keyExtractor={(item) => item._id}
    contentContainerStyle={{ paddingHorizontal: 20 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
        router.push(`/bundle/${item._id}`)
        }
        style={styles.bundleStudioCard}
      >
        <Image
          source={{
            uri: item.mainImages?.[0],
          }}
          style={styles.bundleStudioImage}
        />

        <View style={styles.bundleStudioOverlay} />

        {/* PRODUCT COLLAGE */}

        <View style={styles.productStack}>

          {item.products?.slice(0,3).map((p: any, index: number) => (
            <Image
              key={p._id}
              source={{ uri: p.images?.[0] }}
              style={[
                styles.stackImage,
                {
                  left:index*28,
                  zIndex:10-index
                }
              ]}
            />
          ))}

        </View>

        <View style={styles.bundleStudioContent}>

          <Text style={styles.bundleStudioTitle}>
            {item.title}
          </Text>

          <Text style={styles.bundleStudioPrice}>
            ₹{item.price}
          </Text>

          <View style={styles.shopNowChip}>
            <Text style={styles.shopNowText}>
              Shop Bundle →
            </Text>
          </View>

        </View>

      </TouchableOpacity>
    )}
  />

</View>
    {/* ===========================
          SECTION TITLE
    =========================== */}

    <View style={styles.sectionHeader}>

      <Text style={styles.sectionTitle}>
        Shop by Category
      </Text>

      <TouchableOpacity>
        <Text style={styles.viewAll}>
          View All
        </Text>
      </TouchableOpacity>

    </View>
  </>
}

  renderItem={({ item, index }) => (
  <Animated.View
    style={[
      getAnimatedStyle(index),
      {
        width: cardSize,
        marginBottom: 18,
        marginRight:
          (index + 1) % numColumns === 0 ? 0 : 16,
          marginLeft: index % numColumns === 0 ? 20 : 0,
      },
    ]}
  >
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => goToCategory(item)}
      style={[
        styles.categoryCard,
        {
          height: cardSize * 1.45,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
      />

      {/* Dark Overlay */}
      <View style={styles.categoryOverlay} />

      {/* Content */}
      <View style={styles.categoryContent}>

        <Text style={styles.categoryTitle}>
          {item.name}
        </Text>

        <Text style={styles.categorySubtitle}>
          Premium Collection
        </Text>

        <View style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>
            Explore →
          </Text>
        </View>

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
 container: {
  flex: 1,
  backgroundColor: "#F8F8F8",
},
categoryCard: {
  borderRadius: 28,
  overflow: "hidden",
  backgroundColor: "#EEE",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: {
    width: 0,
    height: 8,
  },
  elevation: 8,
},
bundleSection:{
  marginTop:30,
  marginBottom:30,
},

bundleStudioCard:{
  width:310,
  height:420,
  borderRadius:30,
  overflow:"hidden",
  marginRight:18,
  backgroundColor:"#EEE",
},

bundleStudioImage:{
  width:"100%",
  height:"100%",
},

bundleStudioOverlay:{
  ...StyleSheet.absoluteFillObject,
  backgroundColor:"rgba(0,0,0,.28)",
},

bundleStudioContent:{
  position:"absolute",
  left:20,
  right:20,
  bottom:22,
},

bundleStudioTitle:{
  color:"#FFF",
  fontSize:normalize(28),
  fontWeight:"900",
},

bundleStudioPrice:{
  color:"#EEE",
  marginTop:8,
  fontSize:normalize(16),
},

shopNowChip:{
  alignSelf:"flex-start",
  marginTop:18,
  backgroundColor:"#FFF",
  borderRadius:30,
  paddingHorizontal:18,
  paddingVertical:10,
},

shopNowText:{
  fontWeight:"700",
  color:"#111",
},

productStack:{
  position:"absolute",
  top:18,
  left:18,
  width:130,
  height:60,
},

stackImage:{
  position:"absolute",
  width:58,
  height:58,
  borderRadius:18,
  borderWidth:3,
  borderColor:"#FFF",
},
categoryImage: {
  width: "100%",
  height: "100%",
},

categoryOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.32)",
},

categoryContent: {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 18,
},

categoryTitle: {
  color: "#FFF",
  fontSize: normalize(22),
  fontWeight: "900",
},

categorySubtitle: {
  color: "#EAEAEA",
  marginTop: 6,
  marginBottom: 18,
  fontSize: normalize(13),
},

categoryButton: {
  alignSelf: "flex-start",
  backgroundColor: "#FFF",
  borderRadius: 25,
  paddingHorizontal: 18,
  paddingVertical: 10,
},

categoryButtonText: {
  color: "#111",
  fontWeight: "700",
  fontSize: normalize(13),
},
loader: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},
header:{
  paddingHorizontal:20,
  paddingTop:18,
  paddingBottom:24,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},

greeting:{
  color:"#8C8C8C",
  fontSize:normalize(12),
  letterSpacing:2,
  fontWeight:"600",
},

brand:{
  fontSize:normalize(34),
  fontWeight:"900",
  color:"#111",
  marginTop:4,
},

searchButton:{
  width:52,
  height:52,
  borderRadius:26,
  backgroundColor:"#fff",
  justifyContent:"center",
  alignItems:"center",

  shadowColor:"#000",
  shadowOpacity:0.08,
  shadowRadius:12,
  shadowOffset:{
    width:0,
    height:6,
  },
  elevation:6,
},

searchIcon:{
  fontSize:normalize(22),
},

heroContainer:{
  marginHorizontal:20,
  borderRadius:30,
  overflow:"hidden",
  marginBottom:30,
},

heroImage:{
  width:"100%",
  height:520,
},

heroOverlay:{
  ...StyleSheet.absoluteFillObject,
  backgroundColor:"rgba(0,0,0,.38)",
},

heroContent:{
  position:"absolute",
  bottom:30,
  left:24,
  right:24,
},

newBadge:{
  backgroundColor:"#fff",
  alignSelf:"flex-start",
  paddingHorizontal:16,
  paddingVertical:8,
  borderRadius:30,
  marginBottom:16,
},

newBadgeText:{
  fontWeight:"700",
  color:"#111",
  letterSpacing:1,
  fontSize:normalize(12),
},

heroHeading:{
  color:"#fff",
  fontSize:normalize(40),
  fontWeight:"900",
},

heroDescription:{
  color:"#F2F2F2",
  fontSize:normalize(16),
  lineHeight:normalize(25),
  marginTop:12,
  marginBottom:24,
},

heroButton:{
  backgroundColor:"#fff",
  alignSelf:"flex-start",
  paddingHorizontal:26,
  paddingVertical:15,
  borderRadius:35,
},

heroButtonText:{
  color:"#111",
  fontWeight:"800",
  fontSize:normalize(15),
},

infoRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  paddingHorizontal:20,
  marginBottom:34,
},

infoCard:{
  flex:1,
  marginHorizontal:5,
  backgroundColor:"#fff",
  borderRadius:20,
  paddingVertical:22,
  alignItems:"center",

  shadowColor:"#000",
  shadowOpacity:.06,
  shadowRadius:10,
  shadowOffset:{
    width:0,
    height:4,
  },
  elevation:4,
},

infoValue:{
  fontSize:normalize(22),
  fontWeight:"900",
  color:"#111",
},

infoLabel:{
  marginTop:6,
  color:"#777",
  fontSize:normalize(13),
},

sectionHeader:{
  paddingHorizontal:20,
  marginBottom:18,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},

sectionTitle:{
  fontSize:normalize(26),
  fontWeight:"900",
  color:"#111",
},

viewAll:{
  color:"#777",
  fontWeight:"700",
},
/* ================= HEADER ================= */


smallTitle: {
  color: "#777",
  fontSize: normalize(13),
  letterSpacing: 2,
  textTransform: "uppercase",
},


headerButtons: {
  flexDirection: "row",
},
/* ================= SEARCH ================= */

searchContainer: {
  paddingHorizontal: 20,
  marginBottom: 22,
},

searchBar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 30,
  paddingHorizontal: 18,
  height: 58,

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 3,
},



searchPlaceholder: {
  marginLeft: 12,
  color: "#999",
  fontSize: normalize(15),
},

/* ================= PROMO ================= */

promoCard: {
  marginHorizontal: 20,
  backgroundColor: "#111",
  borderRadius: 24,
  padding: 24,
  marginBottom: 30,
},

promoTitle: {
  color: "#fff",
  fontSize: normalize(24),
  fontWeight: "900",
},

promoSubtitle: {
  color: "#CCC",
  marginTop: 10,
  lineHeight: normalize(22),
},

promoButton: {
  marginTop: 20,
  alignSelf: "flex-start",
  backgroundColor: "#fff",
  borderRadius: 40,
  paddingHorizontal: 20,
  paddingVertical: 12,
},

promoButtonText: {
  color: "#111",
  fontWeight: "700",
},

/* ================= TRENDING ================= */

trendingTitle: {
  fontSize: normalize(23),
  fontWeight: "800",
  paddingHorizontal: 20,
  marginBottom: 16,
},

trendingChip: {
  backgroundColor: "#ECECEC",
  borderRadius: 30,
  paddingHorizontal: 22,
  paddingVertical: 12,
  marginRight: 12,
},

trendingChipActive: {
  backgroundColor: "#111",
},

trendingText: {
  color: "#555",
  fontWeight: "700",
},

trendingTextActive: {
  color: "#fff",
},
iconButton: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 12,

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 5,
},

icon: {
  fontSize: normalize(20),
  color: "#111",
},

/* ================= HERO ================= */





heroGradient: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.35)",
},



badge: {
  alignSelf: "flex-start",
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 30,
  marginBottom: 16,
},

badgeText: {
  fontWeight: "700",
  color: "#111",
  fontSize: normalize(12),
  letterSpacing: 1,
},

heroTitle: {
  color: "#fff",
  fontSize: normalize(34),
  fontWeight: "900",
},

heroSubtitle: {
  color: "#EEE",
  fontSize: normalize(15),
  lineHeight: normalize(23),
  marginTop: 10,
  marginBottom: 22,
},

shopButton: {
  alignSelf: "flex-start",
  backgroundColor: "#fff",
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 40,
},

shopButtonText: {
  color: "#111",
  fontWeight: "700",
  fontSize: normalize(15),
},

/* ================= FEATURE ================= */

featureRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  marginBottom: 34,
},

featureCard: {
  flex: 1,
  backgroundColor: "#fff",
  marginHorizontal: 5,
  paddingVertical: 20,
  borderRadius: 18,
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 4,
},

featureNumber: {
  fontSize: normalize(22),
  fontWeight: "900",
  color: "#111",
},

featureLabel: {
  marginTop: 6,
  color: "#777",
  fontSize: normalize(13),
},

/* ================= SECTION ================= */

sectionRow: {
  paddingHorizontal: 20,
  marginBottom: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},



seeAll: {
  color: "#777",
  fontSize: normalize(14),
  fontWeight: "600",
},

/* ================= BUNDLE ================= */

bundleRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  marginBottom: 36,
},

bundleCard: {
  width: "48%",
  borderRadius: 20,
  overflow: "hidden",
  backgroundColor: "#fff",

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  elevation: 5,
},
sliderTitle: {
  fontSize: normalize(26),
  fontWeight: "900",
  paddingHorizontal: 20,
  marginBottom: 16,
},

sliderCard: {
  width: 150,
  height: 210,
  borderRadius: 24,
  overflow: "hidden",
  marginRight: 16,
},

sliderImage: {
  width: "100%",
  height: "100%",
},

sliderOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,.25)",
},

sliderName: {
  position: "absolute",
  bottom: 18,
  left: 16,
  right: 16,
  color: "#fff",
  fontWeight: "800",
  fontSize: normalize(18),
},
bundleImg: {
  width: "100%",
  height: 190,
},

bundleOverlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 14,
  backgroundColor: "rgba(0,0,0,0.30)",
},

bundleText: {
  color: "#fff",
  fontSize: normalize(16),
  fontWeight: "800",
},

/* ================= GRID ================= */

card: {
  backgroundColor: "#fff",
  borderRadius: 22,
  overflow: "hidden",

  shadowColor: "#000",
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  elevation: 4,
},

image: {
  width: "100%",
  height: "100%",
},

overlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 14,
  backgroundColor: "rgba(0,0,0,0.28)",
},

text: {
  color: "#fff",
  fontWeight: "800",
  fontSize: normalize(16),
},
});

