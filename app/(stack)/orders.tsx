import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/config";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated,{
FadeInUp,
} from "react-native-reanimated";
export default function OrdersScreen() {
  const router = useRouter();
  const { user, guestId } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"completed" | "pending" | "cancelled">("pending");


  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [guestId, user])
  );
  const loadOrders = async () => {
    try {
      const res = await api.get("/api/orders/mine");

      setOrders(res.data.orders || res.data);
    } catch (e) {
      console.log("Order fetch error:", e);
    }
  }


  const getStatusStyle = (status: string) => {

    switch (status) {

      case "delivered":

        return {

          backgroundColor: "#B6FF2E",

        };

      case "cancelled":

      case "refunded":

        return {

          backgroundColor: "#FFD9D9",

        };

      default:

        return {

          backgroundColor: "#FFF4D0",

        };

    }

  };

  const renderItem = ({ item, index }: any) => {

    const status =
      getCurrentStatus(item);

    const image =
      item.items?.[0]?.mainImage;

    const qty =
      item.items?.reduce(
        (sum: number, it: any) =>
          sum + (it.quantity || 1),
        0
      );

    return (

<Animated.View
  entering={FadeInUp
    .delay(index * 80)
    .springify()}
>

<TouchableOpacity
  activeOpacity={0.95}
  style={styles.orderCard}
  onPress={() =>
    router.push({
      pathname: "/order-details",
      params: {
        orderNumber: item.orderNumber,
      },
    })
  }
>

        {/* IMAGE */}

<Image
  resizeMode="cover"
  fadeDuration={250}
  source={{
    uri:
      image ||
      "https://placehold.co/600x800/F5F5F5/111111?text=GARRIB",
  }}
  style={styles.orderImage}
/>

        {/* STATUS */}

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

        {/* BODY */}

        <View
          style={styles.orderContent}
        >

          <View
            style={styles.orderHeader}
          >

            <Text
              style={styles.orderNumber}
            >

              ORDER #{item.orderNumber}

            </Text>

            <Text
              style={styles.orderDate}
            >

              {new Date(
                item.createdAt
              ).toLocaleDateString()}

            </Text>

          </View>

          <Text
            numberOfLines={2}
            style={styles.productTitle}
          >

            {item.items?.[0]?.title}

          </Text>

          {item.items?.length > 1 && (

            <Text
              style={styles.moreItems}
            >

              +{item.items.length - 1}
              more item

              {item.items.length > 2
                ? "s"
                : ""}

            </Text>

          )}
<View
style={styles.timeline}
>

<View
style={styles.timelineItem}
>

<View
style={[
styles.timelineDot,

status==="pending"&&
styles.timelineActive,

]}
/>

<Text
style={styles.timelineLabel}
>

Placed

</Text>

</View>

<View
style={styles.timelineLine}
/>

<View
style={styles.timelineItem}
>

<View
style={[
styles.timelineDot,

status!=="pending"&&
styles.timelineActive,

]}
/>

<Text
style={styles.timelineLabel}
>

Shipped

</Text>

</View>

<View
style={styles.timelineLine}
/>

<View
style={styles.timelineItem}
>

<View
style={[
styles.timelineDot,

status==="delivered"&&
styles.timelineActive,

]}
/>

<Text
style={styles.timelineLabel}
>

Delivered

</Text>

</View>

</View>
          <View
            style={styles.priceRow}
          >

            <View>

              <Text
                style={styles.metaLabel}
              >

                TOTAL

              </Text>

              <Text
                style={styles.totalPrice}
              >

                ₹{item.total}

              </Text>

            </View>

            <View>

              <Text
                style={styles.metaLabel}
              >

                ITEMS

              </Text>

              <Text
                style={styles.qtyText}
              >

                {qty}

              </Text>

            </View>

          </View>

          {/* ACTIONS */}

          <View
            style={styles.actionRow}
          >

            <TouchableOpacity

              style={styles.trackButton}

              onPress={() =>
                router.push({
                  pathname: "/track",
                  params: {
                    orderNumber: item.orderNumber,
                  },
                })
              }

            >

              <Ionicons

                name="location-outline"

                size={18}

                color="#111"

              />

         
             <Ionicons

name="cube-outline"

size={18}

color="#111"

/>

<Text
style={styles.trackButtonText}
>

TRACK PACKAGE

</Text>

          

            </TouchableOpacity>

            <TouchableOpacity

              style={styles.detailButton}

              onPress={() =>
                router.push({
                  pathname: "/order-details",
                  params: {
                    orderNumber: item.orderNumber,
                  },
                })
              }

            >

              <Ionicons

name="receipt-outline"

size={18}

color="#FFF"

/>

<Text
style={styles.detailButtonText}
>

ORDER DETAILS

</Text>

            </TouchableOpacity>

          </View>

        </View>

      </TouchableOpacity>
</Animated.View>
    );

  };


  const getCurrentStatus = (order: any) => {
    return order.orderStatus || "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return { color: "#22c55e" };
      case "cancelled":
      case "refunded":
        return { color: "#ef4444" };
      default:
        return { color: "#f59e0b" };
    }
  };
  const filteredOrders = orders.filter((order) => {
    const status = getCurrentStatus(order);

    if (tab === "completed") return status === "delivered";

    if (tab === "pending")
      return (
        status !== "delivered" &&
        status !== "cancelled" &&
        status !== "refunded"
      );

    if (tab === "cancelled")
      return status === "cancelled" || status === "refunded";

    return true;
  });
  const getStatusBg = (status: string) => {
    switch (status) {
      case "delivered":
        return { backgroundColor: "#ecfdf5" };
      case "cancelled":
        return { backgroundColor: "#fef2f2" };
      default:
        return { backgroundColor: "#fffbeb" };
    }
  };
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.hero}>

        <View style={styles.heroTop}>

          <TouchableOpacity

            style={styles.backButton}

            onPress={() => router.back()}

          >

            <Ionicons

              name="chevron-back"

              size={22}

              color="#111"

            />

          </TouchableOpacity>

          <TouchableOpacity>

            <Ionicons

              name="receipt-outline"

              size={24}

              color="#111"

            />

          </TouchableOpacity>

        </View>

        <Text style={styles.heroTitle}>

          MY ORDERS

        </Text>

        <Text style={styles.heroSubtitle}>

          Track every purchase,
          shipment and delivery.

        </Text>

        <View style={styles.heroAccent} />
<View style={styles.heroStatRow}>

<View style={styles.heroStat}>

<Text style={styles.heroNumber}>

{orders.length}

</Text>

<Text style={styles.heroLabel}>

Orders

</Text>

</View>

<View style={styles.heroDivider}/>

<View style={styles.heroStat}>

<Text style={styles.heroNumber}>

{

orders.filter(
o=>getCurrentStatus(o)==="delivered"
).length

}

</Text>

<Text style={styles.heroLabel}>

Delivered

</Text>

</View>

<View style={styles.heroDivider}/>

<View style={styles.heroStat}>

<Text style={styles.heroNumber}>

{

orders.filter(
o=>getCurrentStatus(o)!=="delivered"
).length

}

</Text>

<Text style={styles.heroLabel}>

Active

</Text>

</View>

</View>
      </View>

      <View style={styles.segment}>

        {[
          {
            key: "pending",
            label: "Pending",
          },

          {
            key: "completed",
            label: "Completed",
          },

          {
            key: "cancelled",
            label: "Cancelled",
          },

        ].map((t: any) => (

          <TouchableOpacity

            key={t.key}

            onPress={() =>
            {if(tab!==t.key){

setTab(t.key);

}}
            }

            style={[

              styles.segmentItem,

              tab === t.key &&
              styles.segmentActive,

            ]}

          >

            <Text
              style={[

                styles.segmentText,

                tab === t.key &&
                styles.segmentTextActive,

              ]}

            >

              {t.label}

            </Text>

          </TouchableOpacity>

        ))}

      </View>

      {orders.length === 0 ? (
     <View style={styles.emptyContainer}>

<View style={styles.emptyIcon}>

<Ionicons
name="cube-outline"
size={58}
color="#111"
/>

</View>

<Text
style={styles.emptyTitle}
>

NO ORDERS YET

</Text>

<Text
style={styles.emptySubtitle}
>

Looks like you haven't
placed your first order.

</Text>

<TouchableOpacity

style={styles.shopNowButton}

onPress={()=>
router.push("/")
}

>

<Text
style={styles.shopNowText}
>

START SHOPPING

</Text>

</TouchableOpacity>

</View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  hero: {

    paddingHorizontal: 22,

    paddingTop: 16,

    paddingBottom: 26,

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

  heroTitle: {

    marginTop: 30,

    fontSize: 42,

    fontWeight: "900",

    letterSpacing: 1,

    color: "#111",

  },

  heroSubtitle: {

    marginTop: 8,

    fontSize: 15,

    lineHeight: 24,

    color: "#777",

  },

  heroAccent: {

    marginTop: 18,

    width: 88,

    height: 6,

    borderRadius: 4,

    backgroundColor: "#B6FF2E",

  },

  segment: {

    marginHorizontal: 22,

    marginBottom: 22,

    backgroundColor: "#F5F5F5",

    borderRadius: 22,

    padding: 6,

    flexDirection: "row",

  },

  segmentItem: {

    flex: 1,

    height: 48,

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",

  },

  segmentActive: {

    backgroundColor: "#111",

  },

  segmentText: {

    fontSize: 13,

    fontWeight: "700",

    color: "#777",

  },

  segmentTextActive: {

    color: "#B6FF2E",

    fontWeight: "900",

  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: "#999",
  },

  lightText: {
    fontSize: 12,
    color: "#999", // light grey
  },

  darkText: {
    fontSize: 14,
    color: "#111", // dark
    fontWeight: "600",
  },

  summaryBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontWeight: "600",
  },

  status: {
    color: "#22c55e",
    fontSize: 12,
  },

  date: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: "500",
  },

  sub: {
    fontSize: 11,
    color: "#777",
  },

  price: {
    fontWeight: "600",
  },

  moreText: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  total: {
    marginTop: 10,
    fontWeight: "700",
  },

  view: {
    marginTop: 10,
    fontSize: 12,
    color: "#111",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  totalLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  trackBtn: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  trackText: {
    fontSize: 12,
    fontWeight: "600",
  },

  detailsBtn: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  detailsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
orderCard:{

marginBottom:34,

backgroundColor:"#FFF",

borderRadius:32,

overflow:"hidden",

shadowColor:"#000",

shadowOpacity:.08,

shadowRadius:22,

shadowOffset:{

width:0,

height:12,

},

elevation:12,

},

  orderImage: {

    width: "100%",

    height: 240,

    backgroundColor: "#F5F5F5",

  },

statusPill:{

position:"absolute",

top:18,

right:18,

paddingHorizontal:16,

paddingVertical:9,

borderRadius:30,

borderWidth:1,

borderColor:"rgba(255,255,255,.25)",

},
  statusPillText: {

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: .8,

  },

  orderContent: {

    padding: 22,

  },

  orderHeader: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  orderNumber: {

    fontSize: 15,

    fontWeight: "900",

    color: "#111",

  },

  orderDate: {

    fontSize: 12,

    color: "#888",

  },

  productTitle: {

    marginTop: 18,

    fontSize: 24,

    fontWeight: "900",

    lineHeight: 32,

    color: "#111",

  },

  moreItems: {

    marginTop: 10,

    fontSize: 14,

    color: "#777",

  },

  priceRow: {

    marginTop: 28,

    flexDirection: "row",

    justifyContent: "space-between",

  },

  metaLabel: {

    fontSize: 11,

    fontWeight: "800",

    letterSpacing: 1,

    color: "#999",

  },

  totalPrice: {

    marginTop: 6,

    fontSize: 28,

    fontWeight: "900",

    color: "#111",

  },

  qtyText: {

    marginTop: 6,

    fontSize: 28,

    fontWeight: "900",

    color: "#111",

  },

  actionRow: {

    marginTop: 30,

    flexDirection: "row",

  },

  trackButton: {

    flex: 1,

    height: 58,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  trackButtonText: {

    marginLeft: 8,

    fontWeight: "900",

    fontSize: 14,

    color: "#111",

    letterSpacing: .8,

  },

detailButton:{

flex:1,

marginLeft:14,

height:58,

borderRadius:18,

backgroundColor:"#111",

flexDirection:"row",

justifyContent:"center",

alignItems:"center",

},

  detailButtonText: {

    color: "#FFF",

    fontWeight: "900",

    fontSize: 14,

    letterSpacing: .8,

  },
  listContent:{

paddingHorizontal:22,

paddingBottom:220,

},

emptyContainer:{

flex:1,

justifyContent:"center",

alignItems:"center",

paddingHorizontal:40,

},

emptyIcon:{

width:120,

height:120,

borderRadius:60,

backgroundColor:"#F5F5F5",

justifyContent:"center",

alignItems:"center",

},

emptyTitle:{

marginTop:28,

fontSize:30,

fontWeight:"900",

letterSpacing:.8,

color:"#111",

},

emptySubtitle:{

marginTop:12,

fontSize:15,

lineHeight:24,

textAlign:"center",

color:"#777",

},

shopNowButton:{

marginTop:36,

height:58,

paddingHorizontal:34,

borderRadius:18,

backgroundColor:"#B6FF2E",

justifyContent:"center",

alignItems:"center",

},

shopNowText:{

fontSize:14,

fontWeight:"900",

letterSpacing:1,

color:"#111",

},
heroStatRow:{

marginTop:30,

height:90,

backgroundColor:"#111",

borderRadius:28,

flexDirection:"row",

alignItems:"center",

},

heroStat:{

flex:1,

justifyContent:"center",

alignItems:"center",

},

heroDivider:{

width:1,

height:42,

backgroundColor:"rgba(255,255,255,.08)",

},

heroNumber:{

fontSize:28,

fontWeight:"900",

color:"#B6FF2E",

},

heroLabel:{

marginTop:6,

fontSize:12,

fontWeight:"700",

letterSpacing:.8,

color:"#FFF",

},
timeline:{

marginTop:22,

flexDirection:"row",

alignItems:"center",

justifyContent:"space-between",

},

timelineItem:{

alignItems:"center",

},

timelineDot:{

width:16,

height:16,

borderRadius:8,

backgroundColor:"#DDD",

},

timelineActive:{

backgroundColor:"#B6FF2E",

},

timelineLine:{

flex:1,

height:2,

backgroundColor:"#E7E7E7",

marginHorizontal:8,

},

timelineLabel:{

marginTop:8,

fontSize:11,

fontWeight:"700",

color:"#888",

letterSpacing:.5,

},
});
