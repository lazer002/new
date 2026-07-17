import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import  Screen  from "@/components/Screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

const H_PADDING = width * 0.055;

const CARD_RADIUS = 24;

const HERO_HEIGHT = height * 0.19;

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "dispatched",
  "shipped",
  "out for delivery",
  "delivered",
  "return requested",
  "return approved",
  "returned",
  "refunded",
  "exchange requested",
  "exchange approved",
  "exchange processing",
  "exchanged",
  "repair requested",
  "repair approved",
  "repair processing",
  "repaired",
  "service requested",
  "cancelled",
];

const NORMAL_DELIVERY_STEPS = [
  "pending",
  "confirmed",
  "dispatched",
  "shipped",
  "out for delivery",
  "delivered",
];

const RETURN_STEPS = [
  "delivered",
  "return requested",
  "return approved",
  "returned",
  "refunded",
];

const EXCHANGE_STEPS = [
  "delivered",
  "exchange requested",
  "exchange approved",
  "exchange processing",
  "exchanged",
];

const REPAIR_STEPS = [
  "delivered",
  "repair requested",
  "repair approved",
  "repair processing",
  "repaired",
];



/* ---------- TYPES ---------- */

type Order = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
paymentStatus: "pending" | "paid" | "failed";
shippingFee: number;
discountCode?: string;
couponDiscount?: number;
  shippingAddress?: {
    name: string;
    address: string;
    phone: string;
  };
};

/* ---------- COMPONENT ---------- */

export default function TrackOrderPage() {
  const params = useLocalSearchParams<{ orderNumber?: string }>();
  const { guestId,user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState(
    params.orderNumber || ""
  );

  /* ---------- FETCH ---------- */

  const fetchOrder = async (orderNum?: string) => {
    if (!orderNum) return;

    try {
      setLoading(true);



      const res = await api.get(
        `/api/orders/track?orderNumber=${orderNum}`,
        {
          headers: {
            "x-guest-id": guestId || "",
          },
        }
      );

      setOrder(res.data.order);
    } catch (err: any) {
      Alert.alert("Error", "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- AUTO FETCH ---------- */

  useFocusEffect(
    useCallback(() => {
      if (params.orderNumber) {
        fetchOrder(params.orderNumber);
      }
    }, [params.orderNumber])
  );

  /* ---------- SEARCH MODE ---------- */



const getStatusSteps = (status?: string) => {
  const value = status?.toLowerCase() || "";

  if (value.startsWith("return") || value === "returned" || value === "refunded") {
    return RETURN_STEPS;
  }

  if (value.startsWith("exchange") || value === "exchanged") {
    return EXCHANGE_STEPS;
  }

  if (value.startsWith("repair") || value === "repaired") {
    return REPAIR_STEPS;
  }

  return NORMAL_DELIVERY_STEPS;
};
const activeStatusSteps = getStatusSteps(order?.orderStatus);

const currentIndex = activeStatusSteps.indexOf(
  order?.orderStatus?.toLowerCase() ?? ""
);

if (!params.orderNumber && !order) {
  return (
    <Screen>
<View style={styles.header}>

  <TouchableOpacity
    style={styles.headerButton}
    onPress={() => router.back()}
    activeOpacity={0.8}
  >

    <Ionicons
      name="chevron-back"
      size={22}
      color="#111"
    />

  </TouchableOpacity>

  <TouchableOpacity
    style={styles.headerButton}
    activeOpacity={0.8}
    onPress={() => {
      () => router.push("/cart")
    }}
  >

    <Ionicons
      name="bag-handle-outline"
      size={20}
      color="#111"
    />

  </TouchableOpacity>

</View>
      <View style={styles.searchHero}>

        <View style={styles.searchIconCircle}>

          <Ionicons
            name="cube-outline"
            size={42}
            color="#111"
          />

        </View>

        <Text style={styles.searchTitle}>
          Track{"\n"}Your Order
        </Text>

        <Text style={styles.searchSubtitle}>
          Enter your order number to check the latest delivery status,
          shipping progress and payment details.
        </Text>

      </View>

      <View style={styles.searchCard}>

        <Text style={styles.inputLabel}>
          ORDER NUMBER
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="receipt-outline"
            size={20}
            color="#777"
          />

          <TextInput
            placeholder="DD-2026-0001"
            placeholderTextColor="#AAA"
            value={searchOrderNumber}
            onChangeText={setSearchOrderNumber}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
          />

        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.trackButton}
          onPress={() =>
            fetchOrder(searchOrderNumber)
          }
        >

          <Text
            style={styles.trackButtonText}
          >

            TRACK ORDER

          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#111"
          />

        </TouchableOpacity>

      </View>

    </Screen>
  );
}

  /* ---------- LOADING ---------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  /* ---------- EMPTY ---------- */


  

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }


const statusColor = () => {
  switch (order?.orderStatus) {
    case "delivered":
      return "#111";

    case "cancelled":
      return "#EF4444";

    default:
      return "#B6FF2E";
  }
};

const statusTextColor = () => {
  switch (order?.orderStatus) {
    case "delivered":
      return "#FFF";

    case "cancelled":
      return "#FFF";

    default:
      return "#111";
  }
};
return (
  <Screen>
            <View style={styles.header}>

  <TouchableOpacity
    style={styles.headerButton}
    onPress={() => router.back()}
    activeOpacity={0.8}
  >

    <Ionicons
      name="chevron-back"
      size={22}
      color="#111"
    />

  </TouchableOpacity>

  <TouchableOpacity
    style={styles.headerButton}
    activeOpacity={0.8}
    onPress={() => {
      // TODO:
      // Open invoice
      // or
      // Order Details
    }}
  >

    <Ionicons
      name="receipt-outline"
      size={20}
      color="#111"
    />

  </TouchableOpacity>

</View>
    <ScrollView
  
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      
{/* ================= HERO ================= */}

<View style={styles.hero}>

  <View style={styles.heroTop}>

    <View
      style={styles.orderChip}
    >

      <Ionicons
        name="cube-outline"
        size={15}
        color="#111"
      />

      <Text
        style={styles.orderChipText}
      >

        ORDER

      </Text>

    </View>

    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            statusColor(),
        },
      ]}
    >

      <Text
        style={[
          styles.statusText,
          {
            color:
              statusTextColor(),
          },
        ]}
      >

        {order?.orderStatus}

      </Text>

    </View>

  </View>

  <Text
    style={styles.heroTitle}
  >

    Track Your{"\n"}Order

  </Text>

  <Text
    style={styles.heroSubtitle}
  >

    Order #{order?.orderNumber}

  </Text>

  <View
    style={styles.heroBottom}
  >

    <View>

      <Text
        style={styles.heroSmall}
      >

        TOTAL AMOUNT

      </Text>

      <Text
        style={styles.heroPrice}
      >

        ₹{order?.total}

      </Text>

    </View>

    <View
      style={styles.heroDivider}
    />

    <View>

      <Text
        style={styles.heroSmall}
      >

        ITEMS

      </Text>

      <Text
        style={styles.heroValue}
      >

        {order?.items?.length}

      </Text>

    </View>

    <View
      style={styles.heroDivider}
    />

    <View>

      <Text
        style={styles.heroSmall}
      >

        PAYMENT

      </Text>

      <Text
        style={styles.heroValue}
      >

        {order?.paymentMethod?.toUpperCase()}

      </Text>

    </View>

  </View>

</View>

{/* ================= TRACK TIMELINE ================= */}

<Text style={styles.sectionTitle}>
  TRACKING
</Text>

<View style={styles.timelineCard}>
  {activeStatusSteps.map((step, index) => {
    const completed = index < currentIndex;
    const active = index === currentIndex;

    return (
      <View key={step} style={styles.timelineRow}>
        <View style={styles.timelineLeft}>
          <View
            style={[
              styles.timelineDot,
              completed && styles.timelineDotDone,
              active && styles.timelineDotCurrent,
            ]}
          >
            {completed && (
              <Ionicons
                name="checkmark"
                size={13}
                color="#111"
              />
            )}

            {active && (
              <View style={styles.timelinePulse} />
            )}
          </View>

          {index !== activeStatusSteps.length - 1 && (
            <View
              style={[
                styles.timelineLine,
                index < currentIndex
                  ? styles.timelineLineDone
                  : styles.timelineLinePending,
              ]}
            />
          )}
        </View>

        <View style={styles.timelineContent}>
          <Text
            style={[
              styles.timelineTitle,
              active && styles.timelineTitleActive,
              completed && styles.timelineTitleDone,
            ]}
          >
            {step}
          </Text>

          <Text style={styles.timelineSubtitle}>
            {completed
              ? "Completed"
              : active
              ? "Currently in progress"
              : "Waiting"}
          </Text>
        </View>
      </View>
    );
  })}
</View>

      {/* ITEMS */}
{/* ================= PRODUCTS ================= */}

<Text style={styles.sectionTitle}>
  ORDER ITEMS
</Text>

<View
  style={styles.productsCard}
>

  {order.items.map(
    (item: any, index: number) => {

      const isBundle =
        item.customBundle ||
        !!item.bundleId;

      return (

        <View
          key={index}
          style={styles.productCard}
        >

          <Image
            source={{
              uri:
                item?.mainImage,
            }}
            style={
              styles.productImage
            }
          />

          <View
            style={
              styles.productContent
            }
          >

            {/* TITLE */}

            <View
              style={
                styles.productTop
              }
            >

              <Text
                numberOfLines={2}
                style={
                  styles.productTitle
                }
              >

                {item.title}

              </Text>

              {isBundle && (

                <View
                  style={
                    styles.bundleBadge
                  }
                >

                  <Text
                    style={
                      styles.bundleBadgeText
                    }
                  >

                    {item.customBundle
                      ? "CUSTOM"
                      : "BUNDLE"}

                  </Text>

                </View>

              )}

            </View>

            {/* META */}

            <View
              style={
                styles.productMeta
              }
            >

              {!isBundle && (

                <View
                  style={
                    styles.metaChip
                  }
                >

                  <Text
                    style={
                      styles.metaChipText
                    }
                  >

                    Size {item.variant}

                  </Text>

                </View>

              )}

              <View
                style={
                  styles.metaChip
                }
              >

                <Text
                  style={
                    styles.metaChipText
                  }
                >

                  Qty {item.quantity}

                </Text>

              </View>

              {isBundle && (

                <View
                  style={
                    styles.metaChipGreen
                  }
                >

                  <Text
                    style={
                      styles.metaChipGreenText
                    }
                  >

                    {item.bundleProducts
                      ?.length || 0} Items

                  </Text>

                </View>

              )}

            </View>

            {/* PRICE */}

            <View
              style={
                styles.productBottom
              }
            >

              <Text
                style={
                  styles.productPrice
                }
              >

                ₹{item.total}

              </Text>

            </View>

            {/* SUB PRODUCTS */}

            {isBundle && (

              <View
                style={
                  styles.bundleProducts
                }
              >

                {item.bundleProducts?.map(
                  (
                    sub: any,
                    i: number
                  ) => (

                    <View
                      key={i}
                      style={
                        styles.subRow
                      }
                    >

                      <Image
                        source={{
                          uri:
                            sub.mainImage,
                        }}
                        style={
                          styles.subImage
                        }
                      />

                      <View
                        style={{
                          flex: 1,
                        }}
                      >

                        <Text
                          numberOfLines={1}
                          style={
                            styles.subTitle
                          }
                        >

                          {sub.title}

                        </Text>

                        <Text
                          style={
                            styles.subMeta
                          }
                        >

                          Size{" "}
                          {sub.variant}

                        </Text>

                      </View>

                    </View>

                  )
                )}

              </View>

            )}

          </View>

        </View>

      );

    }
  )}

</View>

      {/* ADDRESS */}
{/* ================= DELIVERY ================= */}

<Text style={styles.sectionTitle}>
  DELIVERY
</Text>

<View style={styles.deliveryCard}>

  <View style={styles.deliveryTop}>

    <View style={styles.locationCircle}>

      <Ionicons
        name="location"
        size={18}
        color="#111"
      />

    </View>

    <View
      style={{
        flex:1,
        marginLeft:14,
      }}
    >

      <Text
        style={styles.receiverName}
      >

        {order.shippingAddress?.name}

      </Text>

      <Text
        style={styles.receiverPhone}
      >

        {order.shippingAddress?.phone}

      </Text>

    </View>

  </View>

  <View
    style={styles.deliveryDivider}
  />

  <Text
    style={styles.fullAddress}
  >

    {order.shippingAddress?.address}

  </Text>

</View>

{/* ================= BILL ================= */}

<Text style={styles.sectionTitle}>
  PAYMENT SUMMARY
</Text>

<View style={styles.billCard}>

  <View
    style={styles.billRow}
  >

    <Text
      style={styles.billLabel}
    >
      Subtotal
    </Text>

    <Text
      style={styles.billValue}
    >
      ₹{order.subtotal}
    </Text>

  </View>

  <View
    style={styles.billRow}
  >

    <Text
      style={styles.billLabel}
    >
      Shipping
    </Text>

    <Text
      style={styles.billValue}
    >
      ₹{order.shipping}
    </Text>

  </View>

  <View
    style={styles.billDivider}
  />

  <View
    style={styles.billTotalRow}
  >

    <Text
      style={styles.billTotalLabel}
    >
      TOTAL
    </Text>

    <Text
      style={styles.billTotalPrice}
    >
      ₹{order.total}
    </Text>

  </View>

</View>
    </ScrollView>
  </Screen>
);
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({

productsCard:{

  marginHorizontal:H_PADDING,

  marginBottom:28,

},
deliveryCard:{

  marginHorizontal:H_PADDING,

  marginBottom:28,

  backgroundColor:"#FFF",

  borderRadius:24,

  padding:20,

  borderWidth:1,

  borderColor:"#EFEFEF",

},

deliveryTop:{

  flexDirection:"row",

  alignItems:"center",

},

locationCircle:{

  width:48,

  height:48,

  borderRadius:24,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",

},

receiverName:{

  fontSize:16,

  fontWeight:"900",

  color:"#111",

},

receiverPhone:{

  marginTop:2,

  fontSize:13,

  color:"#666",

},

deliveryDivider:{

  height:1,

  backgroundColor:"#F2F2F2",

  marginVertical:16,

},

fullAddress:{

  fontSize:14,

  color:"#444",

  lineHeight:22,

},

billCard:{

  marginHorizontal:H_PADDING,

  marginBottom:40,

  backgroundColor:"#111",

  borderRadius:24,

  padding:22,

},

billRow:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  marginBottom:14,

},

billLabel:{

  color:"#888",

  fontSize:13,

  fontWeight:"700",

},

billValue:{

  color:"#FFF",

  fontSize:14,

  fontWeight:"700",

},

billDivider:{

  height:1,

  backgroundColor:"rgba(255,255,255,.08)",

  marginVertical:10,

},

billTotalRow:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"flex-end",

},

billTotalLabel:{

  color:"#888",

  fontSize:13,

  fontWeight:"800",

},

billTotalPrice:{

  color:"#B6FF2E",

  fontSize:32,

  fontWeight:"900",

},
productCard:{

  backgroundColor:"#FFF",

  borderRadius:22,

  marginBottom:14,

  borderWidth:1,

  borderColor:"#EEEEEE",

  padding:14,

  flexDirection:"row",

},

productImage:{

  width:84,

  height:106,

  borderRadius:18,

  backgroundColor:"#F4F4F4",

},

productContent:{

  flex:1,

  marginLeft:16,

},

productTop:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"flex-start",

},

productTitle:{

  flex:1,

  fontSize:16,

  fontWeight:"900",

  color:"#111",

  lineHeight:21,

},

bundleBadge:{

  backgroundColor:"#B6FF2E",

  borderRadius:10,

  paddingHorizontal:8,

  paddingVertical:4,

  marginLeft:8,

},

bundleBadgeText:{

  fontSize:9,

  fontWeight:"900",

  color:"#111",

  letterSpacing:1,

},

productMeta:{

  flexDirection:"row",

  flexWrap:"wrap",

  marginTop:12,

},

metaChip:{

  backgroundColor:"#F5F5F5",

  paddingHorizontal:10,

  paddingVertical:5,

  borderRadius:10,

  marginRight:8,

  marginBottom:8,

},

metaChipText:{

  fontSize:11,

  color:"#666",

  fontWeight:"700",

},

metaChipGreen:{

  backgroundColor:"#B6FF2E",

  paddingHorizontal:10,

  paddingVertical:5,

  borderRadius:10,

},

metaChipGreenText:{

  fontSize:11,

  color:"#111",

  fontWeight:"900",

},

productBottom:{

  marginTop:4,

},

productPrice:{

  fontSize:22,

  fontWeight:"900",

  color:"#111",

},

bundleProducts:{

  marginTop:14,

  borderTopWidth:1,

  borderColor:"#F0F0F0",

  paddingTop:14,

},

subRow:{

  flexDirection:"row",

  alignItems:"center",

  marginBottom:10,

},

subImage:{

  width:38,

  height:38,

  borderRadius:10,

  marginRight:12,

},

subTitle:{

  fontSize:13,

  fontWeight:"800",

  color:"#111",

},

subMeta:{

  marginTop:2,

  fontSize:11,

  color:"#888",

},

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* SEARCH */
  searchContainer: {
    flex: 1,
    justifyContent: "center",

  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },

  subHeading: {
    fontSize: 14,
    color: "#777",
    marginBottom: 24,
  },

  inputWrapper: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },


  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
hero:{

  marginHorizontal:H_PADDING,

  marginTop:18,

  marginBottom:28,

  backgroundColor:"#111",

  borderRadius:CARD_RADIUS,

  padding:24,

},

heroTop:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

},

orderChip:{

  flexDirection:"row",

  alignItems:"center",

  backgroundColor:"#B6FF2E",

  borderRadius:30,

  paddingHorizontal:12,

  paddingVertical:7,

},

orderChipText:{

  marginLeft:6,

  color:"#111",

  fontWeight:"900",

  fontSize:11,

  letterSpacing:1,

},

heroTitle:{

  marginTop:24,

  fontSize:width*.11,

  lineHeight:width*.11,

  color:"#FFF",

  fontWeight:"900",

},

heroSubtitle:{

  marginTop:12,

  color:"#AFAFAF",

  fontSize:14,

  letterSpacing:1,

},

heroBottom:{

  marginTop:28,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

},

heroDivider:{

  width:1,

  height:36,

  backgroundColor:"rgba(255,255,255,.12)",

},

heroSmall:{

  fontSize:10,

  color:"#888",

  letterSpacing:1,

  fontWeight:"700",

},

heroPrice:{

  marginTop:6,

  fontSize:28,

  color:"#B6FF2E",

  fontWeight:"900",

},

heroValue:{

  marginTop:6,

  fontSize:17,

  color:"#FFF",

  fontWeight:"800",

},
  orderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  statusBadge: {
    marginTop: 8,
    backgroundColor: "#000",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
  },

  sectionTitle:{

  marginHorizontal:H_PADDING,

  marginBottom:14,

  fontSize:13,

  color:"#777",

  fontWeight:"800",

  letterSpacing:1.3,

},

timelineCard:{

  marginHorizontal:H_PADDING,

  marginBottom:28,

  backgroundColor:"#FFF",

  borderRadius:CARD_RADIUS,

  padding:22,

  borderWidth:1,

  borderColor:"#EFEFEF",

},

timelineRow:{

  flexDirection:"row",

},

timelineLeft:{

  alignItems:"center",

  marginRight:18,

},

timelineDot:{

  width:28,

  height:28,

  borderRadius:14,

  backgroundColor:"#F2F2F2",

  justifyContent:"center",

  alignItems:"center",

},

timelineDotDone:{

  backgroundColor:"#B6FF2E",

},

timelineDotCurrent:{

  backgroundColor:"#111",

},

timelinePulse:{

  width:10,

  height:10,

  borderRadius:5,

  backgroundColor:"#B6FF2E",

},

timelineLine:{

  width:2,

  flex:1,

  minHeight:42,

},

timelineLineDone:{

  backgroundColor:"#B6FF2E",

},

timelineLinePending:{

  backgroundColor:"#ECECEC",

},

timelineContent:{

  flex:1,

  paddingBottom:22,

},

timelineTitle:{

  fontSize:16,

  fontWeight:"800",

  color:"#999",

  textTransform:"capitalize",

},

timelineTitleDone:{

  color:"#111",

},

timelineTitleActive:{

  color:"#111",

},

timelineSubtitle:{

  marginTop:4,

  fontSize:12,

  color:"#888",

},
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  itemName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },

  itemQty: {
    fontSize: 13,
    color: "#777",
  },

  text: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#777",
  },

  value: {
    fontSize: 14,
    color: "#000",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },


dot: {
  width: 14,
  height: 14,
  borderRadius: 7,
},
itemImage: {
  width: 50,
  height: 50,
  borderRadius: 10,
  marginRight: 10,
  backgroundColor: "#f5f5f5",
},
searchHero: {

  alignItems: "center",

  paddingHorizontal: width * 0.08,

  marginTop: height * 0.08,

},

searchIconCircle: {

  width: 92,

  height: 92,

  borderRadius: 46,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",

  alignItems: "center",

},

searchTitle: {

  marginTop: 28,

  fontSize: width * 0.11,

  lineHeight: width * 0.11,

  fontWeight: "900",

  color: "#111",

  textAlign: "center",

},

searchSubtitle: {

  marginTop: 18,

  fontSize: 15,

  color: "#777",

  textAlign: "center",

  lineHeight: 24,

},

searchCard: {

  marginTop: 42,

  marginHorizontal: width * 0.06,

  backgroundColor: "#FFF",

  borderRadius: 28,

  padding: 22,

  borderWidth: 1,

  borderColor: "#ECECEC",

},

inputLabel: {

  fontSize: 11,

  fontWeight: "800",

  color: "#888",

  letterSpacing: 1.2,

  marginBottom: 14,

},

inputContainer: {

  flexDirection: "row",

  alignItems: "center",

  borderWidth: 1,

  borderColor: "#E8E8E8",

  borderRadius: 18,

  paddingHorizontal: 16,

  height: 62,

},

input: {

  flex: 1,

  marginLeft: 12,

  fontSize: 17,

  fontWeight: "700",

  color: "#111",

},

trackButton: {

  marginTop: 24,

  height: 60,

  borderRadius: 18,

  backgroundColor: "#B6FF2E",

  flexDirection: "row",

  justifyContent: "center",

  alignItems: "center",

},

trackButtonText: {

  fontSize: 15,

  fontWeight: "900",

  color: "#111",

  letterSpacing: 1,

  marginRight: 8,

},
itemVariant: {
  fontSize: 12,
  color: "#777",
  marginTop: 2,
},
dotActive: {
  backgroundColor: "#000",
},

dotInactive: {
  backgroundColor: "#ccc",
},

line: {
  width: 2,
  height: 40,
},

lineActive: {
  backgroundColor: "#000",
},

lineInactive: {
  backgroundColor: "#ccc",
},

timelineTextActive: {
  color: "#000",
  fontWeight: "600",
  textTransform: "capitalize",
},

timelineTextInactive: {
  color: "#aaa",
  textTransform: "capitalize",
},

timelineSubText: {
  fontSize: 12,
  color: "#999",
},header:{

  marginHorizontal:H_PADDING,

  // marginTop:10,

  marginBottom:8,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

},

headerButton:{

  width:52,

  height:52,

  borderRadius:26,

  backgroundColor:"#FFF",

  justifyContent:"center",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#ECECEC",

},
});