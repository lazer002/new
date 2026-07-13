import React, { useContext ,useEffect, useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Screen from "@/components/Screen";
import { api } from "@/utils/config";
import Toast from "react-native-toast-message";
import { useWishlist } from "@/context/WishlistContext";

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const router = useRouter();
  const { wishlist } = useWishlist();
  const { user, logout,guestId, loading } = useAuth()
const [activeOrderCount, setActiveOrderCount] = useState(0);
const openWhatsApp = async () => {
  console.log("Opening WhatsApp with support number");

  const phone = "919315076712";

  const message = `Hi, I need help with my order.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  try {
    await Linking.openURL(url); // 🔥 directly open
  } catch (err) {
    console.log(err);

    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Unable to open WhatsApp",
    });
  }
};

useEffect(() => {
  if (!user) {
    setActiveOrderCount(0); // ✅ reset badge
  }
}, [user]);

useEffect(() => {
  const loadOrders = async () => {
    try {

      if (!user && !guestId) {
        setActiveOrderCount(0);
        return;
      }

      const res = await api.get("/api/orders/mine");

      const orders = res.data.orders || [];

      const activeStatuses = [
        "pending",
        "confirmed",
        "dispatched",
        "shipped",
        "out for delivery",
      ];

      const activeCount = orders.filter((o: any) =>
        activeStatuses.includes(
          (o.orderStatus || "").toLowerCase()
        )
      ).length;

      setActiveOrderCount(activeCount);
    } catch (err) {
      console.log("Order count error", err);
    }
  };

  loadOrders();
}, [user, guestId]); // ✅ important

  const go = (path: string) => router.push(path);


console.log("Profile render", wishlist.length ,user);
  return (
    <Screen>
      <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40 }}
  >
 {/* ================= HERO ================= */}

<View style={styles.hero}>

  <View style={styles.heroTop}>

    <View>

      <Text style={styles.brandLabel}>
        GARRIB
      </Text>

      <Text style={styles.heroTitle}>
        {user
          ? `Hello, ${user.name?.split(" ")[0]}`
          : "Welcome"}
      </Text>

      <Text style={styles.heroSubtitle}>
        {user
          ? "Minimal Luxury • Premium Streetwear"
          : "Sign in to unlock your premium experience"}
      </Text>

    </View>

    <TouchableOpacity
      style={styles.settingsButton}
      onPress={() => go("/(tabs)")}
    >

      <Ionicons
        name="home-outline"
        size={22}
        color="#B6FF2E"
      />

    </TouchableOpacity>

  </View>

  {/* PREMIUM MEMBER CARD */}

  <View style={styles.memberCard}>

    <View style={styles.memberTop}>

      <View>

        <Text style={styles.memberTitle}>
          {user ? "PREMIUM MEMBER" : "GUEST MODE"}
        </Text>

        <Text style={styles.memberName}>
          {user
            ? user.email
            : "Browse without an account"}
        </Text>

      </View>

      <View style={styles.memberBadge}>
        <View style={styles.memberDot} />

        <Text style={styles.memberBadgeText}>
          ACTIVE
        </Text>
      </View>

    </View>

    <View style={styles.statsRow}>

      <TouchableOpacity
        style={styles.statCard}
        activeOpacity={0.9}
        onPress={() => go("/orders")}
      >

        <Text style={styles.statNumber}>
          {activeOrderCount}
        </Text>

        <Text style={styles.statLabel}>
          ACTIVE{"\n"}ORDERS
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statCard}
        activeOpacity={0.9}
        onPress={() => go("/wishlist")}
      >

        <Ionicons
          name="heart-outline"
          size={24}
          color="#111"
        />

        <Text style={styles.statLabel}>
          WISHLIST
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statCard}
        activeOpacity={0.9}
        onPress={() => go("/savedAddresses")}
      >

        <Ionicons
          name="location-outline"
          size={24}
          color="#111"
        />

        <Text style={styles.statLabel}>
          ADDRESSES
        </Text>

      </TouchableOpacity>

    </View>

  </View>

</View>


      {/* --- ACCOUNT SECTION --- */}
      <Section title="ACCOUNT">
        {user ? (
          <>
            <Item icon="person-outline" label="Profile Details" onPress={() => go("/profile/details")} />
            <Item
              icon="heart-outline"
              label="Wishlist"
              badge={wishlist.length}
              onPress={() => go("/wishlist")}
            />
            <Item icon="map-outline" label="Saved Addresses" onPress={() => go("/savedAddresses")} />
            <Item icon="card-outline" label="Payments" />
          </>
        ) : (
          <Item
            icon="log-in-outline"
            label="Sign in / Create Account"
            onPress={() => go("/login")}
          />
        )}
      </Section>

      {/* --- ORDER SECTION --- */}
      <Section title="Orders">
  <View >
  <Item
    icon="cube-outline"
    label="My Orders"
      badge={activeOrderCount}
    onPress={() => go("/orders")}
  />
  {/* <Badge count={activeOrderCount} /> */}
</View>
        <Item
          icon="location-outline"
          label="Track Order"
          onPress={() => go("/track")}
        />
        <Item
          icon="refresh-outline"
          label="Return/Exchange"
          onPress={() => go("/returns")}
        />
      </Section>

      {/* --- SHOP SECTION --- */}
      {user && (
        <Section title="Shopping">
          <Item icon="pricetags-outline" label="Coupons & Offers" />
          <Item icon="bookmark-outline" label="Saved for Later" />
        </Section>
      )}

      {/* --- SUPPORT SECTION --- */}
      <Section title="Support">
        <Item icon="help-circle-outline" label="Help Center" onPress={() => go("profile/help")} />
        <Item icon="chatbubble-ellipses-outline" label="Contact Support" onPress={() => openWhatsApp()} />
        <Item
          icon="information-circle-outline"
          label="Terms & Policies"
          onPress={() => go("profile/terms")}
        />
      </Section>

      {/* --- FOOTER ACTIONS --- */}
      <View style={{ height: 10 }} />

      {user ? (
        <FooterButton
          label="Logout"
          icon="log-out-outline"
          onPress={async () => {
            await logout();
            setActiveOrderCount(0);
          }}
        />
      ) : (
        <FooterButton
          label="Login / Signup"
          icon="log-in-outline"
          onPress={() => go("/login")}
        />
      )}

      <View style={{ height: 130 }} />
      </ScrollView>
    </Screen>
  );
}

/* --- REUSABLE COMPONENTS --- */

/* ================= PREMIUM COMPONENTS ================= */

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>

    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

const Item = ({
  icon,
  label,
  onPress,
  badge,
}: any) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.item}
    onPress={onPress}
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon as any}
          size={20}
          color="#111"
        />
      </View>

      <Text style={styles.itemText}>
        {label}
      </Text>
    </View>

    <View style={styles.itemRight}>

  {(label === "My Orders" || label === "Wishlist") &&
  badge > 0 && (
    <View style={styles.orderBadge}>
      <Text style={styles.orderBadgeText}>
        {badge > 9 ? "9+" : badge}
      </Text>
    </View>
)}

      <View style={styles.arrowWrap}>
        <Ionicons
          name="arrow-forward"
          size={18}
          color="#111"
        />
      </View>

    </View>
  </TouchableOpacity>
);

const FooterButton = ({
  label,
  icon,
  onPress,

}: any) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.logoutButton}
    onPress={onPress}
  >
    <Ionicons
      name={icon as any}
      size={20}
      color="#111"
    />

    <Text style={styles.logoutText}>
      {label}
    </Text>

    <View style={styles.logoutArrow}>
      <Ionicons
        name="arrow-forward"
        size={18}
        color="#111"
      />
    </View>
  </TouchableOpacity>
);




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },

  /* ================= HERO ================= */

  hero: {
    marginHorizontal: 10,
    marginTop: 18,
    marginBottom: 28,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  brandLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#777",
  },

  heroTitle: {
    marginTop: 12,
    fontSize: 38,
    fontWeight: "900",
    color: "#111",
    letterSpacing: -.8,
  },

  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },

  settingsButton: {
    width: 52,
    height: 52,
    borderRadius: 26,

    backgroundColor: "#111",

    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= MEMBER CARD ================= */

  memberCard: {
    backgroundColor: "#111",

    borderRadius: 30,

    padding: 24,

    shadowColor: "#000",
    shadowOpacity: .18,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  memberTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 24,
  },

  memberTitle: {
    color: "#B6FF2E",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2,
  },

  memberName: {
    color: "#FFF",
    marginTop: 8,
    fontSize: 15,
    opacity: .8,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,.08)",

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 50,
  },

  memberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B6FF2E",
    marginRight: 8,
  },

  memberBadgeText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1.4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "31%",

    backgroundColor: "#FFF",

    borderRadius: 20,

    paddingVertical: 22,

    alignItems: "center",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
  },

  statLabel: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    lineHeight: 16,
  },

  /* ================= SECTION ================= */

  section: {
    marginHorizontal: 10,
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionAccent: {
    width: 5,
    height: 18,
    borderRadius: 3,
    backgroundColor: "#B6FF2E",
    marginRight: 10,
  },

  sectionTitle: {
    color: "#111",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 2,
  },

  sectionCard: {
    backgroundColor: "#FFF",

    borderRadius: 24,

    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: .06,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  /* ================= ITEM ================= */

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,
    paddingVertical: 18,

    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconWrap: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 16,
  },

  itemText: {
    flex: 1,

    color: "#111",

    fontSize: 15,
    fontWeight: "800",
  },

  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },

orderBadge: {
  minWidth: 26,
  height: 26,

  backgroundColor: "#B6FF2E",

  borderRadius: 13,

  justifyContent: "center",
  alignItems: "center",

  paddingHorizontal: 8,

  marginRight: 10,
},

orderBadgeText: {
  color: "#111",

  fontSize: 11,

  fontWeight: "900",

  includeFontPadding: false,

  textAlign: "center",

  lineHeight: 13,
},

  arrowWrap: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",
    alignItems: "center",
  },
    /* ================= LOGOUT ================= */

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,

    height: 64,

    backgroundColor: "#B6FF2E",

    borderRadius: 22,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 22,

    shadowColor: "#B6FF2E",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  logoutText: {
    flex: 1,

    marginLeft: 14,

    color: "#111",

    fontSize: 15,
    fontWeight: "900",

    letterSpacing: 1.4,
  },

  logoutArrow: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= ACTIVE BADGE ================= */

  badge: {
    position: "absolute",
    right: 58,
    top: 20,

    minWidth: 22,
    height: 22,

    borderRadius: 11,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#B6FF2E",

    paddingHorizontal: 7,
  },

  badgeText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 10,
  },

  /* ================= OPTIONAL ================= */

  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 18,
  },

  caption: {
    color: "#777",
    fontSize: 13,
    lineHeight: 22,
  },

  /* ================= REMOVE OLD LOOK ================= */

  headerBox: {
    display: "none",
  },

  title: {
    display: "none",
  },

  subTitle: {
    display: "none",
  },

  card: {
    display: "none",
  },

  row: {
    display: "none",
  },

  rowLabel: {
    display: "none",
  },

  footerBtn: {
    display: "none",
  },

  footerBtnText: {
    display: "none",
  },
});
