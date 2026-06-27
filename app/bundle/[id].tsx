import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/utils/config";

import { Ionicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

const COLORS = {
  bg: "#F7F7F5",
  card: "#FFFFFF",
  text: "#111111",
  sub: "#666666",
  neon: "#B6FF2E",
  border: "#E9E9E9",
};
type Product = {
  _id: string;
  title: string;
  price: number;
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

export default function BundlePDP() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
const [sizeModalVisible, setSizeModalVisible] = useState(false);
const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchBundle();
  }, []);

  const fetchBundle = async () => {
    try {
      const res = await api.get(`/api/bundles/${id}`);
      setBundle(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const images = bundle?.mainImages || [];

  const changeImage = (index: number) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setActiveImage(index);
  };

  const bottomTranslate = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [120, 0],
    extrapolate: "clamp",
  });

  const bottomOpacity = scrollY.interpolate({
    inputRange: [0, 180, 220],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator color={COLORS.neon} size="large" />
      </SafeAreaView>
    );
  }

  if (!bundle) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {
            useNativeDriver: true,
          }
        )}
        scrollEventThrottle={16}
      >
        {/* ================= HERO ================= */}

        <View style={styles.heroContainer}>

          <Animated.View
            style={[
              styles.imageWrapper,
              {
                opacity: fade,
                transform: [{ scale }],
              },
            ]}
          >
            <Image
              source={{
                uri: images[activeImage],
              }}
              style={styles.heroImage}
            />

            <View style={styles.overlay} />
          </Animated.View>

          {/* LEFT THUMBNAILS */}

          <View style={styles.thumbContainer}>

            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => changeImage(index)}
                style={[
                  styles.thumbCard,
                  activeImage === index &&
                  styles.activeThumb,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.thumbImage}
                />
              </TouchableOpacity>
            ))}

          </View>

          {/* TOP BAR */}

          <View style={styles.topBar}>

            <TouchableOpacity
              style={styles.circle}
              onPress={() => router.back()}
            >
              <Text style={styles.icon}>←</Text>
            </TouchableOpacity>

            <View style={styles.rightIcons}>

              <TouchableOpacity style={styles.circle}>
                <Text style={styles.icon}>♡</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.circle}>
                <Text style={styles.icon}>↗</Text>
              </TouchableOpacity>

            </View>

          </View>

          {/* IMAGE COUNT */}

          <View style={styles.imageCount}>

            <Text style={styles.imageCountText}>
              {activeImage + 1} / {images.length}
            </Text>

          </View>

          {/* BUNDLE TAG */}

          <View style={styles.bundleChip}>

            <View style={styles.greenDot} />

            <Text style={styles.bundleChipText}>
              PREMIUM BUNDLE
            </Text>

          </View>

        </View>
        {/* ============================
        BUNDLE DETAILS
============================= */}

        <View style={styles.content}>

          <View style={styles.headerRow}>

            <View style={{ flex: 1 }}>

              <Text style={styles.bundleTitle}>
                {bundle.title}
              </Text>

              <Text style={styles.bundleDesc}>
                {bundle.description}
              </Text>

            </View>

            <View style={styles.ratingBadge}>

              <Text style={styles.ratingText}>
                ⭐ 4.9
              </Text>

            </View>

          </View>

          {/* PRICE */}

     <View style={styles.priceCard}>

  <View style={styles.priceLeft}>

    <View style={styles.saveBadge}>
      <Text style={styles.saveBadgeText}>
        SAVE {Math.round(((bundle.products.reduce((s,p)=>s+p.price,0)-bundle.price)/bundle.products.reduce((s,p)=>s+p.price,0))*100)}%
      </Text>
    </View>

    <Text style={styles.currentPrice}>
      ₹{bundle.price}
    </Text>

    <View style={styles.priceRow}>

      <Text style={styles.oldPrice}>
        ₹{bundle.products.reduce((sum,p)=>sum+p.price,0)}
      </Text>

      <View style={styles.divider}/>

      <Text style={styles.taxText}>
        Incl. GST
      </Text>

    </View>

  </View>

  <View style={styles.rightSaving}>

    <Text style={styles.youSave}>
      YOU SAVE
    </Text>

    <Text style={styles.saveAmount}>
      ₹{bundle.products.reduce((sum,p)=>sum+p.price,0)-bundle.price}
    </Text>

    <View style={styles.greenLine}/>

    <Text style={styles.bundleOffer}>
      Bundle Offer
    </Text>

  </View>

</View>

          {/* FEATURES */}

       

          {/* CTA */}

          <TouchableOpacity
            style={styles.buildLookBtn}
            onPress={() => router.push(`/bundle/create`)}
          >

            <Text style={styles.buildLookText}>
              BUILD YOUR LOOK
            </Text>

           <View style={styles.arrowCircle}>
  <Ionicons
    name="arrow-forward"
    size={20}
    color="#B6FF2E"
  />
</View>

          </TouchableOpacity>

        </View>

        {/* ================================
        WHAT'S INSIDE
================================ */}

        <View style={styles.section}>

          <View style={styles.sectionRow}>

            <Text style={styles.sectionHeading}>
              What's Included
            </Text>

            <Text style={styles.sectionCount}>
              {bundle.products.length} ITEMS
            </Text>

          </View>

       {bundle.products.map((product) => (

  <TouchableOpacity
    key={product._id}
    activeOpacity={0.92}
    style={styles.bundleItem}
  >

    <Image
      source={{ uri: product.images?.[0] }}
      style={styles.bundleItemImage}
    />

    <View style={styles.bundleInfo}>

      <View style={styles.itemTop}>

        <Text
          numberOfLines={2}
          style={styles.bundleItemTitle}
        >
          {product.title}
        </Text>

        <View style={styles.includeBadge}>
          <Text style={styles.includeText}>✓</Text>
        </View>

      </View>

      <Text style={styles.bundleItemPrice}>
        ₹{product.price}
      </Text>

      <View style={styles.sizeRow}>

    <View style={{ flex: 1, zIndex: 999 }}>

 <TouchableOpacity
  activeOpacity={0.9}
  style={styles.sizeSelector}
  onPress={() => {
    setActiveProduct(product);
    setSizeModalVisible(true);
  }}
>

<Text style={styles.sizeText}>
  {selectedSizes[product._id] || "Select Size"}
</Text>

<Ionicons
  name="chevron-down"
  size={18}
  color="#FFF"
/>

  </TouchableOpacity>

  {openDropdown === product._id && (

    <View style={styles.customDropdown}>

      {["S", "M", "L", "XL", "XXL"].map((size) => (

        <TouchableOpacity
          key={size}
          style={styles.dropdownOption}
          onPress={() => {

            setSelectedSizes(prev => ({
              ...prev,
              [product._id]: size,
            }));

            setOpenDropdown(null);

          }}
        >

          <Text style={styles.dropdownOptionText}>
            {size}
          </Text>

          {selectedSizes[product._id] === size && (
            <Ionicons
              name="checkmark"
              size={18}
              color="#7CFC00"
            />
          )}

        </TouchableOpacity>

      ))}

    </View>

  )}

</View>

        <TouchableOpacity
          style={styles.previewBtn}
        >

          <Text style={styles.previewText}>
            Preview
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  </TouchableOpacity>

))}

        </View>

        {/* ================================
        BUNDLE SAVINGS
================================ */}

    
        {/* ===========================================
            COMPLETE THE LOOK
=========================================== */}

        <View style={styles.lookSection}>

          <Text style={styles.lookHeading}>
            Complete The Look
          </Text>

          <Text style={styles.lookSub}>
            Everything styled together.
          </Text>

          <View style={styles.lookCard}>

            <Image
              source={{
                uri: bundle.mainImages?.[0]
              }}
              style={styles.lookHero}
            />

            <View style={styles.lookOverlay} />

            <View style={styles.lookProducts}>

              {bundle.products.slice(0, 4).map((product, index) => (
                <View
                  key={product._id}
                  style={[
                    styles.lookBubble,
                    {
                      top: index === 0 ? 30 : index === 1 ? 120 : index === 2 ? 210 : 300,
                      left: index % 2 === 0 ? 20 : width - 120,
                    }
                  ]}
                >

                  <Image
                    source={{
                      uri: product.images?.[0]
                    }}
                    style={styles.lookBubbleImage}
                  />

                </View>
              ))}

            </View>

            <View style={styles.lookBottom}>

              <Text style={styles.lookTitle}>
                {bundle.title}
              </Text>

              <Text style={styles.lookDesc}>
                Styled & Ready To Wear
              </Text>

            </View>

          </View>

        </View>
    <View style={styles.savingSection}>

          <Text style={styles.savingTitle}>
            Bundle Savings
          </Text>

          <View style={styles.savingCard}>

            <View style={styles.priceBox}>

              <Text style={styles.label}>
                Individual
              </Text>

              <Text style={styles.whitePrice}>

                ₹
                {
                  bundle.products.reduce(
                    (sum, p) => sum + p.price,
                    0
                  )
                }

              </Text>

            </View>

            <View style={styles.centerArrow}>

         
  <Ionicons
    name="arrow-forward"
    size={20}
    color="#B6FF2E"
  />


            </View>

            <View style={styles.priceBoxGreen}>

              <Text style={styles.greenLabel}>
                Bundle
              </Text>

              <Text style={styles.greenPrice}>
                ₹{bundle.price}
              </Text>

            </View>

          </View>

        </View>
        {/* ===========================================
                WHY CHOOSE
=========================================== */}

        <View style={styles.whySection}>

          <Text style={styles.whyHeading}>
            Why You'll Love It
          </Text>

          <View style={styles.whyGrid}>

            <View style={styles.whyCard}>

              <Text style={styles.whyIcon}>
                ⚡
              </Text>

              <Text style={styles.whyTitle}>
                Extra Savings
              </Text>

              <Text style={styles.whyDesc}>
                Pay less than buying separately.
              </Text>

            </View>

            <View style={styles.whyCard}>

              <Text style={styles.whyIcon}>
                🔥
              </Text>

              <Text style={styles.whyTitle}>
                Trending
              </Text>

              <Text style={styles.whyDesc}>
                Curated by fashion experts.
              </Text>

            </View>

            <View style={styles.whyCard}>

              <Text style={styles.whyIcon}>
                🚚
              </Text>

              <Text style={styles.whyTitle}>
                Fast Delivery
              </Text>

              <Text style={styles.whyDesc}>
                Delivered to your doorstep.
              </Text>

            </View>

            <View style={styles.whyCard}>

              <Text style={styles.whyIcon}>
                ⭐
              </Text>

              <Text style={styles.whyTitle}>
                Premium
              </Text>

              <Text style={styles.whyDesc}>
                Hand-picked quality products.
              </Text>

            </View>

          </View>

        </View>



        {/* ===========================================
            SIMILAR BUNDLES
=========================================== */}

        <View style={styles.similarSection}>

          <View style={styles.similarHeader}>

            <Text style={styles.similarHeading}>
              You May Also Like
            </Text>

            <TouchableOpacity>

              <Text style={styles.viewAll}>
                View All
              </Text>

            </TouchableOpacity>

          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 24
            }}
          >

            {[...Array(5)].map((_, index) => (

              <TouchableOpacity
                key={index}
                style={styles.similarCard}
                activeOpacity={0.9}
              >

                <Image
                  source={{
                    uri: bundle.mainImages?.[0]
                  }}
                  style={styles.similarImage}
                />

                <View style={styles.similarInfo}>

                  <Text
                    numberOfLines={2}
                    style={styles.similarTitle}
                  >

                    Minimal Street Bundle

                  </Text>

                  <Text style={styles.similarPrice}>
                    ₹1999
                  </Text>

                  <View style={styles.similarBottom}>

                    <View style={styles.discountBadge}>

                      <Text style={styles.discountText}>
                        SAVE 25%
                      </Text>

                    </View>

                    <Text style={styles.similarArrow}>
                      →
                    </Text>

                  </View>

                </View>

              </TouchableOpacity>

            ))}

          </ScrollView>

        </View>
 <View style={{ marginBottom: 120 }} />
 </ Animated.ScrollView>
        {/* ===========================================
          STICKY ADD TO CART
=========================================== */}

 <Animated.View
  style={[
    styles.bottomBar,
    {
      opacity: bottomOpacity,
      transform: [{ translateY: bottomTranslate }],
    },
  ]}
>
  <View style={styles.bottomInfo}>

    <View style={styles.imageStack}>

      {bundle.products.slice(0, 3).map((product, index) => (
        <Image
          key={product._id}
          source={{ uri: product.images?.[0] }}
          style={[
            styles.stackImage,
            {
              left: index * 20,
              zIndex: 10 - index,
            },
          ]}
        />
      ))}

    </View>

    <View style={styles.itemInfo}>

      <Text style={styles.itemCount}>
        {bundle.products.length} Items
      </Text>

      <Text style={styles.saveText}>
        Save ₹
        {bundle.products.reduce((s, p) => s + p.price, 0) -
          bundle.price}
      </Text>

    </View>

  </View>

<TouchableOpacity
  activeOpacity={0.9}
  style={styles.priceButton}
>

  <Text
    numberOfLines={1}
    adjustsFontSizeToFit
    minimumFontScale={0.8}
    style={styles.priceText}
  >
    ₹{bundle.price}
  </Text>
<View style={styles.arrowContainer}>
  <Ionicons
    name="chevron-forward"
    size={22}
    color="#9EFF32"
  />
</View>

</TouchableOpacity>

</Animated.View>
<Modal
  visible={sizeModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setSizeModalVisible(false)}
>

  <Pressable
    style={styles.modalOverlay}
    onPress={() => setSizeModalVisible(false)}
  >

    <Pressable
      style={styles.bottomSheet}
      onPress={(e) => e.stopPropagation()}
    >

      <View style={styles.sheetHandle} />

      <Text style={styles.sheetTitle}>
        Select Size
      </Text>

      <Text style={styles.sheetSub}>
        {activeProduct?.title}
      </Text>

      <View style={styles.sizeGrid}>

        {["S","M","L","XL","XXL"].map((size)=>{

          const selected =
            selectedSizes[activeProduct?._id || ""] === size;

          return(

            <TouchableOpacity
              key={size}
              activeOpacity={0.9}
              style={[
                styles.sheetSize,
                selected && styles.sheetSizeActive,
              ]}
              onPress={()=>{

                if(activeProduct){

                  setSelectedSizes(prev=>({
                    ...prev,
                    [activeProduct._id]:size,
                  }));

                }

                setSizeModalVisible(false);

              }}
            >

              <Text
                style={[
                  styles.sheetSizeText,
                  selected && styles.sheetSizeTextActive,
                ]}
              >
                {size}
              </Text>

            </TouchableOpacity>

          );

        })}

      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={()=>setSizeModalVisible(false)}
      >

        <Text style={styles.doneText}>
          Done
        </Text>

      </TouchableOpacity>

    </Pressable>

  </Pressable>

</Modal>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  backgroundColor:"#F7F7F5",
  },
modalOverlay:{
  flex:1,
  backgroundColor:"rgba(0,0,0,.35)",
  justifyContent:"center",
  padding:24,
},

bottomSheet:{
  width:"100%",

  maxWidth:420,

  backgroundColor:"#F7F7F5",

  borderRadius:32,

  paddingHorizontal:24,

  paddingTop:20,

  paddingBottom:24,

  shadowColor:"#000",

  shadowOpacity:0.18,

  shadowRadius:24,

  shadowOffset:{
    width:0,
    height:12,
  },

  elevation:25,
},
sheetHandle:{
  width:55,
  height:5,

  borderRadius:3,

  backgroundColor:"#D8D8D8",

  alignSelf:"center",

  marginBottom:20,
},

sheetTitle:{
  fontSize:28,

  fontWeight:"900",

  color:"#111",
},

sheetSub:{
  marginTop:6,

  color:"#777",

  fontSize:15,

  marginBottom:24,
},

sizeGrid:{
  flexDirection:"row",

  flexWrap:"wrap",

  justifyContent:"space-between",
},

sheetSize:{
  width:"30%",

  height:60,

  marginBottom:14,

  borderRadius:18,

  backgroundColor:"#FFF",

  borderWidth:1,

  borderColor:"#E8E8E8",

  justifyContent:"center",

  alignItems:"center",
},

sheetSizeActive:{
  backgroundColor:"#B6FF2E",

  borderColor:"#B6FF2E",
},

sheetSizeText:{
  fontSize:18,

  fontWeight:"900",

  color:"#111",
},

sheetSizeTextActive:{
  color:"#000",
},

doneButton:{
  marginTop:18,

  height:58,

  borderRadius:30,

  backgroundColor:"#111",

  justifyContent:"center",

  alignItems:"center",
},

doneText:{
  color:"#FFF",

  fontSize:17,

  fontWeight:"900",
},

sizeModal:{
  backgroundColor:"#FFF",
  borderRadius:24,
  padding:20,
},

modalTitle:{
  fontSize:22,
  fontWeight:"900",
  marginBottom:18,
},

modalSize:{
  height:54,
  justifyContent:"center",
  borderBottomWidth:1,
  borderBottomColor:"#EEE",
},

modalSizeText:{
  fontSize:18,
  fontWeight:"700",
},
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  backgroundColor:"#F7F7F5",
  },
  section: {
    marginTop: 44,
    paddingHorizontal: 24,
    backgroundColor:"#F7F7F5",
  },
  similarSection: {
    marginTop: 60,backgroundColor:"#F7F7F5",
    paddingLeft: 24,
  },

  similarHeader: {
    paddingRight: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  similarHeading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
  },

  viewAll: {
    color: "#B6FF2E",
    fontWeight: "800",
    fontSize: 15,
  },

  similarCard: {
    width: 240,
    backgroundColor:"#FFF",
  borderColor:"#ECECEC",
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 18,
    borderWidth: 1,
  
  },

  similarImage: {
    width: "100%",
    height: 260,
  },

  similarInfo: {
    padding: 18,
  },

  similarTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
  },

  similarPrice: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
  },

  similarBottom: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  discountBadge: {
    backgroundColor: "#B6FF2E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  discountText: {
    fontWeight: "900",
    color: "#000",
    fontSize: 12,
  },

  similarArrow: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000000",
  },

 bottomBar:{
  position:"absolute",
  left:14,
  right:14,
  bottom:20,

  height:76,

  borderRadius:38,

  backgroundColor:"#050505",

  paddingHorizontal:20,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#1F1F1F",

  elevation:25,

  shadowColor:"#000",

  shadowOpacity:.35,

  shadowRadius:16,
},

bottomInfo:{
  flexDirection:"row",
  alignItems:"center",
},

imageStack:{
  width:82,
  height:46,
  position:"relative",
},

stackImage:{
  position:"absolute",

  width:42,
  height:42,

  borderRadius:21,

  borderWidth:2,

  borderColor:"#050505",

  backgroundColor:"#FFF",
},

itemInfo:{
  marginLeft:12,
},

itemCount:{
  color:"#ffffff",
  fontSize:22,
  fontWeight:"900",
},

saveText:{
  marginTop:3,
  color:"#9EFF32",
  fontWeight:"700",
  fontSize:14,
},
priceButton: {
  height: 56,

  paddingLeft: 18,
  paddingRight: 12,

  borderRadius: 28,

   backgroundColor:"#000000",


  flexDirection: "row",

  alignItems: "center",

  justifyContent: "space-between",
},

priceText: {
  color: "#FFF",
  fontSize: 30,
  fontWeight: "900",
},

arrowContainer: {
  width: 28,
  height: 28,

  marginLeft: 10,

  justifyContent: "center",
  alignItems: "center",
},

arrow: {
  color: "#9EFF32",

  fontSize: 30,

  fontWeight: "900",

  lineHeight: 30,

  textAlign: "center",

  includeFontPadding: false,

  textAlignVertical: "center",
},

  cartButton: {
    height: 62,
    backgroundColor: "#B6FF2E",
    borderRadius: 40,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },


  cartArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },

  cartArrowText: {
    color: "#B6FF2E",
    fontSize: 20,
    fontWeight: "900",
  },
  lookSection: {
    marginTop: 55,
    paddingHorizontal: 24,backgroundColor:"#F7F7F5",
    position: "relative",
  },

  lookHeading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
  },

  lookSub: {
    color: "#8A8A8A",
    marginTop: 8,
    marginBottom: 20,
  },

  lookCard: {
    height: 470,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  lookHero: {
    width: "100%",
    height: "100%",
  },

  lookOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.30)",
  },

  lookProducts: {
    ...StyleSheet.absoluteFillObject,
  },

  lookBubble: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFF",
    padding: 4,
  },

  lookBubbleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },

  lookBottom: {
    position: "absolute",
    left: 24,
    bottom: 24,
  },

  lookTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
  },

  lookDesc: {
    marginTop: 8,
    color: "#04f510",
  },

  whySection: {
    marginTop: 55,
    paddingHorizontal: 24,backgroundColor:"#F7F7F5",
  },

  whyHeading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 24,
  },

  whyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  whyCard: {
    width: "48%",
  backgroundColor:"#FFF",
  borderColor:"#ECECEC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,

  },

  whyIcon: {
    fontSize: 34,
  },

  whyTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
  },

  whyDesc: {
    marginTop: 10,
    color: "#888",
    lineHeight: 22,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  sectionHeading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#000000",
  },

  sectionCount: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
    color: "#000000",
  },

bundleItem: {
  backgroundColor: "#FFF",
  borderRadius: 26,
  padding: 14,
  flexDirection: "row",
  marginBottom: 18,
  borderWidth: 1,
  borderColor: "#ECECEC",

  overflow: "visible",

  zIndex: 100,
  elevation: 10,
},

  bundleItemImage: {
    width: 105,
    height: 125,
    borderRadius: 18,
  },

  bundleInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "space-between",
  },

  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bundleItemTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    color: "#000000",
    paddingRight: 10,
  },

  includeBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  includeText: {
    fontWeight: "900",
    fontSize: 18,
    color: "#000",
  },

  bundleItemPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    marginTop: 10,
  },

  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  sizeSelector: {
    height: 42,
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },

  sizeText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  sizeArrow: {
    color: "#B6FF2E",
    fontSize: 18,
  },

  previewBtn: {
    width: 92,
    height: 42,
    backgroundColor: "#B6FF2E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  previewText: {
    fontWeight: "900",
    color: "#000",
  },

  savingSection: {
    marginTop: 6,
    paddingHorizontal: 24,
    backgroundColor:"#F7F7F5",
  },

  savingTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 18,
  },

  savingCard: {
     backgroundColor:"#FFF",
  borderColor:"#ECECEC",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  
  },

  priceBox: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#888",
    fontWeight: "700",
  },

  whitePrice: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
    marginTop: 8,
  },

  centerArrow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#191919",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },

  arrowIcon: {
    fontSize: 28,
    fontWeight: "900",
    color: "#B6FF2E",
  },

  priceBoxGreen: {
    flex: 1,
    backgroundColor: "#B6FF2E",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
  },

  greenLabel: {
    color: "#000",
    fontWeight: "900",
    letterSpacing: 1,
  },

  greenPrice: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "900",
    color: "#000",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor:"#F7F7F5",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  bundleTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#000000",
  },

  bundleDesc: {
    color: "#999",
    fontSize: 15,
    lineHeight: 25,
    marginTop: 12,
    paddingRight: 10,
  },

  ratingBadge: {
    backgroundColor: "#161616",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#222",
  },

  ratingText: {
    color: "#FFF",
    fontWeight: "700",
  },

priceCard:{
  marginTop:32,

  backgroundColor:"#FFF",

  borderRadius:28,

  padding:22,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#ECECEC",

  shadowColor:"#000",

  shadowOpacity:.08,

  shadowRadius:18,

  shadowOffset:{
    width:0,
    height:8,
  },

  elevation:8,
},

priceLeft:{
  flex:1,
},

saveBadge:{
  alignSelf:"flex-start",

  backgroundColor:"#111",

  borderRadius:20,

  paddingHorizontal:12,

  paddingVertical:6,

  marginBottom:14,
},

saveBadgeText:{
  color:"#B6FF2E",

  fontSize:11,

  fontWeight:"900",

  letterSpacing:1,
},

currentPrice:{
  fontSize:44,

  fontWeight:"900",

  color:"#111",
},

priceRow:{
  flexDirection:"row",

  alignItems:"center",

  marginTop:10,
},

oldPrice:{
  color:"#9B9B9B",

  textDecorationLine:"line-through",

  fontWeight:"700",

  fontSize:18,
},

divider:{
  width:5,
  height:5,

  borderRadius:3,

  backgroundColor:"#CCC",

  marginHorizontal:10,
},

taxText:{
  color:"#777",

  fontWeight:"600",
},

rightSaving:{
  width:120,

  height:120,

  borderRadius:24,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",
},

youSave:{
  fontSize:11,

  fontWeight:"800",

  color:"#111",

  letterSpacing:1,
},

saveAmount:{
  marginTop:6,

  fontSize:28,

  fontWeight:"900",

  color:"#111",
},

greenLine:{
  width:40,

  height:1,

  backgroundColor:"rgba(0,0,0,.2)",

  marginVertical:10,
},

bundleOffer:{
  fontWeight:"700",

  color:"#111",

  fontSize:12,
},



  saveCard: {
    backgroundColor: "#B6FF2E",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 22,
  },

  saveLabel: {
    fontWeight: "800",
    fontSize: 11,
    color: "#000",
  },

  savePrice: {
    marginTop: 6,
    fontWeight: "900",
    fontSize: 26,
    color: "#000",
  },

  featureContainer: {
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  feature: {
    width: "31%",  backgroundColor:"#FFF",
  borderColor:"#ECECEC",
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: "center",
    borderWidth: 1,
  
  },

  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  featureEmoji: {
    fontSize: 22,
  },

  featureTitle: {
    marginTop: 16,
    fontWeight: "800",
    fontSize: 16,
    color: "#FFF",
  },
bottomLeft: {
  flexDirection: "row",
  alignItems: "center",
},

bottomStack: {
  width: 70,
  height: 46,
  position: "relative",
},
customDropdown:{
  position:"absolute",

  top:48,

  left:0,

  right:0,

  backgroundColor:"#FFF",

  borderRadius:16,

  borderWidth:1,

  borderColor:"#ECECEC",

  overflow:"hidden",

  elevation:15,

  shadowColor:"#000",

  shadowOpacity:.12,

  shadowRadius:12,

  shadowOffset:{
    width:0,
    height:8,
  },

  zIndex:9999,
},

dropdownOption:{
  height:46,

  paddingHorizontal:16,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  borderBottomWidth:1,

  borderBottomColor:"#F3F3F3",
},

dropdownOptionText:{
  fontSize:15,

  fontWeight:"700",

  color:"#111",
},
bottomStackImage: {
  position: "absolute",

  width: 42,
  height: 42,

  borderRadius: 21,

  borderWidth: 2,

  borderColor: "#111",

  backgroundColor: "#FFF",
},
  featureSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#888",
  },

  buildLookBtn: {
    marginTop: 34,
    height: 66,
    backgroundColor: "#B6FF2E",
    borderRadius: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 26,
  },

  buildLookText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 1,
  },
dropdownGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
},

sizeChip: {
  width: 44,
  height: 38,

  borderRadius: 10,

  backgroundColor: "#F5F5F5",

  justifyContent: "center",
  alignItems: "center",

  borderWidth: 1,
  borderColor: "#E5E5E5",

  marginRight: 8,
  marginBottom: 8,
},

sizeChipActive: {
  backgroundColor: "#B6FF2E",
  borderColor: "#B6FF2E",
},

sizeChipText: {
  color: "#111",
  fontWeight: "800",
},

sizeChipTextActive: {
  color: "#000",
},
  arrowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },


  heroContainer: {
    height: height * 0.82,
    justifyContent: "center",
    alignItems: "center",
  },

  imageWrapper: {
    width: width,
    height: height * 0.78,
  },

  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.22)",
  },

  thumbContainer: {
    position: "absolute",
    left: 18,
    top: 140,
  },

  thumbCard: {
    width: 62,
    height: 82,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#111",
  },

  activeThumb: {
    borderColor: COLORS.neon,
  },

  thumbImage: {
    width: "100%",
    height: "100%",
  },

  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rightIcons: {
    flexDirection: "row",
  },

  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,.45)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
  },

  icon: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  imageCount: {
    position: "absolute",
    bottom: 40,
    right: 22,
    backgroundColor: "rgba(0,0,0,.7)",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  imageCountText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },

  bundleChip: {
    position: "absolute",
    bottom: 40,
    left: 22,
    backgroundColor: "#111",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.neon,
    marginRight: 8,
  },

  bundleChipText: {
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 11,
  },

});