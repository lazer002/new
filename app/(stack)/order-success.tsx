import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";
const { width, height } =
  Dimensions.get("window");

const isSmall =
  height < 700;

const CARD_RADIUS =
  width * 0.06;

const IMAGE_SIZE =
  width * 0.19;

const H_PADDING =
  width * 0.055;
export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams();
  const { clearCart } = useCart();
  const { guestId } = useAuth();
  const [
    expandedBundle,
    setExpandedBundle,
  ] =
    useState<number | null>(
      null
    );
  const [order, setOrder] = useState<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim =
    useRef(
      new Animated.Value(.35)
    ).current;

  const getStatus = (order: any) => {
    if (order?.statusHistory?.length > 0) {
      return order.statusHistory[order.statusHistory.length - 1].status;
    }
    return order?.orderStatus || "pending";
  };
  const getStatusStyle = (
    status: string
  ) => {

    switch (status) {

      case "delivered":

        return {
          backgroundColor: "#B6FF2E",
        };

      case "cancelled":

        return {
          backgroundColor: "#FFD6D6",
        };

      default:

        return {
          backgroundColor: "#FFE9A6",
        };

    }

  };
  useEffect(() => {
    clearCart({ skipLocal: true }).catch(console.log);

    // 🧹 remove old local orders
    AsyncStorage.removeItem("orders");

    const loadOrder = async () => {
      try {
        const res = await api.get(
          `/api/orders/track?orderNumber=${orderNumber}`,
          {
            headers: { "x-guest-id": guestId || "" },
          }
        );

        setOrder(res.data.order);
        console.log("Order fetched:", JSON.stringify(res.data.order, null, 2));
      } catch (e) {
        console.log("Order fetch error:", e);
      }
    };

    loadOrder();

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(

      Animated.sequence([

        Animated.timing(
          glowAnim,
          {
            toValue: .9,
            duration: 900,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          glowAnim,
          {
            toValue: .35,
            duration: 900,
            useNativeDriver: true,
          }
        ),

      ])

    ).start();

  }, []);


  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator

            size="large"

            color="#B6FF2E"

          />

          <Text
            style={styles.loadingText}
          >

            Preparing your order...

          </Text>

        </View>
      </SafeAreaView>
    );
  }




  const isCOD =
    order.paymentMethod?.toLowerCase() === "cod";

  const bannerIcon =
    isCOD
      ? "cash-outline"
      : "shield-checkmark";

  const bannerText =
    isCOD
      ? "Cash on Delivery selected"
      : "Payment verified successfully";

  const status = getStatus(order);


  const timelineSteps = isCOD
    ? [
      {
        key: "placed",
        title: "Order Placed",
        icon: "bag-check-outline",
      },
      {
        key: "confirmed",
        title: "Order Confirmed",
        icon: "checkmark-circle-outline",
      },
      {
        key: "packed",
        title: "Packed",
        icon: "cube-outline",
      },
      {
        key: "shipped",
        title: "Shipped",
        icon: "car-outline",
      },
      {
        key: "out_for_delivery",
        title: "Out for Delivery",
        icon: "bicycle-outline",
      },
      {
        key: "delivered",
        title: "Delivered",
        icon: "home-outline",
      },
    ]
    : [
      {
        key: "placed",
        title: "Order Placed",
        icon: "bag-check-outline",
      },
      {
        key: "paid",
        title: "Payment Successful",
        icon: "card-outline",
      },
      {
        key: "confirmed",
        title: "Order Confirmed",
        icon: "checkmark-circle-outline",
      },
      {
        key: "packed",
        title: "Packed",
        icon: "cube-outline",
      },
      {
        key: "shipped",
        title: "Shipped",
        icon: "car-outline",
      },
      {
        key: "out_for_delivery",
        title: "Out for Delivery",
        icon: "bicycle-outline",
      },
      {
        key: "delivered",
        title: "Delivered",
        icon: "home-outline",
      },
    ];


  const activeSteps = new Set<string>();

  activeSteps.add("placed");

  if (!isCOD) {
    activeSteps.add("paid");
  }

  switch (status) {

    case "confirmed":
      activeSteps.add("confirmed");
      break;

    case "packed":
      activeSteps.add("confirmed");
      activeSteps.add("packed");
      break;

    case "shipped":
      activeSteps.add("confirmed");
      activeSteps.add("packed");
      activeSteps.add("shipped");
      break;

    case "out_for_delivery":
      activeSteps.add("confirmed");
      activeSteps.add("packed");
      activeSteps.add("shipped");
      activeSteps.add("out_for_delivery");
      break;

    case "delivered":
      activeSteps.add("confirmed");
      activeSteps.add("packed");
      activeSteps.add("shipped");
      activeSteps.add("out_for_delivery");
      activeSteps.add("delivered");
      break;

  }





  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.content}>

          {/* ICON */}
          {/* HERO */}

          <View
            style={styles.hero}
          >

            <Animated.View

              style={[

                styles.successCircle,

                {

                  transform: [

                    {

                      scale: scaleAnim,

                    },

                  ],

                },

              ]}

            >

              <Animated.View

                style={[

                  styles.successGlow,

                  {

                    opacity: glowAnim,

                  },

                ]}

              />

              <Ionicons

                name="checkmark"

                size={58}

                color="#111"

              />

            </Animated.View>

            <Animated.View

              style={{

                opacity: fadeAnim,

                alignItems: "center",

              }}

            >

              <Text
                style={styles.heroTitle}
              >

                ORDER
                CONFIRMED

              </Text>

              <Text
                style={styles.heroSubtitle}
              >

                Your purchase has been
                successfully placed.

              </Text>
              <View
                style={styles.successBanner}
              >

                <Ionicons
                  name={bannerIcon}
                  size={18}
                  color="#111"
                />

                <Text style={styles.successBannerText}>
                  {bannerText}
                </Text>

              </View>
              <View
                style={styles.heroAccent}
              />

            </Animated.View>

          </View>

          {/* HEADER */}
          <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>


            {/* ================= ORDER SUMMARY ================= */}

            <Animated.View
              style={[
                styles.summaryCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY:
                        fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [40, 0],
                        }),
                    },
                  ],
                },
              ]}
            >

              <View style={styles.summaryTop}>

                <View>

                  <Text style={styles.summaryLabel}>
                    ORDER NUMBER
                  </Text>

                  <Text style={styles.summaryOrder}>
                    #{order.orderNumber}
                  </Text>

                </View>

                <View
                  style={[
                    styles.statusPill,

                    getStatusStyle(status),
                  ]}
                >

                  <Text
                    style={styles.statusPillText}
                  >

                    {status.toUpperCase()}

                  </Text>

                </View>

              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryGrid}>

                <View
                  style={styles.summaryItem}
                >

                  <Text
                    style={styles.summarySmall}
                  >

                    DATE

                  </Text>

                  <Text
                    style={styles.summaryValue}
                  >

                {new Date(order.createdAt).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})}

                  </Text>

                </View>

                <View
                  style={styles.summaryItem}
                >

                  <Text
                    style={styles.summarySmall}
                  >

                    PAYMENT

                  </Text>

                  <Text
                    style={styles.summaryValue}
                  >

                    {order.paymentMethod.toUpperCase()}

                  </Text>

                </View>

              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryGrid}>

                <View
                  style={styles.summaryItem}
                >

                  <Text
                    style={styles.summarySmall}
                  >

                    TOTAL

                  </Text>

                  <Text
                    style={styles.totalPrice}
                  >

                    ₹{order.total}

                  </Text>

                </View>

                <View
                  style={styles.summaryItem}
                >

                  <Text
                    style={styles.summarySmall}
                  >

                    STATUS

                  </Text>

                  <Text
                    style={styles.paymentStatus}
                  >

                    {order.paymentStatus}

                  </Text>

                </View>

              </View>

            </Animated.View>

            {/* ITEMS */}
            {/* ================= PRODUCTS ================= */}

            <Text style={styles.sectionHeading}>

              ORDER ITEMS

            </Text>

            {order.items.map((item: any, index: number) => {

             const isBundle =
  Array.isArray(item.bundleProducts) &&
  item.bundleProducts.length > 0;

              const expanded =
                expandedBundle === index;

              return (

                <View
                  key={index}
                  style={styles.productCard}
                >

                  <Image

                    source={{
                      uri: item.mainImage,
                    }}

                    style={styles.productImage}

                  />

                  <View
                    style={styles.productContent}
                  >

                    <View
                      style={styles.productTop}
                    >

                      <Text

                        numberOfLines={2}

                        style={styles.productTitle}

                      >

                        {item.title}

                      </Text>

                      {isBundle && (

                        <View
                          style={styles.bundleBadge}
                        >

                          <Text
                            style={styles.bundleBadgeText}
                          >

                            BUNDLE

                          </Text>

                        </View>

                      )}

                    </View>

                    <View
                      style={styles.metaRow}
                    >

                      <View
                        style={styles.metaChip}
                      >

                  <Text style={styles.metaChipText}>

    {isBundle
      ? `${item.bundleProducts.length} Products`
      : `Size ${item.variant || "OS"}`}

  </Text>

                      </View>

                      <View
                        style={styles.metaChip}
                      >

                        <Text
                          style={styles.metaChipText}
                        >

                          Qty {item.quantity}

                        </Text>

                      </View>

                    </View>

                    <View
                      style={styles.priceRow}
                    >

                      <Text
                        style={styles.productPrice}
                      >

                        ₹{item.total}

                      </Text>

                      {isBundle && (

                        <TouchableOpacity

                          style={styles.expandButton}

                          onPress={() => {

                            setExpandedBundle(

                              expanded
                                ? null
                                : index

                            );

                          }}

                        >

                          <Ionicons

                            name={
                              expanded
                                ? "chevron-up"
                                : "chevron-down"
                            }

                            size={18}

                            color="#111"

                          />

                        </TouchableOpacity>

                      )}

                    </View>

                    {/* ---------- SUB PRODUCTS ---------- */}

                    {expanded && (

                      <View
                        style={styles.bundleDrawer}
                      >

                        {item.bundleProducts.map(
                          (sub: any, i: number) => (
                            <View

                              key={i}

                              style={styles.subProduct}

                            >

                              <Image

                                source={{
                                  uri: sub.mainImage,
                                }}

                                style={styles.subImage}

                              />

                              <View
                                style={{
                                  flex: 1,
                                }}
                              >

                                <Text
                                  style={styles.subTitle}
                                >

                                  {sub.title}

                                </Text>

                         <Text
  style={styles.subMeta}
>

  Size {sub.variant || "OS"}

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

            })}

            {/* ================= DELIVERY ================= */}

            <Text
              style={styles.sectionHeading}
            >

              DELIVERY

            </Text>

            <Animated.View
              style={[styles.deliveryCard,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY:
                      fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                  },
                ],
              },
              ]}
            >

              <View
                style={styles.deliveryIcon}
              >

                <Ionicons

                  name="location"

                  size={24}

                  color="#111"

                />

              </View>

              <View
                style={styles.deliveryContent}
              >

                <Text
                  style={styles.deliveryName}
                >

                  {order.shippingAddress.firstName}
                  {" "}
                  {order.shippingAddress.lastName}

                </Text>

                <Text
                  style={styles.deliveryAddress}
                >

                  {order.shippingAddress.address}

                </Text>

                <Text
                  style={styles.deliveryAddress}
                >

                  {order.shippingAddress.city},
                  {" "}
                  {order.shippingAddress.state}

                </Text>

                <Text
                  style={styles.deliveryPhone}
                >

                  {order.shippingAddress.phone}

                </Text>

              </View>

            </Animated.View>

            {/* ================= BILL ================= */}

            <Text
              style={styles.sectionHeading}
            >

              PAYMENT SUMMARY

            </Text>
            <View style={styles.timelineCard}>

              {timelineSteps.map((step, index) => {

                const active =
                  activeSteps.has(step.key);

                const isLast =
                  index === timelineSteps.length - 1;

                return (

                  <View
                    key={step.key}
                    style={styles.timelineRow}
                  >

                    <View
                      style={styles.timelineLeft}
                    >

                      <View

                        style={[

                          styles.timelineCircle,

                          active &&
                          styles.timelineCircleActive,

                        ]}

                      >

                        <Ionicons

                          name={step.icon as any}

                          size={15}

                          color={
                            active
                              ? "#111"
                              : "#999"
                          }

                        />

                      </View>

                      {!isLast && (

                        <View

                          style={[

                            styles.timelineLine,

                            active &&
                            styles.timelineLineActive,

                          ]}

                        />

                      )}

                    </View>

                    <View
                      style={styles.timelineRight}
                    >

                      <Text

                        style={[

                          styles.timelineTitle,

                          active &&
                          styles.timelineTitleActive,

                        ]}

                      >

                        {step.title}

                      </Text>

                      <Text
                        style={styles.timelineSubtitle}
                      >

                        {

                          active

                            ? "Completed"

                            : "Waiting"

                        }

                      </Text>

                    </View>

                  </View>

                );

              })}

            </View>
            <Animated.View
              style={[styles.billCard, {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              }]}
            >

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

                  {order.shippingFee > 0
                    ? `₹${order.shippingFee}`
                    : "FREE"}

                </Text>

              </View>

              <View
                style={styles.billRow}
              >

                <Text
                  style={styles.billLabel}
                >

                  Discount

                </Text>

                <Text
                  style={styles.discountText}
                >

                  -₹{order.discount || 0}

                </Text>

              </View>

              <View
                style={styles.billDivider}
              />

              <View
                style={styles.billRow}
              >

                <Text
                  style={styles.totalLabel}
                >

                  TOTAL

                </Text>

                <Text
                  style={styles.totalValue}
                >

                  ₹{order.total}

                </Text>

              </View>

            </Animated.View>

            {/* ================= SAVED ================= */}

            {(order.discount || 0) > 0 && (

              <Animated.View
                style={[styles.savedCard, {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                }]}
              >

                <Ionicons

                  name="sparkles"

                  size={24}

                  color="#111"

                />

                <View
                  style={{
                    marginLeft: 16,
                  }}

                >

                  <Text
                    style={styles.savedTitle}
                  >

                    YOU SAVED

                  </Text>

                  <Text
                    style={styles.savedAmount}
                  >

                    ₹{order.discount}

                  </Text>

                </View>

              </Animated.View>

            )}

            <Text style={styles.info}>
              You can track your order anytime from My Orders.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* BUTTONS */}
      <View
        style={styles.footer}
      >

        {/* ETA */}

        <View
          style={styles.etaCard}
        >

          <View
            style={styles.etaIcon}
          >

            <Ionicons
              name="cube-outline"
              size={24}
              color="#111"
            />

          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 16,
            }}
          >

            <Text
              style={styles.etaLabel}
            >

              ESTIMATED DELIVERY

            </Text>

            <Text
              style={styles.etaDate}
            >

              5-7 Business Days

            </Text>

          </View>

        </View>

        {/* BUTTONS */}

        <View
          style={styles.footerButtons}
        >

          <TouchableOpacity

            style={styles.trackOrderButton}

            onPress={() =>

              router.push({

                pathname: "/track",

                params: {
                  orderNumber,
                },

              })

            }

          >

            <Ionicons

              name="navigate"

              size={18}

              color="#111"

            />

            <Text
              style={styles.trackOrderText}
            >

              TRACK ORDER

            </Text>

          </TouchableOpacity>

          <TouchableOpacity

            style={styles.shopButton}

            onPress={() =>

              router.replace("/")

            }

          >

            <Ionicons

              name="bag-outline"

              size={18}

              color="#FFF"

            />

            <Text
              style={styles.shopText}
            >

              SHOP MORE

            </Text>

          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Row = ({ label, value, bold }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, bold && { fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  hero: {

    alignItems: "center",

    marginBottom:
      height * 0.04,

  },

  successCircle: {

    width:
      width * 0.29,

    height:
      width * 0.29,

    borderRadius:
      width,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 28,

  },

  successGlow: {

    position: "absolute",

    width:
      width * 0.38,

    height:
      width * 0.38,

    borderRadius: 999,

    backgroundColor: "#B6FF2E",

    opacity: .18,

  },

  heroTitle: {

    fontSize:
      width * 0.085,

    fontWeight: "900",

    letterSpacing: 1.5,

    color: "#111",

    textAlign: "center",

  },

  heroSubtitle: {

    marginTop: 12,

    fontSize:
      width * 0.041,

    lineHeight: 24,

    color: "#777",

    textAlign: "center",

    paddingHorizontal: 24,

  },

  heroAccent: {

    marginTop: 20,

    width: 90,

    height: 6,

    borderRadius: 3,

    backgroundColor: "#B6FF2E",

  },
  content: {

    alignItems: "center",

    paddingHorizontal: H_PADDING,

    paddingTop:
      height * 0.035,

    paddingBottom:
      height * 0.22,

  },

  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },

  statusBadge: {
    alignSelf: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },

  statusText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  section: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: { fontSize: 12, color: "#777" },

  value: { fontSize: 13, fontWeight: "500" },

  sub: { fontSize: 12, color: "#666", marginTop: 2 },
  summaryCard: {

    width: "100%",

    backgroundColor: "#111",

    borderRadius: CARD_RADIUS,

    padding: 22,

    marginBottom: 22,

  },

  summaryTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  summaryLabel: {

    fontSize: 11,

    fontWeight: "800",

    letterSpacing: 1.4,

    color: "rgba(255,255,255,.45)",

  },

  summaryOrder: {

    marginTop: 8,

    fontSize: 26,

    fontWeight: "900",

    color: "#FFF",

  },
  sectionHeading: {

    alignSelf: "flex-start",

    marginBottom: 18,

    fontSize: 28,

    fontWeight: "900",

    color: "#111",

  },

productCard:{

  width:"100%",

  flexDirection:"row",

  alignItems:"flex-start",

  backgroundColor:"#FFF",

  borderRadius:22,

  padding:14,

  marginBottom:14,

  borderWidth:1,

  borderColor:"#EFEFEF",

},

productImage:{

  width:88,

  height: height * 0.12,

  borderRadius:18,

  backgroundColor:"#F5F5F5",

},

  productContent: {

      flex:1,

  marginLeft:16,

  paddingVertical:2,

  },

  productTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

  },

  bundleBadge: {

    backgroundColor: "#111",

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 12,

  },

  bundleBadgeText: {

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1,

    color: "#B6FF2E",

  },

productTitle:{

  fontSize:17,

  fontWeight:"900",

  color:"#111",

  lineHeight:22,

},

  metaRow: {

    flexDirection: "row",

    marginTop: 10,

  },

  metaChip: {

  paddingHorizontal:10,

  paddingVertical:5,

  borderRadius:12,

  backgroundColor:"#F6F6F6",

  marginRight:8,

  },

  metaChipText: {

    fontWeight: "700",

    fontSize: 12,

    color: "#777",

  },

  priceRow: {

    marginTop: 12,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  productPrice: {

    fontSize: 22,

    fontWeight: "900",

    color: "#111",

  },

  expandButton: {

    width:34,

  height:34,

    borderRadius: 17,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

  },

  bundleDrawer: {

  marginTop:14,

  paddingTop:14,

  borderTopWidth:1,

    borderColor: "#EFEFEF",

  },

  subProduct: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 16,

  },

  subImage: {

  width:44,

  height:44,

  borderRadius:12,

    marginRight: 14,

  },

  subTitle: {

    fontSize: 13,

    fontWeight: "700",

    color: "#111",

  },

  subMeta: {

  marginTop:2,

  fontSize:11,

    color: "#888",

  },
  summaryDivider: {

    height: 1,

    backgroundColor: "rgba(255,255,255,.08)",

    marginVertical: 22,

  },

  summaryGrid: {

    flexDirection: "row",

    justifyContent: "space-between",

  },

  summaryItem: {

    flex: 1,

  },

  summarySmall: {

    fontSize: 11,

    fontWeight: "800",

    letterSpacing: 1,

    color: "rgba(255,255,255,.45)",

  },

  summaryValue: {

    marginTop: 8,

    fontSize: 15,

    fontWeight: "700",

    color: "#FFF",
  
  },

  totalPrice: {

    marginTop: 8,

    fontSize: 30,

    fontWeight: "900",

    color: "#B6FF2E",

  },

  paymentStatus: {

    marginTop: 8,

    fontSize: 15,

    fontWeight: "800",

    color: "#FFF",
    textTransform: "capitalize",

  },
  deliveryCard: {

    width: "100%",

    backgroundColor: "#FFF",

    borderRadius: CARD_RADIUS,

    padding: 22,

    marginBottom: 22,

    flexDirection: "row",

    shadowColor: "#000",

    shadowOpacity: .06,

    shadowRadius: 20,

    shadowOffset: {

      width: 0,

      height: 10,

    },

    elevation: 8,

  },

  deliveryIcon: {

    width: 56,

    height: 56,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 18,

  },

  deliveryContent: {

    flex: 1,

  },

  deliveryName: {

    fontSize: 18,

    fontWeight: "900",

    color: "#111",

  },

  deliveryAddress: {

    marginTop: 6,

    fontSize: 14,

    lineHeight: 22,

    color: "#777",

  },

  deliveryPhone: {

    marginTop: 12,

    fontSize: 14,

    fontWeight: "700",

    color: "#111",

  },

  billCard: {

    width: "100%",

    backgroundColor: "#111",

    borderRadius: CARD_RADIUS,
    borderWidth: 1,

    borderColor: "rgba(255,255,255,.05)",
    padding: 22,

    marginBottom: 20,

  },

  billRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,

  },

  billLabel: {

    fontSize: 14,

    color: "rgba(255,255,255,.55)",

  },

  billValue: {

    fontSize: 15,

    fontWeight: "700",

    color: "#FFF",

  },

  discountText: {

    fontSize: 15,

    fontWeight: "900",

    color: "#B6FF2E",

  },

  billDivider: {

    height: 1,

    backgroundColor: "rgba(255,255,255,.08)",

    marginBottom: 20,

  },

  totalLabel: {

    fontSize: 16,

    fontWeight: "900",

    color: "#FFF",

  },

  totalValue: {

    fontSize: 34,

    fontWeight: "900",

    color: "#B6FF2E",

  },

  savedCard: {

    width: "100%",

    backgroundColor: "#B6FF2E",

    borderRadius: CARD_RADIUS,

    padding: 22,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 24,

  },

  savedTitle: {

    fontSize: 12,

    fontWeight: "900",

    letterSpacing: 1,

    color: "#111",

  },

  savedAmount: {

    marginTop: 4,

    fontSize: 28,

    fontWeight: "900",

    color: "#111",

  },
  statusPill: {

    paddingHorizontal: 16,

    paddingVertical: 9,

    borderRadius: 30,

  },

  statusPillText: {

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: .8,

    color: "#111",

  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },

  itemTitle: { fontSize: 13, fontWeight: "600" },

  itemSub: { fontSize: 11, color: "#666" },

  itemPrice: { fontWeight: "600" },

  info: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
  timeline: {

    marginTop: 28,

    marginBottom: 26,

    flexDirection: "row",

    alignItems: "center",

  },

  timelineItem: {

    alignItems: "center",

  },

  timelineDot: {

    width: 14,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#DDD",

  },

  timelineDotActive: {

    width: 14,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#B6FF2E",

  },


  loadingContainer: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",

  },

  loadingText: {

    marginTop: 18,

    fontSize: 15,

    fontWeight: "700",

    color: "#777",

  },


  timelineText: {

    marginTop: 8,

    fontSize: 11,

    fontWeight: "700",

    color: "#888",

  },
  successBanner: {

    marginTop: 24,

    backgroundColor: "#B6FF2E",

    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

  },

  successBannerText: {

    marginLeft: 10,

    fontSize: 13,

    fontWeight: "800",

    color: "#111",

  },
  footer: {

    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    paddingHorizontal: H_PADDING,

    paddingTop: 18,

    paddingBottom:

      Platform.OS === "ios"
        ? 34
        : 18,

    backgroundColor: "#FFF",

    borderTopWidth: 1,

    borderColor: "#F2F2F2",
    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 20,
  },

  etaCard: {

    height: 78,

    borderRadius: 24,

    backgroundColor: "#F8F8F8",

    paddingHorizontal: 20,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,

  },

  etaIcon: {

    width: 54,

    height: 54,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

  },

  etaLabel: {

    fontSize: 11,

    fontWeight: "800",

    letterSpacing: 1,

    color: "#888",

  },
timelineCard: {
  backgroundColor: "#FFF",
  borderRadius: 26,
  padding: 22,
  marginTop: 20,
  marginBottom: 24,
},

timelineRow: {
  flexDirection: "row",
},

timelineLeft: {
  width: 38,
  alignItems: "center",
},



timelineLine: {
  width: 2,
  flex: 1,
  backgroundColor: "#ECECEC",
  marginVertical: 6,
},

timelineLineActive: {
  backgroundColor: "#B6FF2E",
},

timelineRight: {
  flex: 1,
  paddingLeft: 18,
  paddingBottom: 28,
},

timelineTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#777",
},

timelineTitleActive: {
  color: "#111",
  fontWeight: "900",
},

timelineSubtitle: {
  marginTop: 4,
  fontSize: 13,
  color: "#999",
},
  etaDate: {

    marginTop: 6,

    fontSize: 20,

    fontWeight: "900",

    color: "#111",

  },

  footerButtons: {

    flexDirection: "row",

  },

  trackOrderButton: {

    flex: 1,

    height: 60,

    borderRadius: 20,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  trackOrderText: {

    marginLeft: 10,

    fontSize: 14,

    fontWeight: "900",

    letterSpacing: .8,

    color: "#111",

  },
timelineCircle:{

width:34,

height:34,

borderRadius:17,

backgroundColor:"#F4F4F4",

justifyContent:"center",

alignItems:"center",

},

timelineCircleActive:{

backgroundColor:"#B6FF2E",

},


  shopButton: {

    flex: 1,

    marginLeft: 14,

    height: 60,

    borderRadius: 20,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  shopText: {

    marginLeft: 10,

    fontSize: 14,

    fontWeight: "900",

    letterSpacing: .8,

    color: "#FFF",

  },

});