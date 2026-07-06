  // src/screens/CartScreen.tsx
import React, { useState } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
  import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
    useColorScheme,
   
  } from "react-native";
  import { Ionicons } from "@expo/vector-icons";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { Swipeable } from "react-native-gesture-handler";
  import { useRouter } from "expo-router";

  import { useCart } from "@/context/CartContext";
  import { useAuth } from "@/context/AuthContext";

  const { width, height } = Dimensions.get("window");
  const SUMMARY_HEIGHT = height * 0.35;

  export default function CartScreen() {
    const { user } = useAuth();
    const { items, update, remove } = useCart();
    const router = useRouter();
    const theme = useColorScheme();
    const isDark = theme === "dark";
    const [coupon, setCoupon] = useState("");
const [expandedBundle, setExpandedBundle] =
  useState<string | null>(null);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true
  );
}
    /* ---------- TOTALS ---------- */
const subtotal = items.reduce((s, it) => {

  const price =
    it.product?.price ??
    it.bundle?.price ??
    it.customBundle?.price ??
    0;

  return s + price * it.quantity;

}, 0);

    // const tax = subtotal * 0.05;
    const deliveryFee = subtotal > 1000 ? 0 : 100;
    const discount = 0;
    const total = subtotal + deliveryFee - discount;
    // const total = subtotal + tax + deliveryFee - discount;

    /* ---------- EMPTY CART ---------- */
    if (items.length === 0) {
      return (
        <SafeAreaView style={styles.emptyRoot}>
          <Ionicons name="bag-outline" size={90} color="#111" />
          <Text style={styles.emptyTitle}>YOUR BAG IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven’t added anything yet.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/")}
          >
            <Text style={styles.shopBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    /* ---------- DELETE BACKGROUND ---------- */
  const renderDelete = (item: any) => {

    const isBundle = !!item.bundle;
    const isCustomBundle = !!item.customBundle;

    const itemId =
      item.product?._id ??
      item.bundle?._id ??
      item.customBundle?._id;

      const isExpanded =
  expandedBundle === itemId;

    return (
      <TouchableOpacity
        style={styles.deleteBox}
        onPress={() =>
          remove(
            itemId,
            isBundle || isCustomBundle
              ? undefined
              : item.size,
            isBundle || isCustomBundle
          )
        }
      >
        <Ionicons
          name="trash-outline"
          size={26}
          color="#fff"
        />
      </TouchableOpacity>
    );
  };

    return (
   <SafeAreaView
  style={styles.root}
>

<View
  style={styles.header}
>

  <View>

    <Text
      style={styles.smallLabel}
    >
      YOUR BAG
    </Text>

    <Text
      style={styles.headerTitle}
    >
      Shopping Cart
    </Text>

  </View>

  <View
    style={styles.headerRight}
  >

    <TouchableOpacity
      style={styles.iconButton}
      onPress={() =>
        router.back()
      }
    >

      <Ionicons
        name="chevron-back"
        size={22}
        color="#111"
      />

    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.itemCount,
        {
          backgroundColor:
            "#B6FF2E",
        },
      ]}
    >

      <Text
        style={
          styles.itemCountText
        }
      >

        {items.length}

      </Text>

    </TouchableOpacity>

  </View>

</View>

<View
  style={styles.divider}
/>


        {/* ITEMS */}
        <ScrollView style={styles.itemsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.itemsContainer}>
       {items.map((it) => {

  const itemId =
    it.product?._id ??
    it.bundle?._id ??
    it.customBundle?._id;

  const isBundle =
    !!it.bundle ||
    !!it.customBundle;

  const isExpanded =
    expandedBundle === itemId;

  return (

    <Swipeable
      key={it._id}
      renderRightActions={() =>
        renderDelete(it)
      }
    >

      <View>

        {/* CARD */}

        <View style={styles.cartCard}>

          <Image
            source={{
              uri:
                it.mainImage ??
                it.product?.images?.[0] ??
                it.bundleProducts?.[0]?.product?.images?.[0],
            }}
            style={styles.productImage}
          />

          <View style={styles.productInfo}>

            {/* TITLE */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >

              <Text
                numberOfLines={2}
                style={[
                  styles.productName,
                  { flex: 1 },
                ]}
              >

                {it.customBundle?.title ||
                  it.bundle?.title ||
                  it.product?.title}

              </Text>

              {isBundle && (

                <TouchableOpacity
                  onPress={() => {

                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );

                    setExpandedBundle(
                      isExpanded
                        ? null
                        : itemId
                    );

                  }}
                >

                  <Ionicons
                    name={
                      isExpanded
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={22}
                    color="#111"
                  />

                </TouchableOpacity>

              )}

            </View>

            {/* SIZE */}

            <Text style={styles.productMeta}>

              Size {it.size || "OS"}

            </Text>

            {/* PRICE */}

            <Text style={styles.productPrice}>

              ₹
              {(
                it.customBundle?.price ??
                it.bundle?.price ??
                it.product?.price ??
                0
              ).toLocaleString()}

            </Text>

          </View>

          {/* RIGHT SIDE */}

          <View style={styles.rightSide}>

            <TouchableOpacity
              onPress={() =>
                remove(
                  itemId,
                  it.size,
                  isBundle
                )
              }
            >

              <Ionicons
                name="trash-outline"
                size={21}
                color="#999"
              />

            </TouchableOpacity>

            <View style={styles.qtyBox}>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  update(
                    itemId,
                    it.quantity - 1,
                    it.size,
                    isBundle
                  )
                }
              >

                <Ionicons
                  name="remove"
                  size={16}
                  color="#111"
                />

              </TouchableOpacity>

              <Text style={styles.qty}>
                {it.quantity}
              </Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  update(
                    itemId,
                    it.quantity + 1,
                    it.size,
                    isBundle
                  )
                }
              >

                <Ionicons
                  name="add"
                  size={16}
                  color="#111"
                />

              </TouchableOpacity>

            </View>

          </View>

        </View>

        {/* BUNDLE DRAWER */}

        {isBundle &&
          isExpanded &&
          it.bundleProducts && (

            <View style={styles.bundleDrawer}>

              <Text style={styles.bundleTitle}>
                Included Products
              </Text>

              <View style={styles.stackRow}>

                {it.bundleProducts
                  .slice(0, 3)
                  .map(
                    (
                      p: any,
                      i: number
                    ) => (

                      <Image
                        key={i}
                        source={{
                          uri:
                            p.product?.images?.[0],
                        }}
                        style={[
                          styles.stackImage,
                          {
                            marginLeft:
                              i === 0
                                ? 0
                                : -18,
                          },
                        ]}
                      />

                    )
                  )}

              </View>

              {it.bundleProducts.map(
                (p: any) => (

                  <View
                    key={p.product._id}
                    style={styles.bundleItem}
                  >

                    <Text
                      style={
                        styles.bundleItemName
                      }
                    >
                      {p.product.title}
                    </Text>

                    <Text
                      style={
                        styles.bundleItemSize
                      }
                    >
                      {p.size}
                    </Text>

                  </View>

                )
              )}

              <View style={styles.saveBadge}>

                <Text style={styles.saveText}>
                  YOU SAVED ₹1200
                </Text>

              </View>

            </View>

          )}

      </View>

    </Swipeable>

  );

})}
          </View>
        </ScrollView>

        {/* SUMMARY */}
     <View style={styles.checkoutContainer}>

  <View style={styles.summaryCard}>

    <View style={styles.summaryRow}>

      <Text style={styles.summaryLabel}>
        Subtotal
      </Text>

      <Text style={styles.summaryValue}>
        ₹{subtotal.toLocaleString()}
      </Text>

    </View>

    <View style={styles.summaryRow}>

      <Text style={styles.summaryLabel}>
        Shipping
      </Text>

      <Text style={styles.freeText}>
        FREE
      </Text>

    </View>

    <View style={styles.summaryDivider} />

    <View style={styles.summaryRow}>

      <Text style={styles.totalLabel}>
        Total
      </Text>

      <Text style={styles.totalValue}>
        ₹{subtotal.toLocaleString()}
      </Text>

    </View>

  </View>

  <TouchableOpacity
    style={styles.checkoutButton}
    onPress={() =>
      router.push("/checkout")
    }
  >

    <Text style={styles.checkoutText}>
      PROCEED TO CHECKOUT
    </Text>

    <Ionicons
      name="arrow-forward"
      size={20}
      color="#111"
    />

  </TouchableOpacity>

</View>
      </SafeAreaView>
    );
  }

  /* ---------- SUMMARY ROW ---------- */
  const SummaryRow = ({
    label,
    value,
    bold,
  }: {
    label: string;
    value: string;
    bold?: boolean;
  }) => (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryText, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryText, bold && styles.bold]}>{value}</Text>
    </View>
  );

  /* ---------- STYLES ---------- */
  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#FFFFFF" },

header:{

  paddingHorizontal:24,

  paddingTop:18,

  paddingBottom:22,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

},

smallLabel:{

  color:"#999",

  fontSize:11,

  letterSpacing:2,

  fontWeight:"800",

},

headerTitle:{

  marginTop:6,

  color:"#111",

  fontSize:34,

  fontWeight:"900",

  letterSpacing:.4,

},

headerRight:{

  flexDirection:"row",

  alignItems:"center",

},

iconButton:{

  width:52,

  height:52,

  borderRadius:18,

  backgroundColor:"#F7F7F7",

  justifyContent:"center",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#ECECEC",

},

itemCount:{

  width:46,

  height:46,

  borderRadius:23,

  marginLeft:14,

  justifyContent:"center",

  alignItems:"center",

},

itemCountText:{

  color:"#111",

  fontSize:16,

  fontWeight:"900",

},

divider:{

  height:1,

  backgroundColor:"#F1F1F1",

  marginHorizontal:24,

},
cartCard:{

  flexDirection:"row",

  padding:18,

  marginHorizontal:20,

  marginBottom:18,

  backgroundColor:"#FFF",

  borderRadius:24,

  borderWidth:1,

  borderColor:"#EFEFEF",

},

productImage:{

  width:112,

  height:142,

  borderRadius:18,

  backgroundColor:"#F5F5F5",

},

productInfo:{

  flex:1,

  marginLeft:18,

  justifyContent:"space-between",

},

productName:{

  fontSize:18,

  color:"#111",

  fontWeight:"900",

  lineHeight:24,

},

productMeta:{

  marginTop:8,

  color:"#888",

  fontSize:13,

  letterSpacing:.5,

},

productPrice:{

  marginTop:14,

  fontSize:24,

  fontWeight:"900",

  color:"#111",

},

rightSide:{

  justifyContent:"space-between",

  alignItems:"flex-end",

},

qtyBox:{

  backgroundColor:"#B6FF2E",

  borderRadius:16,

  paddingVertical:6,

  paddingHorizontal:8,

  alignItems:"center",

},

qtyBtn:{

  width:32,

  height:32,

  justifyContent:"center",

  alignItems:"center",

},

qty:{

  fontSize:17,

  fontWeight:"900",

  color:"#111",

  marginVertical:4,

},
    /* Items */
    itemsScroll: { flex: 1 },
    itemsContainer: { padding: 16, paddingBottom: 20 },

    itemCard: {
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 12,
      marginBottom: 14,
      elevation: 3,
    },
    itemImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: "#eee",
    },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemHeader: { marginBottom: 4 },
    itemTitle: { fontWeight: "700", fontSize: 15, maxWidth: width - 160 },
    variant: { fontSize: 12, color: "#666" },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
    },
    price: { fontWeight: "700", fontSize: 15 },

    /* Qty */
    qtyControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f2f2f2",
      borderRadius: 18,
      paddingHorizontal: 6,
      height: 36,
    },

    qtyAdd: { backgroundColor: "#7CFC6A" },
    qtyBtnText: {
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 18,
    },
    qtyValue: {
      width: 26,
      textAlign: "center",
      fontWeight: "600",
    },

    /* Delete */
    deleteBox: {
      width: 80,
      backgroundColor: "#dc2626",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      // marginVertical: 8,
      marginBottom: height * 0.02,
      marginLeft: width * 0.02,
    },

    /* Summary */
    summaryContainer: {
      height: SUMMARY_HEIGHT,
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      elevation: 10,
    },
    summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

    summaryText: { fontSize: 14 },
    bold: { fontWeight: "700" },

    /* Coupon */
    couponRow: {
      flexDirection: "row",
      backgroundColor: "#f5f5f5",
      borderRadius: 12,
      padding: 6,
      marginTop: 14,
    },
    couponInput: { flex: 1, paddingHorizontal: 10 },
    applyBtn: {
      backgroundColor: "#fff",
      borderRadius: 10,
      paddingHorizontal: 14,
      justifyContent: "center",
    },

    /* Checkout */
    checkoutBtn: {
      backgroundColor: "#7CFC6A",
      paddingVertical: 16,
      borderRadius: 30,
      marginTop: 20,
    },

    /* Empty */
    emptyRoot: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 12 },
    emptySubtitle: {
      textAlign: "center",
      color: "#666",
      marginVertical: 12,
    },
    shopBtn: {
      backgroundColor: "#111",
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 30,
      marginTop: 10,
    },
    shopBtnText: { color: "#fff", fontWeight: "600" },
    checkoutContainer:{

  position:"absolute",

  left:0,

  right:0,

  bottom:0,

  paddingHorizontal:22,

  paddingTop:20,

  paddingBottom:34,

  backgroundColor:"#FFF",

  borderTopLeftRadius:34,

  borderTopRightRadius:34,

  borderTopWidth:1,

  borderColor:"#ECECEC",

},

summaryCard:{

  backgroundColor:"#FAFAFA",

  borderRadius:22,

  padding:20,

  borderWidth:1,

  borderColor:"#EFEFEF",

},

summaryRow:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  marginBottom:14,

},

summaryLabel:{

  color:"#777",

  fontSize:14,

},

summaryValue:{

  color:"#111",

  fontWeight:"700",

  fontSize:15,

},

freeText:{

  color:"#4CAF50",

  fontWeight:"900",

  fontSize:15,

},

summaryDivider:{

  height:1,

  backgroundColor:"#ECECEC",

  marginVertical:6,

},

totalLabel:{

  fontSize:18,

  color:"#111",

  fontWeight:"900",

},

totalValue:{

  fontSize:26,

  color:"#111",

  fontWeight:"900",

},

checkoutButton:{

  marginTop:20,

  height:62,

  borderRadius:18,

  backgroundColor:"#B6FF2E",

  flexDirection:"row",

  justifyContent:"center",

  alignItems:"center",

},

checkoutText:{

  color:"#111",

  fontWeight:"900",

  fontSize:15,

  letterSpacing:.8,

  marginRight:10,

},
bundleDrawer: {

  marginHorizontal: 20,

  marginTop: -8,

  marginBottom: 18,

  padding: 18,

  borderBottomLeftRadius: 24,

  borderBottomRightRadius: 24,

  backgroundColor: "#FAFAFA",

  borderWidth: 1,

  borderTopWidth: 0,

  borderColor: "#EFEFEF",

},

bundleTitle: {

  fontSize: 12,

  fontWeight: "900",

  letterSpacing: 1.2,

  color: "#999",

  marginBottom: 16,

},

stackRow: {

  flexDirection: "row",

  alignItems: "center",

  marginBottom: 20,

},

stackImage: {

  width: 44,

  height: 44,

  borderRadius: 22,

  borderWidth: 2,

  borderColor: "#FFF",

  backgroundColor: "#F5F5F5",

},

moreCircle: {

  width: 44,

  height: 44,

  borderRadius: 22,

  backgroundColor: "#111",

  justifyContent: "center",

  alignItems: "center",

  marginLeft: -18,

},

moreText: {

  color: "#FFF",

  fontWeight: "900",

  fontSize: 12,

},

bundleItem: {

  flexDirection: "row",

  justifyContent: "space-between",

  alignItems: "center",

  paddingVertical: 12,

  borderBottomWidth: 1,

  borderBottomColor: "#ECECEC",

},

bundleItemName: {

  flex: 1,

  fontSize: 15,

  color: "#111",

  fontWeight: "700",

},

bundleItemSize: {

  color: "#888",

  fontSize: 13,

  fontWeight: "600",

},

saveBadge: {

  alignSelf: "flex-start",

  marginTop: 18,

  backgroundColor: "#B6FF2E",

  borderRadius: 14,

  paddingHorizontal: 14,

  paddingVertical: 8,

},

saveText: {

  color: "#111",

  fontWeight: "900",

  fontSize: 12,

  letterSpacing: .8,

},
  });
