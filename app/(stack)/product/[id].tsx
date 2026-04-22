import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import RenderHTML from "react-native-render-html";
import Screen from "@/components/Screen";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import api from "@/utils/config";
import CartIcon from "@/components/CartIcon";
const { width, height } = Dimensions.get("window");
import Toast from "react-native-toast-message";
const IMAGE_WIDTH = width * 0.92;
const IMAGE_HEIGHT = Math.min(height * 0.45, 420); // ✅ responsive cap
import { runOnJS } from "react-native-reanimated";
export default function ProductScreen() {
  const router = useRouter();
  const { id, image, x, y, w, h } = useLocalSearchParams<any>();

  const { add } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlist();
  const [related, setRelated] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const relatedRefs = useRef<{ [key: string]: View | null }>({});


  const imageRef = useRef<FlatList>(null);


  const startX = x !== undefined ? Number(x) : width / 2; const startY = y !== undefined ? Number(y) : height / 2; const startW = w !== undefined ? Number(w) : 120; const startH = h !== undefined ? Number(h) : 120; const animX = useSharedValue(startX); const animY = useSharedValue(startY); const animW = useSharedValue(startW); const animH = useSharedValue(startH);
  const animRadius = useSharedValue(12);
  const heroStyle = useAnimatedStyle(() => ({
    position: "absolute", left: animX.value, top: animY.value, width: animW.value, height: animH.value, borderRadius: animRadius.value, overflow: "hidden", zIndex: 10,
  }))

  useEffect(() => {
    if (image) Image.prefetch(image);
  }, [image]);
  useEffect(() => {

    if (!product) return;

    // 🔥 FIX CURRENT CATEGORY
    const currentCat =
      typeof product.category === "string"
        ? product.category
        : product.category?._id;


    if (!currentCat) return;

    (async () => {
      try {
        const res = await api.get("/api/products");

        const items = res.data.items || [];

        const relatedProducts = items.filter((p: any) => {
          const itemCat =
            typeof p.category === "string"
              ? p.category
              : p.category?._id;



          return (
            p._id !== product._id &&
            currentCat === itemCat
          );
        });


        setRelated(relatedProducts.slice(0, 8));

      } catch (err) {
        console.log("Related error", err);
      }
    })();
  }, [product]);
  const uiOpacity = useSharedValue(0);
  const uiTranslate = useSharedValue(30);
  const uiStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
    transform: [{ translateY: uiTranslate.value }],
  }));

  useEffect(() => {
    const D = 600;

    requestAnimationFrame(() => {
      animX.value = withTiming((width - IMAGE_WIDTH) / 2, {
        duration: D,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });

      animY.value = withTiming(90, {
        duration: D,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });

      animW.value = withTiming(IMAGE_WIDTH, {
        duration: D,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });

      animH.value = withTiming(
        IMAGE_HEIGHT,
        { duration: D },
        () => {
          animX.value = (width - IMAGE_WIDTH) / 2;
          animY.value = 90;


        }
      );
      animRadius.value = withTiming(22, { duration: D });

      uiOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
      uiTranslate.value = withDelay(300, withTiming(0, { duration: 300 }));
    });
  }, []);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
    })();
  }, [id]);



  if (!product) {
    return (
      <Screen style={{ backgroundColor: "#f4f4f4" }}>

        <Animated.View style={[styles.imageWrapper, heroStyle]}>
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </Animated.View>
      </Screen>
    );
  }

  const images = product?.images?.length ? product.images : [image];
  const sizes = product?.inventory ? Object.keys(product.inventory) : [];



  if (x === undefined || y === undefined || w === undefined || h === undefined) {
    return (
      <Screen style={{ backgroundColor: "#f4f4f4" }}>
        <View />
      </Screen>
    );
  }
  return (
    <Screen style={{ backgroundColor: "#f4f4f4" }}>

      <Animated.View
        style={[styles.imageWrapper, heroStyle]}
      >

        <FlatList
          ref={imageRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, index) => ({
            length: IMAGE_WIDTH,
            offset: IMAGE_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / IMAGE_WIDTH
            );
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
              }}
              resizeMode="cover"
            />
          )}
        />
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/product/viewer",
              params: {
                images: JSON.stringify(images),
                index: activeIndex,
              },
            });
          }}
          style={styles.zoomBtn}
        >
          <Ionicons name="expand-outline" size={18} color="#000" />
        </Pressable>
      </Animated.View>
      {/* ================= TOP BAR ================= */}
      {/* ================= TOP OVERLAY BAR ================= */}
      <Animated.View style={[styles.topOverlay, uiStyle]}>
        {/* Back */}
        <Pressable style={styles.circleBtn} onPress={router.back}>
          <Ionicons name="arrow-back" size={20} />
        </Pressable>

        {/* Right actions */}
        <View style={styles.topRight}>
          <CartIcon />

          <Pressable
            style={styles.circleBtn}
            onPress={() =>
              isInWishlist(product._id)
                ? removeFromWishlist(product._id)
                : addToWishlist(product._id)
            }
          >
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist(product._id) ? "#c00000" : "#000"}
            />
          </Pressable>
        </View>
      </Animated.View>


      {/* ================= CONTENT ================= */}
 <View style={styles.contentContainer}>
  <View style={{paddingHorizontal: 5,paddingVertical: 20, backgroundColor: "#fff", borderRadius: 28, elevation: 2}}>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 2 }}
  >

        <Animated.View style={[styles.card, uiStyle]} pointerEvents="box-none">
          {/* THUMBNAILS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbRow}
          >
            {images.map((img: string, index: number) => (
              <Pressable
                key={index}
                onPress={() => {
                  setActiveIndex(index);
                  imageRef.current?.scrollToIndex({
                    index,
                    animated: true,
                  });
                }}
                style={[
                  styles.thumb,
                  activeIndex === index && styles.thumbActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </Pressable>
            ))}
          </ScrollView>

          {/* TITLE */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.category}>Outerwear Men</Text>
            </View>
            <Text style={styles.price}>₹{product.price}</Text>
          </View>

          {/* SIZES */}
          <View style={styles.sizeHeader}>
            <Text style={styles.sizeTitle}>Select Size</Text>
            <Text style={styles.sizeChart}>Size Chart</Text>
          </View>

          <View style={styles.sizes}>
            {sizes.map((size) => {
              const disabled = product.inventory[size] <= 0;
              return (
                <Pressable
                  key={size}
                  disabled={disabled}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizePill,
                    selectedSize === size && styles.sizeActive,
                    disabled && styles.sizeDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && { color: "#fff" },
                      disabled && styles.sizeTextDisabled,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* DESCRIPTION */}
          <RenderHTML
            contentWidth={width}
            source={{ html: product.description }}
          />
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>You may also like</Text>

            <FlatList
              data={related}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  ref={(r) => {
                    relatedRefs.current[item._id] = r;
                  }}
                  onPress={() => {
                    const currentRef = relatedRefs.current[item._id];

                    currentRef?.measureInWindow((x, y, w, h) => {
                      router.push({
                        pathname: "/product/[id]",
                        params: {
                          id: item._id,
                          image: item.images?.[0],
                          x,
                          y,
                          w,
                          h,
                        },
                      });
                    });
                  }}
                  style={styles.relatedCard}
                >
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={styles.relatedImage}
                  />

                  <Text numberOfLines={1} style={styles.relatedTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.relatedPrice}>₹{item.price}</Text>
                </Pressable>
              )}
            />
          </View>
        </Animated.View>
        {/* 🔥 RELATED PRODUCTS */}

      </ScrollView>
      </View>
</View>
      {/* ================= BOTTOM BAR ================= */}
      <Animated.View style={[styles.bottomBar, uiStyle]}>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={20} />
        </Pressable>

        <Pressable
          style={styles.cartBtn}
          onPress={() => {
            console.log("ADD TO CART OK", selectedSize);
            if (!selectedSize) {
              Toast.show({ type: "error", text1: "Please select a size" });
              return;
            }
            add(product._id, selectedSize);
          }}
        >
          <Text style={styles.cartText}>Add To Cart</Text>
        </Pressable>
      </Animated.View>


    </Screen>
  );
}
/* ================= STYLES ================= */

const styles = StyleSheet.create({

sectionTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 10,
},

relatedCard: {
  width: 140,
  marginRight: 12,
},

relatedImage: {
  width: "100%",
  height: 180,
  borderRadius: 16,
  backgroundColor: "#eee",
},

relatedTitle: {
  fontSize: 13,
  marginTop: 6,
  fontWeight: "500",
},

relatedPrice: {
  fontSize: 14,
  fontWeight: "700",
  marginTop: 2,
},


fullscreenImage: {
  width: "100%",
  height: "100%",
  resizeMode: "contain",
},

topOverlay: {
  position: "absolute",
  top: 42,              // safe for status bar
  left: 16,
  right: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 20,           // 🔥 ABOVE HERO
  elevation: 20,        // 🔥 ANDROID FIX
},
topRight: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},


  imageWrapper: {
    backgroundColor: "#eee",
  },
  bigImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  dots: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    width: 14,
    backgroundColor: "#34C759",
  },
  topBar: {
    position: "absolute",
    top: 42,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 99,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },


  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  borderBottomLeftRadius: 28,
  borderBottomRightRadius: 28,
    padding: 20,
    zIndex: 2,
     elevation: 1,
     paddingBottom: 100,
     paddingTop: 20,
  },
  thumbRow: {
    marginBottom: 16,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eee",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbActive: {
    borderWidth: 2,
    borderColor: "#34C759",
  },
  thumbImg: {
    width: "80%",
    height: "80%",
    borderRadius: 28,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
  },
  category: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  sizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  sizeTitle: {
    fontWeight: "600",
  },
  zoomBtn: {
  position: "absolute",
  bottom: 12,
  right: 12,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
},
  sizeChart: {
    color: "#34C759",
    fontWeight: "600",
  },
  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 12,
  },
  contentContainer: {
  position: "absolute",
  bottom: 0,
  left: width * 0.04,
  right: width * 0.04,
  justifyContent: "center",
  alignItems: "center",
  width: width * 0.92,
  height: height * 0.45, 
  borderRadius: 28,
},
  sizePill: {
    width: 62,
    height: 62,
    borderRadius: 99,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeActive: {
    backgroundColor: "#000",
  },
  sizeDisabled: {
    opacity: 0.4,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sizeTextDisabled: {
    color: "#999",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: width,
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 12,
    zIndex: 4,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  cartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
