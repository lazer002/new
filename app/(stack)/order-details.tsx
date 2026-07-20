import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";
import * as Clipboard from "expo-clipboard";
import { scale, verticalScale, normalize } from "@/utils/responsive";

const CARD_RADIUS = scale(25);

const PADDING = scale(21);

const IMAGE_SIZE = scale(74);
export default function OrderDetails() {
  const { orderNumber } = useLocalSearchParams();
  const { guestId, user } = useAuth();
  const [order, setOrder] = useState<any>(null);
const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const [
    expandedBundle,
    setExpandedBundle,
  ] =
    useState<number | null>(
      null
    );
  const fadeAnim =
    React.useRef(
      new Animated.Value(0)
    ).current;

  const moveAnim =
    React.useRef(
      new Animated.Value(40)
    ).current;



  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [guestId])
  );

  const loadOrder = async () => {
    const res = await api.get(
      `/api/orders/track?orderNumber=${orderNumber}`,
      { headers: { "x-guest-id": guestId || "" } }
    );
    setOrder(res.data.order);
    Animated.parallel([

      Animated.timing(

        fadeAnim,

        {

          toValue: 1,

          duration: 500,

          useNativeDriver: true,

        }

      ),

      Animated.spring(

        moveAnim,

        {

          toValue: 0,

          useNativeDriver: true,

          bounciness: 7,

        }

      )

    ]).start();
  };

  if (!order) return null;

  const steps = [
    "pending",
    "confirmed",
    "dispatched",
    "shipped",
    "out for delivery",
    "delivered",
  ];

  const currentStatus =
    order.statusHistory?.length > 0
      ? order.statusHistory[order.statusHistory.length - 1].status
      : order.orderStatus;

  const currentIndex = steps.findIndex((s) => s === currentStatus);

  const getAction = () => {
    if (["pending", "confirmed"].includes(currentStatus)) return "cancel";
    if (["shipped", "out for delivery", "delivered"].includes(currentStatus))
      return "return";
    return null;
  };


const handleCancel = () => {
  setCancelModalVisible(true);
};

const handleConfirmCancel = async () => {
  setCancelModalVisible(false);
  await confirmCancel();
};
  const confirmCancel = async () => {
    try {
      await api.put(
        "/api/orders/cancel",
        { orderId: order._id }, // ✅ correct
        { headers: { "x-guest-id": guestId || "" } }
      );

      setOrder((prev: any) => ({
        ...prev,
        orderStatus: "cancelled",
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: "cancelled", updatedAt: new Date() },
        ],
      }));

      await loadOrder();

      Toast.show({
        type: "success",
        text1: "Order Cancelled",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Cancel Failed",
      });
    }
  };

  const handleReturn = () => {
    Toast.show({
      type: "info",
      text1: "Return Available",
      text2: "You can reject delivery or request return",
    });
  };
  const actionType = getAction();
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
          backgroundColor: "#FFD5D5",
        };

      default:

        return {
          backgroundColor: "#FFE8A3",
        };

    }

  };
  const handleCopyOrderId = async () => {

    await Clipboard.setStringAsync(
      order.orderNumber
    );

    Toast.show({

      type: "success",

      text1: "Order ID Copied",

    });

  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: verticalScale(253), }}>

        {/* HEADER */}
        <View
          style={styles.hero}
        >

          <View
            style={styles.heroTop}
          >

            <TouchableOpacity

              style={styles.backButton}

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

              style={styles.copyButton}

              onPress={handleCopyOrderId}

            >

              <Ionicons

                name="copy-outline"

                size={20}

                color="#111"

              />

            </TouchableOpacity>

          </View>

          <Animated.View

            style={{

              opacity: fadeAnim,

              transform: [

                {

                  translateY:
                    moveAnim,

                },

              ],

            }}

          >

            <Text
              style={styles.heroTitle}
            >

              ORDER
              DETAILS

            </Text>

            <Text
              style={styles.heroSubtitle}
            >

              Every update,
              every item,
              every shipment.

            </Text>

            <View
              style={styles.heroAccent}
            />

          </Animated.View>

        </View>
        <View style={styles.summaryCard}>
          {/* ORDER CARD */}
          <View style={styles.summaryTop}>

            <View>

              <Text
                style={styles.summaryLabel}
              >

                ORDER NUMBER

              </Text>

              <View
                style={styles.orderRow}
              >

                <Text
                  style={styles.summaryOrder}
                >

                  #{order.orderNumber}

                </Text>

                <TouchableOpacity
                  onPress={handleCopyOrderId}
                >

                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color="#B6FF2E"
                  />

                </TouchableOpacity>

              </View>

            </View>

            <View
              style={[
                styles.statusPill,
                getStatusStyle(currentStatus),
              ]}
            >

              <Text
                style={styles.statusPillText}
              >

                {currentStatus.toUpperCase()}

              </Text>

            </View>

          </View>

          <View
            style={styles.summaryDivider}
          />

          <View
            style={styles.summaryGrid}
          >

            <View
              style={styles.summaryItem}
            >

              <Text
                style={styles.summarySmall}
              >

                ORDER DATE

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

          {/* jfwaifwa */}
          <View
            style={styles.summaryGridd}
          >


            <View
              style={styles.summaryItem}
            >

              <Text
                style={styles.summarySmall}
              >

                Sub Total

              </Text>

              <Text
                style={styles.summaryValue}
              >

                ₹ {order.subtotal}

              </Text>

            </View>

            <View
              style={styles.summaryItem}
            >

              <Text
                style={styles.summarySmall}
              >

                Shipping 

              </Text>

              <Text
                style={styles.summaryValue}
              >

                {

                order.shippingFee > 0

                  ? `₹${order.shippingFee}`

                  : "FREE"

              }

              </Text>

            </View>




          </View>


          <View
            style={styles.summaryDivider}
          />

          <View
            style={styles.summaryGrid}
          >

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

                PAYMENT STATUS

              </Text>

              <Text
                style={styles.summaryValue}
              >

                {order.paymentStatus}

              </Text>

            </View>

          </View>



        </View>

        {/* TRACKING */}
        {/* ================= TRACK ORDER ================= */}

        <Text
          style={styles.sectionHeading}
        >

          TRACK ORDER

        </Text>
        <View
          style={styles.timelineCard}
        >

          {steps.map((step, i) => {

            const active =
              i <= currentIndex;

            const current =
              i === currentIndex;

            return (

              <View
                key={i}
                style={styles.timelineRow}
              >

                <View
                  style={styles.timelineLeft}
                >

                  <View

                    style={[

                      styles.timelineDot,

                      active &&
                      styles.timelineDotActive,

                      current &&
                      styles.timelineDotCurrent,

                    ]}
                  />

                  {i !== steps.length - 1 && (

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
                  style={styles.timelineContent}
                >

                  <Text

                    style={[

                      styles.timelineTitle,

                      current &&
                      styles.timelineTitleActive,

                    ]}

                  >

                    {step
                      .replace(/\b\w/g, l => l.toUpperCase())}

                  </Text>

                  <Text
                    style={styles.timelineDate}
                  >

                    {order.statusHistory?.[i]?.updatedAt

                      ? new Date(
                        order.statusHistory[i].updatedAt
                      ).toLocaleDateString()

                      : "Waiting..."}

                  </Text>

                  {current && (

                    <View
                      style={styles.currentBadge}
                    >

                      <Text
                        style={styles.currentBadgeText}
                      >

                        CURRENT

                      </Text>

                    </View>

                  )}

                </View>

              </View>

            );

          })}

        </View>

        {/* DELIVERY */}
        {/* ================= DELIVERY ================= */}

        <Text
          style={styles.sectionHeading}
        >

          DELIVERY ADDRESS

        </Text>

        <View
          style={styles.deliveryCard}
        >

          <View
            style={styles.locationCircle}
          >

            <Ionicons
              name="location"
              size={22}
              color="#111"
            />

          </View>

          <View
            style={styles.deliveryInfo}
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

        </View>

     

        {/* ITEMS */}
        {/* ================= PRODUCTS ================= */}

        <Text
          style={styles.sectionHeading}
        >

          ORDER ITEMS

        </Text>

        {order.items.map(
          (item: any, index: number) => {

            const isBundle =
              (Array.isArray(item.bundleProducts) &&
                item.bundleProducts.length > 0) &&
              (!!item.bundleId || item.customBundle);

            const expanded =
              expandedBundle === index;

            return (

              <View
                key={index}
                style={styles.productCard}
              >

                <Image
                  source={{
                    uri: item.mainImage
                  }}
                  style={styles.productImage}
                />

                <View
                  style={styles.productContent}
                >

                  <View
                    style={styles.productHeader}
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
                    style={styles.productMeta}
                  >

                    <View
                      style={styles.metaChip}
                    >

                      <Text
                        style={styles.metaChipText}
                      >

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
                    style={styles.productFooter}
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

                  {expanded && (

                    <View
                      style={styles.bundleDrawer}
                    >

                      <Text
                        style={styles.drawerTitle}
                      >

                        PRODUCTS INCLUDED

                      </Text>

                      {item.bundleProducts.map(

                        (sub: any, i: number) => (

                          <View

                            key={i}

                            style={styles.subRow}

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

                              <Text style={styles.subSize}>
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

          })
        }
        {/* ACTION BUTTON */}
        <View
          style={styles.actionContainer}
        >

          {actionType === "cancel" && (

            <TouchableOpacity

              style={styles.cancelButton}

              onPress={handleCancel}

            >

              <Ionicons

                name="close-circle"

                size={18}

                color="#FFF"

              />

              <Text
                style={styles.actionButtonText}
              >

                CANCEL ORDER

              </Text>

            </TouchableOpacity>

          )}

          {actionType === "return" && (

            <TouchableOpacity

              style={styles.returnButton}

              onPress={handleReturn}

            >

              <Ionicons

                name="refresh"

                size={18}

                color="#111"

              />

              <Text
                style={styles.returnButtonText}
              >

                RETURN ORDER

              </Text>

            </TouchableOpacity>

          )}

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>

        <View style={styles.bottomTop}>

          <View>

            <Text style={styles.bottomLabel}>

              ORDER TOTAL

            </Text>

            <Text style={styles.bottomPrice}>

              ₹{order.total}

            </Text>

          </View>

          <TouchableOpacity

            style={styles.invoiceButton}

            onPress={() => { }}

          >

            <Ionicons

              name="document-text-outline"

              size={20}

              color="#111"

            />

          </TouchableOpacity>

        </View>

        <View
          style={styles.bottomButtons}
        >

          <TouchableOpacity

            style={styles.trackButton}

            onPress={() => {

              router.push({

                pathname: "/track",

                params: {

                  orderNumber,

                },

              });

            }}

          >

            <Ionicons

              name="navigate"

              size={18}

              color="#111"

            />

            <Text
              style={styles.trackButtonText}
            >

              TRACK ORDER

            </Text>

          </TouchableOpacity>

          <TouchableOpacity

            style={styles.shopButton}

            onPress={() => {

              router.replace("/");

            }}

          >

            <Ionicons

              name="bag-outline"

              size={18}

              color="#FFF"

            />

            <Text
              style={styles.shopButtonText}
            >

              SHOP MORE

            </Text>

          </TouchableOpacity>

        </View>

      </View>

<Modal
  visible={cancelModalVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() =>
    setCancelModalVisible(false)
  }
>
  <View style={styles.cancelOverlay}>
    <TouchableOpacity
      activeOpacity={1}
      style={StyleSheet.absoluteFill}
      onPress={() =>
        setCancelModalVisible(false)
      }
    />

    <View style={styles.cancelModal}>
      {/* ICON */}

      <View style={styles.cancelIcon}>
        <Ionicons
          name="close"
          size={26}
          color="#111"
        />
      </View>

      {/* CONTENT */}

      <Text style={styles.cancelLabel}>
        ORDER ACTION
      </Text>

      <Text style={styles.cancelTitle}>
        Cancel Order?
      </Text>

      <Text style={styles.cancelDescription}>
        Are you sure you want to cancel this order?
        This action may not be reversible once confirmed.
      </Text>

      {/* ACTIONS */}

      <View style={styles.cancelActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.keepOrderButton}
          onPress={() =>
            setCancelModalVisible(false)
          }
        >
          <Text style={styles.keepOrderText}>
            KEEP ORDER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.confirmCancelButton}
          onPress={handleConfirmCancel}
        >
          <Text style={styles.confirmCancelText}>
            CANCEL ORDER
          </Text>

          <View style={styles.confirmCancelIcon}>
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#111"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}



/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },


  hero: {

    paddingHorizontal: PADDING,

    paddingTop:

      Platform.OS === "ios"
        ? 12
        : 8,

    paddingBottom: 28,

  },

  heroTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  backButton: {

    width: 52,

    height: 52,

    borderRadius: 18,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",

    alignItems: "center",

  },

  copyButton: {

    width: 52,

    height: 52,

    borderRadius: 18,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",

    alignItems: "center",

  },

  heroTitle: {

    marginTop: 30,

    fontSize: normalize(44),

    fontWeight: "900",

    color: "#111",

    letterSpacing: 1,

  },

  heroSubtitle: {

    marginTop: 10,

    fontSize: normalize(15),

    lineHeight: normalize(24),

    color: "#777",

  },

  heroAccent: {

    marginTop: 20,

    width: 90,

    height: 6,

    borderRadius: 4,

    backgroundColor: "#B6FF2E",

  },

  summaryCard: {

    marginHorizontal: PADDING,

    marginBottom: 30,

    borderRadius: CARD_RADIUS,

    backgroundColor: "#111",

    padding: 24,

  },

  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
  },

  orderId: { fontSize: normalize(16), fontWeight: "700" },
  date: { fontSize: normalize(12), color: "#777", marginTop: 4 },

  statusBadge: {
    marginTop: 8,
    backgroundColor: "#ecfdf5",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: { color: "#22c55e", fontSize: normalize(11) },

  section: {
    fontSize: normalize(12),
    color: "#999",
    marginBottom: 10,
    fontWeight: "600",
  },


  summaryTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

  },

  summaryLabel: {

    fontSize: normalize(11),

    fontWeight: "800",

    letterSpacing: 1.5,

    color: "rgba(255,255,255,.45)",

  },

  orderRow: {

    marginTop: 8,

    flexDirection: "row",

    alignItems: "center",

  },

  summaryOrder: {

    fontSize: normalize(28),

    fontWeight: "900",

    color: "#FFF",

    marginRight: 10,

  },

  statusPill: {

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 22,

  },

  statusPillText: {

    fontSize: normalize(11),

    fontWeight: "900",

    letterSpacing: 1,

    color: "#111",

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
    summaryGridd: {

    flexDirection: "row",

    justifyContent: "space-between",
    paddingTop: 10,

  },

  summaryItem: {

    flex: 1,

  },
 
  summarySmall: {

    fontSize: normalize(11),

    fontWeight: "800",

    letterSpacing: 1,

    color: "rgba(255,255,255,.45)",

  },

  summaryValue: {

    marginTop: 8,

    fontSize: normalize(16),

    fontWeight: "700",

    color: "#FFF",
    textTransform: "uppercase",

  },

  totalPrice: {

    marginTop: 8,

    fontSize: normalize(34),

    fontWeight: "900",

    color: "#B6FF2E",

  },
  sectionHeading: {

    marginHorizontal: PADDING,

    marginBottom: 8,

    fontSize: normalize(28),

    fontWeight: "900",

    letterSpacing: .5,

    color: "#111",

  },

  timelineCard: {

    marginHorizontal: PADDING,

    marginBottom: 8,

    padding: 24,

    borderRadius: CARD_RADIUS,

    backgroundColor: "#FFF",

  },

  timelineRow: {

    flexDirection: "row",

  },

  timelineLeft: {

    width: 34,

    alignItems: "center",

  },

  timelineDot: {

    width: 16,

    height: 16,

    borderRadius: 8,

    backgroundColor: "#E3E3E3",

  },

  timelineDotActive: {

    backgroundColor: "#B6FF2E",

  },

  timelineDotCurrent: {

    borderWidth: 5,

    transform: [

      {
        scale: 1.25,
      },

    ],

    borderColor: "#DDFDA3",

  },

  timelineLine: {

    width: 2,

    flex: 1,

    backgroundColor: "#E8E8E8",

    marginVertical: 6,

  },

  timelineLineActive: {

    backgroundColor: "#B6FF2E",

  },

  timelineContent: {

    flex: 1,

    paddingBottom: 28,

    paddingLeft: 12,

  },

  timelineTitle: {

    fontSize: normalize(18),

    fontWeight: "700",

    color: "#666",

  },

  timelineTitleActive: {

    color: "#111",

    fontWeight: "900",

  },

  timelineDate: {

    marginTop: 6,

    fontSize: normalize(13),

    color: "#999",

  },

  currentBadge: {

    marginTop: 14,

    alignSelf: "flex-start",

    backgroundColor: "#111",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 14,

  },
  productCard: {

    marginHorizontal: PADDING,

    marginBottom: 14,

    backgroundColor: "#FFF",

    borderRadius: 22,

    borderWidth: 1,

    borderColor: "#EFEFEF",

    flexDirection: "row",

    padding: 14,

    alignItems: "flex-start",

  },

  productImage: {

    width: scale(117),

    height: verticalScale(127),

    borderRadius: 18,

    backgroundColor: "#F5F5F5",

  },

  productContent: {

    flex: 1,

    marginLeft: scale(20),

    paddingVertical: 2,

  },

  productHeader: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

  },

  bundleBadge: {

    backgroundColor: "#111",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 14,

  },

  bundleBadgeText: {

    color: "#B6FF2E",

    fontWeight: "900",

    fontSize: normalize(10),

    letterSpacing: 1,

  },

  productTitle: {

    fontSize: normalize(16),

    fontWeight: "900",

    color: "#111",

    lineHeight: normalize(22),

  },

  productMeta: {

    marginTop: verticalScale(15),

    flexDirection: "row",

  },

  metaChip: {

    backgroundColor: "#F5F5F5",

    paddingHorizontal: scale(8),

    paddingVertical: verticalScale(4),

    borderRadius: 10,

    marginRight: 8,

  },

  metaChipText: {

    fontWeight: "700",

    fontSize: normalize(12),

    color: "#666",

  },

  productFooter: {


    marginTop: verticalScale(15),

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  productPrice: {

    fontSize: normalize(23),

    fontWeight: "900",

    color: "#111",

  },

  expandButton: {

    width: 34,

    height: 34,

    borderRadius: 23,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

  },

  bundleDrawer: {

    marginTop: verticalScale(15),

    paddingTop: verticalScale(15),

    borderTopWidth: 1,

    borderColor: "#EFEFEF",
    backgroundColor: "#FAFAFA",

    borderRadius: 20,

    padding: 18,
  },

  drawerTitle: {

    fontSize: normalize(12),

    fontWeight: "900",

    letterSpacing: 1,

    marginBottom: 18,

    color: "#999",

  },

  subRow: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: verticalScale(15),

  },

  subImage: {

    width: scale(59),

    height: verticalScale(51),

    borderRadius: 14,

    marginRight: 14,

  },

  subTitle: {

    fontSize: normalize(14),

    fontWeight: "700",

    color: "#111",

  },
  deliveryCard: {

    marginHorizontal: PADDING,

    marginBottom: 26,

    backgroundColor: "#FFF",

    borderRadius: CARD_RADIUS,

    padding: 22,

    flexDirection: "row",

  },

  locationCircle: {

    width: 56,

    height: 56,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 16,

  },

  deliveryInfo: {

    flex: 1,

  },

  deliveryName: {

    fontSize: normalize(18),

    fontWeight: "900",

    color: "#111",

  },

  deliveryAddress: {

    marginTop: 6,

    fontSize: normalize(14),

    lineHeight: normalize(22),

    color: "#777",

  },

  deliveryPhone: {

    marginTop: 10,

    fontSize: normalize(14),

    fontWeight: "700",

    color: "#111",

  },

  paymentCard: {

    marginHorizontal: PADDING,

    marginBottom: 26,

    backgroundColor: "#111",

    borderRadius: CARD_RADIUS,

    padding: 22,

  },

  paymentTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  paymentLabel: {

    fontSize: normalize(11),

    letterSpacing: 1,

    fontWeight: "800",

    color: "rgba(255,255,255,.45)",

  },

  paymentMethod: {

    marginTop: 8,

    fontSize: normalize(24),

    fontWeight: "900",

    color: "#FFF",

  },

  paymentStatusBadge: {

    backgroundColor: "#B6FF2E",

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 18,

  },

  paymentStatusText: {

    fontWeight: "900",

    fontSize: normalize(11),

    color: "#111",

  },

  paymentDivider: {

    height: 1,

    marginVertical: 20,

    backgroundColor: "rgba(255,255,255,.08)",

  },

  billRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 18,

  },

  billLabel: {

    fontSize: normalize(14),

    color: "rgba(255,255,255,.55)",

  },

  billValue: {

    fontSize: normalize(15),

    fontWeight: "700",

    color: "#FFF",

  },

  discountText: {

    fontSize: normalize(15),

    fontWeight: "900",

    color: "#B6FF2E",

  },

  totalLabel: {

    fontSize: normalize(17),

    fontWeight: "900",

    color: "#FFF",

  },

  totalPriceBottom: {

    fontSize: normalize(34),

    fontWeight: "900",

    color: "#B6FF2E",

  },

  actionContainer: {

    marginHorizontal: PADDING,

    marginBottom: 30,

  },

  cancelButton: {

    height: 60,

    borderRadius: 22,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  returnButton: {

    height: 60,

    borderRadius: 22,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  actionButtonText: {

    marginLeft: 10,

    fontWeight: "900",

    fontSize: normalize(14),

    letterSpacing: 1,

    color: "#FFF",

  },

  returnButtonText: {

    marginLeft: 10,

    fontWeight: "900",

    fontSize: normalize(14),

    letterSpacing: 1,

    color: "#111",

  },
  subSize: {

    marginTop: 5,

    fontSize: normalize(11),

    color: "#888",

  },
  currentBadgeText: {

    color: "#B6FF2E",

    fontSize: normalize(9),

    fontWeight: "900",

    letterSpacing: 1,

  },

  value: { fontSize: normalize(13), fontWeight: "500" },
  sub: { fontSize: normalize(12), color: "#666", marginTop: 2 },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  paymentBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  paymentBadgeText: { fontSize: normalize(11) },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  img: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginRight: 10,
  },

  itemTitle: { fontSize: normalize(13), fontWeight: "600" },

  price: { fontWeight: "700" },


  bottomBar: {

    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    paddingHorizontal: PADDING,

    paddingTop: 18,

    paddingBottom:

      Platform.OS === "ios"
        ? 34
        : 20,

    backgroundColor: "#FFF",

    borderTopWidth: 1,

    borderColor: "#EFEFEF",

    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 24,

    shadowOffset: {

      width: 0,

      height: -10,

    },

    elevation: 18,

  },

  bottomTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,

  },

  bottomLabel: {

    fontSize: normalize(11),

    fontWeight: "800",

    letterSpacing: 1.2,

    color: "#999",

  },

  bottomPrice: {

    marginTop: 6,

    fontSize: normalize(34),

    fontWeight: "900",

    color: "#111",

  },

  invoiceButton: {

    width: 54,

    height: 54,

    borderRadius: 18,

    backgroundColor: "#F5F5F5",

    justifyContent: "center",

    alignItems: "center",

  },

  bottomButtons: {

    flexDirection: "row",

  },

  trackButton: {

    flex: 1,

    height: 58,

    borderRadius: 20,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  trackButtonText: {

    marginLeft: 10,

    fontSize: normalize(14),

    fontWeight: "900",

    letterSpacing: .8,

    color: "#111",

  },

  shopButton: {

    flex: 1,

    height: 58,

    marginLeft: 14,

    borderRadius: 20,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  shopButtonText: {

    marginLeft: 10,

    fontSize: normalize(14),

    fontWeight: "900",

    letterSpacing: .8,

    color: "#FFF",

  },

  cancelBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 30,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  copyText: {
    fontSize: normalize(12),
    fontWeight: "600",
    color: "#000",
  },
  cancelText: {
    color: "#dc2626",
    fontWeight: "700",
  },

  returnBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 30,
    backgroundColor: "#111",
    alignItems: "center",
  },

  returnText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  justifyContent: "flex-end",
},

cancelModal: {
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  paddingHorizontal: 22,
  paddingTop: 26,
  paddingBottom: 30,
},

cancelIcon: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: "#B6FF2E",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 24,
},

cancelLabel: {
  fontSize: normalize(10),
  fontWeight: "800",
  letterSpacing: 1.5,
  color: "#888",
  marginBottom: 8,
},

cancelTitle: {
  fontSize: normalize(30),
  fontWeight: "900",
  letterSpacing: -0.8,
  color: "#111",
},

cancelDescription: {
  marginTop: 10,
  fontSize: normalize(14),
  lineHeight: normalize(21),
  color: "#777",
  maxWidth: 330,
},

cancelActions: {
  flexDirection: "row",
  marginTop: 30,
  gap: 10,
},

keepOrderButton: {
  flex: 0.8,
  height: 58,
  borderRadius: 20,
  backgroundColor: "#F5F5F5",
  justifyContent: "center",
  alignItems: "center",
},

keepOrderText: {
  fontSize: normalize(11),
  fontWeight: "800",
  letterSpacing: 0.8,
  color: "#111",
},

confirmCancelButton: {
  flex: 1.3,
  height: 58,
  borderRadius: 20,
  backgroundColor: "#111",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: 18,
  paddingRight: 6,
},

confirmCancelText: {
  fontSize: normalize(11),
  fontWeight: "800",
  letterSpacing: 0.8,
  color: "#FFF",
},

confirmCancelIcon: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#B6FF2E",
  justifyContent: "center",
  alignItems: "center",
},
});