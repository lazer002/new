import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import api from "@/utils/config";

const { width } = Dimensions.get("window");

type Product = {
  _id: string;
  images: string[];
};

type Bundle = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mainImages: string[];
  products: Product[];
};

export default function BundlePLP() {
  const router = useRouter();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await api.get("/api/bundles");

      setBundles(res.data.items || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBundles = bundles.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <FlatList
        data={filteredBundles}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}

        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View style={styles.header}>

              <View>

                <Text style={styles.smallTitle}>
                  CURATED COLLECTIONS
                </Text>

                <Text style={styles.bigTitle}>
                  Bundle Studio
                </Text>

              </View>

              <TouchableOpacity style={styles.searchCircle}>
                <Text style={{ fontSize: 22 }}>⌕</Text>
              </TouchableOpacity>

            </View>

            {/* SEARCH */}

            <View style={styles.searchContainer}>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search Bundles..."
                placeholderTextColor="#999"
                style={styles.searchInput}
              />

            </View>

            {/* HERO */}

            {bundles.length > 0 && (

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.heroCard}
                onPress={() =>
                  router.push({
                    pathname: "/bundle/[id]",
                    params: {
                      id: bundles[0]._id,
                    },
                  })
                }
              >

                <Image
                  source={{
                    uri: bundles[0].mainImages[0],
                  }}
                  style={styles.heroImage}
                />

                <View style={styles.heroOverlay} />

                <View style={styles.heroContent}>

                  <Text style={styles.heroLabel}>
                    FEATURED
                  </Text>

                  <Text style={styles.heroTitle}>
                    {bundles[0].title}
                  </Text>

                  <Text style={styles.heroButton}>
                    Shop Collection →
                  </Text>

                </View>

              </TouchableOpacity>

            )}

            <Text style={styles.sectionTitle}>
              Explore Bundles
            </Text>

          </>
        }

        renderItem={({ item, index }) => (
  <TouchableOpacity
    activeOpacity={0.92}
    style={styles.bundleCard}
    onPress={() =>
      router.push({
        pathname: "/bundle/[id]",
        params: {
          id: item._id,
        },
      })
    }
  >
    {/* HERO */}

    <Image
      source={{
        uri: item.mainImages?.[0],
      }}
      style={styles.bundleImage}
    />

    <View style={styles.bundleOverlay} />

    {/* SAVE */}

    <View style={styles.saveBadge}>
      <Text style={styles.saveBadgeText}>
        SAVE
      </Text>
    </View>

    {/* PRODUCT COLLAGE */}

    <View style={styles.productStack}>

      {item.products?.slice(0, 3).map((product, i) => (
        <Image
          key={product._id}
          source={{
            uri: product.images?.[0],
          }}
          style={[
            styles.stackImage,
            {
              left: i * 28,
              zIndex: 20 - i,
            },
          ]}
        />
      ))}

    </View>

    {/* CONTENT */}

    <View style={styles.bundleContent}>

      <Text
        numberOfLines={2}
        style={styles.bundleTitle}
      >
        {item.title}
      </Text>

      <Text style={styles.bundleCount}>
        {item.products.length} Products Included
      </Text>

      <View style={styles.priceRow}>

        <Text style={styles.bundlePrice}>
          ₹{item.price}
        </Text>

        <TouchableOpacity style={styles.shopButton}>
          <Text style={styles.shopButtonText}>
            View →
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  </TouchableOpacity>
)}

      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#FFF",
},

loader:{
flex:1,
justifyContent:"center",
alignItems:"center",
},

header:{
paddingHorizontal:20,
paddingTop:12,
paddingBottom:20,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
},

smallTitle:{
fontSize:12,
letterSpacing:2,
color:"#888",
fontWeight:"700",
},
bundleCard: {
  marginHorizontal: 20,
  height: 480,
  borderRadius: 30,
  overflow: "hidden",
  marginBottom: 26,
  backgroundColor: "#F6F6F6",

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 8,
  },

  elevation: 8,
},

bundleImage: {
  width: "100%",
  height: 320,
},

bundleOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,.15)",
},

saveBadge: {
  position: "absolute",
  top: 18,
  right: 18,
  backgroundColor: "#111",
  borderRadius: 30,
  paddingHorizontal: 14,
  paddingVertical: 8,
},

saveBadgeText: {
  color: "#FFF",
  fontWeight: "700",
  fontSize: 12,
},

productStack: {
  position: "absolute",
  top: 240,
  left: 20,
  height: 62,
  width: 180,
},

stackImage: {
  position: "absolute",
  width: 62,
  height: 62,
  borderRadius: 18,
  borderWidth: 3,
  borderColor: "#FFF",
},

bundleContent: {
  flex: 1,
  padding: 22,
  justifyContent: "space-between",
},

bundleTitle: {
  fontSize: 28,
  fontWeight: "900",
  color: "#111",
},

bundleCount: {
  color: "#777",
  marginTop: 8,
  fontSize: 15,
},

priceRow: {
  marginTop: 24,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

bundlePrice: {
  fontSize: 30,
  fontWeight: "900",
},

shopButton: {
  backgroundColor: "#111",
  borderRadius: 30,
  paddingHorizontal: 22,
  paddingVertical: 12,
},

shopButtonText: {
  color: "#FFF",
  fontWeight: "700",
},
bigTitle:{
fontSize:34,
fontWeight:"900",
marginTop:6,
},

searchCircle:{
width:52,
height:52,
borderRadius:26,
backgroundColor:"#FFF",
justifyContent:"center",
alignItems:"center",
elevation:6,
},

searchContainer:{
paddingHorizontal:20,
marginBottom:20,
},

searchInput:{
height:56,
backgroundColor:"#F6F6F6",
borderRadius:18,
paddingHorizontal:18,
fontSize:16,
},

heroCard:{
marginHorizontal:20,
height:430,
borderRadius:28,
overflow:"hidden",
marginBottom:30,
},

heroImage:{
width:"100%",
height:"100%",
},

heroOverlay:{
...StyleSheet.absoluteFillObject,
backgroundColor:"rgba(0,0,0,.28)",
},

heroContent:{
position:"absolute",
bottom:28,
left:24,
},

heroLabel:{
color:"#FFF",
letterSpacing:2,
fontSize:12,
fontWeight:"700",
},

heroTitle:{
color:"#FFF",
fontSize:34,
fontWeight:"900",
marginVertical:10,
},

heroButton:{
color:"#FFF",
fontWeight:"700",
fontSize:16,
},

sectionTitle:{
fontSize:28,
fontWeight:"900",
paddingHorizontal:20,
marginBottom:20,
},

});