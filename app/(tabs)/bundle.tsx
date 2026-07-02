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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  <View style={styles.listHeader}>

    <Text style={styles.collectionLabel}>
      CURATED DROP
    </Text>

    <Text style={styles.collectionTitle}>
      Luxury{"\n"}Bundles
    </Text>

    <Text style={styles.collectionSubtitle}>
      Premium looks curated by our stylists.
    </Text>

    <View style={styles.searchWrapper}>

      <Ionicons
        name="search"
        size={20}
        color="#888"
      />

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search bundles..."
        placeholderTextColor="#999"
        style={styles.searchInput}
      />

    </View>

  </View>
}
renderItem={({ item }) => (

<TouchableOpacity
  activeOpacity={0.94}
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

  {/* Background */}

  <Image
    source={{
      uri: item.mainImages?.[0],
    }}
    style={styles.bundleImage}
  />

  <View style={styles.overlay} />

  <LinearGradient
  colors={[
    "transparent",
    "rgba(0,0,0,.15)",
    "rgba(0,0,0,.45)",
    "rgba(0,0,0,.75)",
  ]}
  style={styles.gradient}
/>

  {/* Top */}

  <View style={styles.topRow}>

    <View style={styles.bundlePill}>

      <Text style={styles.bundlePillText}>
        BUNDLE
      </Text>

    </View>

    <View style={styles.discountPill}>

      <Text style={styles.discountText}>
        30% OFF
      </Text>

    </View>

  </View>

  {/* Content */}

<View style={styles.content}>

  <Text style={styles.smallLabel}>
    CURATED BUNDLE
  </Text>

  <Text
    numberOfLines={2}
    style={styles.bundleTitle}
  >
    {item.title}
  </Text>

  <View style={styles.priceRow}>

    <Text style={styles.price}>
      ₹{item.price}
    </Text>

    <Text style={styles.oldPrice}>
      ₹{Math.round(item.price * 1.3)}
    </Text>

    <View style={styles.saveBadge}>

      <Text style={styles.saveBadgeText}>
        SAVE 30%
      </Text>

    </View>

  </View>

  <Text
    numberOfLines={1}
    style={styles.brandText}
  >
    {item.description || "Street Collection"}
  </Text>

  {/* ---------- Bottom ---------- */}

  <View style={styles.bottomRow}>

    <View>

      <View style={styles.stackRow}>

        {item.products?.map((product,index)=>(

          <View
            key={product._id}
            style={[
              styles.stackCircle,
              {
                marginLeft:index===0?0:-14,
                zIndex:20-index,
              },
            ]}
          >

            <Image
              source={{
                uri:product.images?.[0],
              }}
              style={styles.stackImage}
            />

          </View>

        ))}

      </View>

    </View>

    <View style={styles.includeWrap}>

      <Text style={styles.includeLabel}>
        INCLUDED
      </Text>

      <Text style={styles.includeCount}>
        {item.products.length} Items
      </Text>

    </View>

  </View>

  {/* ---------- CTA ---------- */}

  {/* <View style={styles.ctaRow}>

    <TouchableOpacity
      style={styles.ctaButton}
      activeOpacity={0.9}
    >

      <Text style={styles.ctaText}>
        VIEW BUNDLE
      </Text>

    </TouchableOpacity>

    <TouchableOpacity
      style={styles.arrowButton}
    >

      <Ionicons
        name="arrow-forward"
        size={24}
        color="#FFF"
      />

    </TouchableOpacity>

  </View> */}

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
bottomRow:{
  marginTop:24,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"flex-end",
},

stackRow:{
  flexDirection:"row",

  alignItems:"center",

  height:56,
},

stackCircle:{
  width:58,
  height:58,

  borderRadius:29,

  backgroundColor:"#FFF",

  padding:3,

  overflow:"hidden",

  borderWidth:2,

  borderColor:"rgba(255,255,255,.35)",
},

stackImage:{
  width:"100%",
  height:"100%",

  borderRadius:26,
},

includeWrap:{
  alignItems:"flex-end",
},

includeLabel:{
  color:"#CFCFCF",

  fontSize:11,

  fontWeight:"700",

  letterSpacing:3,
},

includeCount:{
  marginTop:6,

  color:"#FFF",

  fontSize:26,

  fontWeight:"900",
},

ctaRow:{
  marginTop:28,

  flexDirection:"row",

  alignItems:"center",
},

ctaButton:{
  flex:1,

  height:58,

  borderRadius:29,

  backgroundColor:"#FFF",

  justifyContent:"center",

  alignItems:"center",
},

ctaText:{
  color:"#111",

  fontSize:17,

  fontWeight:"900",

  letterSpacing:1.4,
},

arrowButton:{
  width:58,
  height:58,

  marginLeft:14,

  borderRadius:29,

  backgroundColor:"rgba(255,255,255,.12)",

  borderWidth:1.5,

  borderColor:"rgba(255,255,255,.30)",

  justifyContent:"center",

  alignItems:"center",
},
bundleCard:{
  height:430,

  marginHorizontal:18,

  marginBottom:26,

  borderRadius:34,

  overflow:"hidden",

  backgroundColor:"#111",

  shadowColor:"#000",

  shadowOpacity:.25,

  shadowRadius:22,

  shadowOffset:{
    width:0,
    height:10,
  },

  elevation:12,
},

bundleImage:{
  ...StyleSheet.absoluteFillObject,

  width:"100%",

  height:"100%",
},

overlay:{
  ...StyleSheet.absoluteFillObject,

  backgroundColor:"rgba(0,0,0,.18)",
},

gradient:{
  position:"absolute",

  left:0,
  right:0,
  bottom:0,

  height:220,
},

topRow:{
  position:"absolute",

  top:22,
  left:22,
  right:22,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",
},

bundlePill:{
  backgroundColor:"#FFF",

  borderRadius:20,

  paddingHorizontal:14,

  paddingVertical:8,
},

bundlePillText:{
  color:"#111",

  fontWeight:"900",

  fontSize:11,

  letterSpacing:.8,
},

discountPill:{
  backgroundColor:"#B6FF2E",

  borderRadius:20,

  paddingHorizontal:14,

  paddingVertical:8,
},

discountText:{
  color:"#111",

  fontWeight:"900",

  fontSize:11,
},

content:{
  position:"absolute",

  left:22,
  right:22,

  bottom:30,
},

smallLabel:{
  color:"#D0D0D0",

  letterSpacing:4,

  fontSize:11,

  fontWeight:"700",
},

bundleTitle:{
  color:"#FFF",

  fontSize:38,

  fontWeight:"900",

  marginTop:10,
},

priceRow:{
  flexDirection:"row",

  alignItems:"center",

  marginTop:18,
},

price:{
  color:"#FFF",

  fontSize:40,

  fontWeight:"900",
},

oldPrice:{
  color:"#BDBDBD",

  fontSize:18,

  textDecorationLine:"line-through",

  marginLeft:12,
},

saveBadge:{
  marginLeft:12,

  backgroundColor:"#B6FF2E",

  borderRadius:18,

  paddingHorizontal:12,

  paddingVertical:7,
},

saveBadgeText:{
  color:"#111",

  fontWeight:"900",

  fontSize:11,
},

brandText:{
  color:"#DDD",

  marginTop:14,

  fontSize:15,
},






listHeader:{
  paddingHorizontal:22,
  paddingTop:16,
  paddingBottom:28,
},

collectionLabel:{
  color:"#8F8F8F",

  fontSize:12,

  fontWeight:"800",

  letterSpacing:4,
},

collectionTitle:{
  marginTop:10,

  fontSize:48,

  lineHeight:50,

  fontWeight:"900",

  color:"#111",
},

collectionSubtitle:{
  marginTop:12,

  color:"#777",

  fontSize:16,

  lineHeight:24,

  width:"80%",
},

searchWrapper:{
  marginTop:28,

  height:58,

  borderRadius:29,

  backgroundColor:"#F4F4F4",

  paddingHorizontal:20,

  flexDirection:"row",

  alignItems:"center",
},

searchInput:{
  flex:1,

  marginLeft:12,

  fontSize:16,

  color:"#111",
},



});