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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/utils/config";
// import
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import CartIcon from "@/components/CartIcon";
import { useWishlist } from "@/context/WishlistContext";
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
  const { addBundleToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlist();
  const [similarBundles, setSimilarBundles] = useState<Bundle[]>([]);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showDrawer, setShowDrawer] = useState(false);
const imageRefs = useRef<Record<string, View | null>>({});
  const drawerTranslate = useRef(new Animated.Value(height)).current;


  useEffect(() => {
    fetchBundle();
  }, []);

  const fetchBundle = async () => {
    try {
      const [bundleRes, similarRes] = await Promise.all([
        api.get(`/api/bundles/${id}`),
        api.get("/api/bundles?limit=10"),
      ]);

      setBundle(bundleRes.data);

      const currentId = String(id);

      const bundles =
        (similarRes.data.items || []).filter(
          (b: Bundle) => b._id !== currentId
        );

      setSimilarBundles(bundles);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };



  const handleSizeChange = (
    productId: string,
    size: string
  ) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
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


  useEffect(() => {
    Animated.spring(drawerTranslate, {
      toValue: showDrawer ? 0 : height,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    }).start();
  }, [showDrawer]);

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

          <Animated.FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width
              );

              setActiveImage(index);
            }}
            renderItem={({ item }) => (
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
                  source={{ uri: item }}
                  style={styles.heroImage}
                />

                <View style={styles.overlay} />
              </Animated.View>
            )}
          />

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

            <View style={styles.leftAction}>
              <Pressable
                onPress={() => router.back()}
                style={styles.topBtnWrapper}
              >
                <BlurView
                  intensity={90}
                  tint="light"
                  style={styles.blurButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={22}
                    color="#111"
                  />
                </BlurView>
              </Pressable>
            </View>

            <View style={styles.rightActions}>

              <CartIcon />

              <Pressable
                onPress={() =>
                  isInWishlist(bundle._id)
                    ? removeFromWishlist(bundle._id)
                    : addToWishlist(bundle._id)
                }
                style={styles.heartWrapper}
              >

                <Ionicons
                  name={
                    isInWishlist(bundle._id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={22}
                  color={
                    isInWishlist(bundle._id)
                      ? "#111"
                      : "#000000"
                  }
                />

              </Pressable>

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
                  SAVE {Math.round(((bundle.products.reduce((s, p) => s + p.price, 0) - bundle.price) / bundle.products.reduce((s, p) => s + p.price, 0)) * 100)}%
                </Text>
              </View>

              <Text style={styles.currentPrice}>
                ₹{bundle.price}
              </Text>

              <View style={styles.priceRow}>

                <Text style={styles.oldPrice}>
                  ₹{bundle.products.reduce((sum, p) => sum + p.price, 0)}
                </Text>

                <View style={styles.divider} />

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
                ₹{bundle.products.reduce((sum, p) => sum + p.price, 0) - bundle.price}
              </Text>

              <View style={styles.greenLine} />

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
              Included In Bundle
            </Text>

            <TouchableOpacity
              onPress={() => setShowDrawer(true)}
            >
              <Text style={styles.sectionAction}>
                Customize →
              </Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.bundlePreviewCard}
            onPress={() => setShowDrawer(true)}
          >

            <View style={styles.previewStack}>

              {bundle.products.slice(0, 4).map((product, index) => (
                <Image
                  key={product._id}
                  source={{ uri: product.images?.[0] }}
                  style={[
                    styles.previewImage,
                    {
                      left: index * 26,
                      zIndex: 20 - index,
                    }
                  ]}
                />
              ))}

            </View>

            <View style={styles.previewContent}>

              <Text style={styles.previewTitle}>
                {bundle.products.length} Premium Items
              </Text>

              <Text style={styles.previewSubtitle}>
                Select sizes, preview products and customize your bundle.
              </Text>

              <View style={styles.previewButton}>

                <Text style={styles.previewButtonText}>
                  OPEN CUSTOMIZER
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#B6FF2E"
                />

              </View>

            </View>

          </TouchableOpacity>

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

            <TouchableOpacity onPress={()=> router.push("/bundle") }>

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

         {similarBundles.map((item) => {
  const originalPrice = item.products.reduce(
    (sum, p) => sum + p.price,
    0
  );

  const discount = Math.round(
    ((originalPrice - item.price) / originalPrice) * 100
  );

  return (
    <TouchableOpacity
      key={item._id}
      activeOpacity={0.9}
      style={[styles.bundleCard, {
    marginRight:
      item._id === similarBundles[similarBundles.length - 1]._id ? 0 : 18,
  },]}
      onPress={() => router.push(`/bundle/${item._id}`)}
    >
      <Image
        source={{ uri: item.mainImages?.[0] }}
        style={styles.bundleImage}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.82)"]}
        style={styles.overlay}
      />

      <View style={styles.tag}>
        <Text style={styles.tagText}>BUNDLE</Text>
      </View>

      <View style={styles.discount}>
        <Text style={styles.discountLabel}>
          {discount}% OFF
        </Text>
      </View>

      <View style={styles.content}>

        <Text
          numberOfLines={2}
          style={styles.title}
        >
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{item.price}
          </Text>

          <Text style={styles.oldPrice}>
            ₹{originalPrice}
          </Text>

          <View style={styles.savePill}>
            <Text style={styles.saveText}>
              SAVE {discount}%
            </Text>
          </View>
        </View>

    

        <View style={styles.bottomRow}>

          <View style={styles.avatarRow}>
            {item.products.slice(0, 3).map((p, i) => (
              <Image
                key={i}
                source={{ uri: p.images?.[0] }}
                style={[
                  styles.avatar,
                  { marginLeft: i === 0 ? 0 : -14 },
                ]}
              />
            ))}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.included}>
              INCLUDED
            </Text>

            <Text style={styles.count}>
              {item.products.length} Items
            </Text>
          </View>

        </View>

      </View>
    </TouchableOpacity>
  );
})}

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
          onPress={() => setShowDrawer(true)}
        >

          <Text
            numberOfLines={1}
            style={styles.priceText}
          >
            ₹{bundle.price}
          </Text>

          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-up"
              size={24}
              color="#9EFF32"
            />
          </View>

        </TouchableOpacity>

      </Animated.View>
      <>
        {showDrawer && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowDrawer(false)}
            style={styles.backdrop}
          />
        )}

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                {
                  translateY: drawerTranslate,
                },
              ],
            },
          ]}
        >

          <View style={styles.handle} />

          <View style={styles.drawerHeader}>

            <View>

              <Text style={styles.drawerLabel}>
                YOUR BUNDLE
              </Text>

              <Text style={styles.drawerTitle}>
                Bundle Items
              </Text>

            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowDrawer(false)}
            >

              <Ionicons
                name="close"
                size={22}
                color="#111"
              />

            </TouchableOpacity>

          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 140,
            }}
          >

            {bundle.products.map((product) => (

              <View
                key={product._id}
                style={styles.drawerCard}
              >

                <Image
                                     ref={(ref) => {
    imageRefs.current[product._id] = ref;
  }}
                  source={{ uri: product.images?.[0] }}
                  style={styles.drawerImage}
                />

                <View style={styles.bundleInfo}>

                  <View style={styles.itemTop}>

                    <Text
                      numberOfLines={2}
                      style={styles.drawerProductTitle}
                    >
                      {product.title}
                    </Text>

                    <View style={styles.includeBadge}>
                      <Text style={styles.includeText}>
                        ✓
                      </Text>
                    </View>

                  </View>

                  <Text style={styles.drawerPrice}>
                    ₹{product.price}
                  </Text>

                  <View style={styles.sizeRow}>

                    <View
                      style={{
                        flex: 1,
                        zIndex: 999,
                      }}
                    >

                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.drawerSize}
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
                          color="#111"
                        />

                      </TouchableOpacity>

                    </View>

                    <TouchableOpacity
 
                      style={styles.previewBtn}
                      onPress={() => {
      imageRefs.current[product._id]?.measureInWindow((x, y, w, h) => {
      router.replace({
        pathname: "/product/[id]",
        params: {
          id: product._id,
          image: product.images?.[0],
          x,
          y,
          w,
          h,
        },
      });
    });
  }}
                    >

                      <Text style={styles.previewText}>
                        Preview
                      </Text>

                    </TouchableOpacity>

                  </View>

                </View>

              </View>

            ))}

          </ScrollView>

          <View style={styles.drawerFooter}>

            <TouchableOpacity
              style={styles.drawerButton}
              onPress={() => {

                const missing = bundle.products.find(
                  (p) => !selectedSizes[p._id]
                );

                if (missing) {
                  Toast.show({
                    type: "error",
                    text1: "Select Size",
                    text2: `Please select size for ${missing.title}`
                  });
                  return;
                }

                addBundleToCart(bundle, selectedSizes);

                setShowDrawer(false);

              }}
            >

              <Text style={styles.drawerButtonText}>
                ADD BUNDLE TO BAG
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#B6FF2E"
              />

            </TouchableOpacity>

          </View>

        </Animated.View>
      </>
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

              {["S", "M", "L", "XL", "XXL"].map((size) => {

                const selected =
                  selectedSizes[activeProduct?._id || ""] === size;

                return (

                  <TouchableOpacity
                    key={size}
                    activeOpacity={0.9}
                    style={[
                      styles.sheetSize,
                      selected && styles.sheetSizeActive,
                    ]}
                    onPress={() => {

                      if (activeProduct) {

                        setSelectedSizes(prev => ({
                          ...prev,
                          [activeProduct._id]: size,
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
              onPress={() => setSizeModalVisible(false)}
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
    backgroundColor: "#F7F7F5",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.35)",
    justifyContent: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.45)",
    zIndex: 100,
  },

  drawer: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: "82%",

    backgroundColor: "#FFF",

    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,

    zIndex: 101,
  },

  handle: {
    width: width * 0.155,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD",

    alignSelf: "center",

    marginTop: 12,
  },
bundleCard: {
  
  height: height * 0.380,
  borderRadius: 34,
  overflow: "hidden",
  marginBottom: height * 0.024,
  backgroundColor: "#eee",
},

bundleImage: {
  width: "100%",
  height: "100%",
  position: "absolute",
},

overlay: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "flex-end",
},

tag: {
  position: "absolute",
  top: 18,
  left: 18,
  backgroundColor: "#fff",
  paddingHorizontal: 18,
  height: height * 0.042,
  borderRadius: 21,
  justifyContent: "center",
},

tagText: {
  fontWeight: "800",
  letterSpacing: 1,
  color: "#111",
},

discount: {
  position: "absolute",
  top: 18,
  right: 18,
  backgroundColor: "#B6FF2E",
  paddingHorizontal: 18,
  height: height * 0.042,
  borderRadius: 21,
  justifyContent: "center",
},

discountLabel: {
  fontWeight: "800",
  color: "#111",
},

content: {
  flex: 1,
  justifyContent: "flex-end",
  padding: 22,
},

title: {
  color: "#fff",
  fontSize: width * 0.082,
  fontWeight: "900",
  // marginBottom: 12,
},

priceRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

price: {
  color: "#fff",
  fontSize:  width * 0.080,
  fontWeight: "900",
},

oldPrice: {
  marginLeft: 12,
  color: "#8d8d8d",
  textDecorationLine: "line-through",
  fontSize: 18,
},

savePill: {
  marginLeft: 12,
  backgroundColor: "#B6FF2E",
  paddingHorizontal: 18,
  paddingVertical: 8,
  borderRadius: 22,
},

saveText: {
  color: "#111",
  fontWeight: "900",
},

description: {
  color: "#ddd",
  fontSize: 17,
  marginBottom: 18,
},

bottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
},

avatarRow: {
  flexDirection: "row",
},

avatar: {
  width: 58,
  height: 58,
  borderRadius: 29,
  borderWidth: 4,
  borderColor: "#fff",
  backgroundColor: "#fff",
},

included: {
  color: "#bfbfbf",
  fontSize: 13,
  letterSpacing: 3,
  fontWeight: "700",
},

count: {
  color: "#fff",
  fontSize: 24,
  fontWeight: "900",
},
  drawerHeader: {
    paddingHorizontal: 22,
    paddingVertical: 20,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    borderBottomWidth: 1,

    borderColor: "#EEE",
  },

  drawerLabel: {
    fontSize: 12,

    letterSpacing: 2,

    color: "#888",

    fontWeight: "700",
  },

  drawerTitle: {
    marginTop: 6,

    fontSize: width  * 0.12,

    fontWeight: "900",

    color: "#111",
  },

  closeBtn: {
    width:  42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#F4F4F4",

    justifyContent: "center",

    alignItems: "center",
  },
  drawerCard: {
    backgroundColor: "#FFF",

    borderRadius: 24,

    padding: width  * 0.014,

    marginBottom: 16,

    borderWidth: 1,

    borderColor: "#ECECEC",

    flexDirection: "row",
  },

  drawerImage: {
    width: width  * 0.25,
    height: height * 0.125,

    borderRadius: 18,

    marginRight:width *  0.0116,
  },

  drawerProductTitle: {
    flex: 1,

    fontSize: 18,

    fontWeight: "800",

    color: "#111",
  },

  drawerPrice: {
    marginTop: 8,

    fontSize: 24,

    fontWeight: "900",

    color: "#111",
  },

  drawerSize: {
    height:  height * 0.045,

    backgroundColor: "#000000",

    borderRadius: 14,

    paddingHorizontal: width * 0.024,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginRight: width * 0.020,
  },

  drawerFooter: {
    padding: width *0.020,

    borderTopWidth: 1,

    borderColor: "#EEE",
  },

  drawerButton: {
    height:  height * 0.065,

    borderRadius: 30,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",
  },

  drawerButtonText: {
    color: "#FFF",

    fontWeight: "900",

    letterSpacing: 1,

    marginRight: 10,
  },
  bottomSheet: {
    width: "100%",

    maxWidth: width   * 0.920,

    backgroundColor: "#F7F7F5",

    borderRadius: 32,

    paddingHorizontal: 24,

    paddingTop: height   * 0.020,

    paddingBottom: height   * 0.024,

    shadowColor: "#000",

    shadowOpacity: 0.18,

    shadowRadius: 24,

    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 25,
  },
  sheetHandle: {
    width: width   * 0.055,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#D8D8D8",

    alignSelf: "center",

    marginBottom:  height   * 0.020,
  },

  sheetTitle: {
    fontSize:  height   * 0.028,

    fontWeight: "900",

    color: "#111",
  },

  sheetSub: {
    marginTop: 6,

    color: "#777",

    fontSize: 15,

    marginBottom:  height   * 0.024,
  },

  sizeGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  sheetSize: {
    width: "30%",

    height:  height   * 0.060,

    marginBottom:  height   * 0.014,

    borderRadius: 18,

    backgroundColor: "#FFF",

    borderWidth: 1,

    borderColor: "#E8E8E8",

    justifyContent: "center",

    alignItems: "center",
  },

  sheetSizeActive: {
    backgroundColor: "#B6FF2E",

    borderColor: "#B6FF2E",
  },

  sheetSizeText: {
    fontSize:  height   * 0.018,

    fontWeight: "900",

    color: "#111",
  },

  sheetSizeTextActive: {
    color: "#000",
  },

  doneButton: {
    marginTop:  height   * 0.018,

    height:  height   * 0.058,

    borderRadius: 30,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",
  },

  doneText: {
    color: "#FFF",

    fontSize:  height   * 0.017,

    fontWeight: "900",
  },



 
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F5",
  },
  section: {
    marginTop:  height   * 0.024,
    paddingHorizontal: width  * 0.074,
    backgroundColor: "#F7F7F5",
  },
  similarSection: {
    marginTop:  height   * 0.020,
     backgroundColor: "#F7F7F5",
    paddingLeft:  width   * 0.074,
  },

  similarHeader: {
    paddingRight: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  similarHeading: {
    fontSize:  width * 0.074,
    fontWeight: "900",
    color: "#000000",
  },

  viewAll: {
    color: "#B6FF2E",
    fontWeight: "800",
    fontSize:  width * 0.044,
  },

  similarCard: {
    width:  width * 0.640,
    backgroundColor: "#FFF",
    borderColor: "#ECECEC",
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 18,
    borderWidth: 1,

  },

  similarImage: {
    width: "100%",
    height:height * 0.260,
  },

  similarInfo: {
    padding: 18,
  },

  similarTitle: {
    fontSize: height * 0.0260,
    fontWeight: "900",
    color: "#000000",
  },

  similarPrice: {
    marginTop: 10,
    fontSize:  height * 0.0260,
    fontWeight: "900",
    color: "#000000",
  },

  similarBottom: {
    marginTop:  height * 0.018,
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

  bottomBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: height * 0.020,

    height:  height * 0.076,

    borderRadius: 38,

    backgroundColor: "#050505",

    paddingHorizontal:  width * 0.038,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#1F1F1F",

    elevation: 25,

    shadowColor: "#000",

    shadowOpacity: .35,

    shadowRadius: 16,
  },

  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageStack: {
    width:  width * 0.182,
    height: height * 0.046,
    position: "relative",
  },

  stackImage: {
    position: "absolute",

    width:   width * 0.081,
    height:  height * 0.042,

    borderRadius: 21,

    borderWidth: 2,

    borderColor: "#050505",

    backgroundColor: "#FFF",
  },

  itemInfo: {
    marginLeft: 12,
  },

  itemCount: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },


  priceButton: {
    height:  height * 0.056,

    paddingLeft:  width * 0.018,
    paddingRight:  width * 0.012,

    borderRadius: 28,

    backgroundColor: "#000000",


    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  priceText: {
    color: "#FFF",
    fontSize:  width *0.080,
    fontWeight: "900",
  },

  arrowContainer: {
    width: width *0.058,
    height: height * 0.028,

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


  lookSection: {
    marginTop:  height * 0.025,
    paddingHorizontal: 24, backgroundColor: "#F7F7F5",
    position: "relative",
  },

  lookHeading: {
    fontSize:  height * 0.032,
    fontWeight: "900",
    color: "#000000",
  },

  lookSub: {
    color: "#8A8A8A",
    marginTop: 8,
    marginBottom:  height * 0.020,
  },

  lookCard: {
    height: height * 0.470,
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
    width: height * 0.088,
    height: height * 0.088,
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
    left: width  * 0.044,
    bottom:  height * 0.024,
  },

  lookTitle: {
    fontSize:  height * 0.032,
    fontWeight: "900",
    color: "#ffffff",
  },

  lookDesc: {
    marginTop: 8,
    color: "#B6FF2E",
  },

  whySection: {
    marginTop:  height * 0.025,
    paddingHorizontal: 24, backgroundColor: "#F7F7F5",
  },

  whyHeading: {
    fontSize:  height * 0.032,
    fontWeight: "900",
    color: "#000000",
    marginBottom:  height * 0.024,
  },

  whyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  whyCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderColor: "#ECECEC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,

  },

  whyIcon: {
    fontSize:  height * 0.034,
  },

  whyTitle: {
    marginTop:  height * 0.018,
    fontSize:  height * 0.018,
    fontWeight: "900",
    color: "#000000",
  },

  whyDesc: {
    marginTop:  height * 0.010,
    color: "#888",
    lineHeight: 22,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },

  sectionHeading: {
    fontSize:  height * 0.030,
    fontWeight: "900",
    color: "#000000",
  },
  bundlePreviewCard: {
    marginTop:  height * 0.016,
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding:  width * 0.022,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  previewStack: {
    width: width * 0.280,
    height:  height * 0.070,
    position: "relative",
  },

  previewImage: {
    position: "absolute",
    width:  width * 0.122,
    height:  height * 0.062,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#FFF",
  },

  previewContent: {
    flex: 1,
    marginLeft: 10,
  },

  previewTitle: {
    fontSize:  width * 0.060,
    fontWeight: "900",
    color: "#111",
  },

  previewSubtitle: {
    marginTop: 6,
    color: "#777",
    lineHeight: 22,
  },

  previewButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#111",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  previewButtonText: {
    color: "#FFF",
    fontWeight: "800",
    marginRight: 6,
  },

  sectionAction: {
    color: "#B6FF2E",
    fontWeight: "800",
    fontSize: 15,
  },
  sectionCount: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
    color: "#000000",
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



  sizeText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  sizeArrow: {
    color: "#B6FF2E",
    fontSize: 18,
  },

  previewBtn: {
    width: width * 0.262,
    height: height * 0.042,
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
    marginTop: height * 0.026,
    paddingHorizontal: 24,
    backgroundColor: "#F7F7F5",
  },

  savingTitle: {
    fontSize: height * 0.030,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 18,
  },

  savingCard: {
    backgroundColor: "#FFF",
    borderColor: "#ECECEC",
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


  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  bundleTitle: {
    fontSize: width  * 0.096,
    fontWeight: "900",
    color: "#000000",
  },

  bundleDesc: {
    color: "#999",
    fontSize: 15,
    lineHeight: 25,
    marginTop: 5,
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

  priceCard: {
    marginTop: height * 0.032,

    backgroundColor: "#FFF",

    borderRadius: 28,

    padding: width * 0.052,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ECECEC",

    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  priceLeft: {
    flex: 1,
  },


  saveBadge: {
    alignSelf: "flex-start",

    backgroundColor: "#111",

    borderRadius: 20,

    paddingHorizontal: 12,

    paddingVertical: 6,

    marginBottom: 14,
  },

  saveBadgeText: {
    color: "#B6FF2E",

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: 1,
  },

  currentPrice: {
    fontSize:width   * 0.104,

    fontWeight: "900",

    color: "#111",
  },



  divider: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#CCC",

    marginHorizontal: 10,
  },

  taxText: {
    color: "#777",

    fontWeight: "600",
  },

  rightSaving: {
    width: width   * 0.420,

    height: height   * 0.120,

    borderRadius: 24,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",
  },

  youSave: {
    fontSize: 11,

    fontWeight: "800",

    color: "#111",

    letterSpacing: 1,
  },

  saveAmount: {
    marginTop: 6,

    fontSize: width  * 0.068,

    fontWeight: "900",

    color: "#111",
  },

  greenLine: {
    width:  width  * 0.080,

    height: 1,

    backgroundColor: "rgba(0,0,0,.2)",

    marginVertical: 10,
  },

  bundleOffer: {
    fontWeight: "700",

    color: "#111",

    fontSize: 12,
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
  topBar: {
    position: "absolute",
    top: height   * 0.038,
    left: 20,
    right: 20,

    flexDirection: "row",
    justifyContent: "space-between",

    zIndex: 999,
  },

  leftAction: {
    width: width * 0.12,
    height: height * 0.06,
    justifyContent: "flex-start",
  },

  rightActions: {
    width: width * 0.12,
    alignItems: "center",
  },

  heartWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    marginTop: 12,
    backgroundColor: "#B6FF2E",
    borderRadius: width * 0.03,
    width: width * 0.12,
    height: height * 0.05,
  },

  topBtnWrapper: {
    marginLeft: 0,
  },

  blurButton: {
    width: width * 0.12,
    height: height * 0.06,
    borderRadius: width * 0.03,

    overflow: "hidden",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,.15)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,.35)",
  },

  wishlistButton: {
    backgroundColor: "#B6FF2E",
    marginTop: 10,
    marginLeft: 0,
  },


  featureContainer: {
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  feature: {
    width: "31%", backgroundColor: "#FFF",
    borderColor: "#ECECEC",
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: "center",
    borderWidth: 1,

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



  thumbContainer: {
    position: "absolute",
    left: 18,
    top: 140,
  },

  thumbCard: {
    width: width * 0.162,
    height: height * 0.082,
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
    bottom: 46,
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
    bottom: 46,
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