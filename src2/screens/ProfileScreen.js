import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const go = (screen) => navigation.navigate(screen);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* --- HEADER SECTION --- */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>
          {user ? `Hey, ${user.firstName || "User"}` : "Welcome"}
        </Text>
        <Text style={styles.subTitle}>
          {user
            ? "Manage your account & orders"
            : "Track orders or sign in to access your account"}
        </Text>
      </View>

            {/* --- ACCOUNT SECTION --- */}
      <Section title="Account">
        {user ? (
          <>
            <Item icon="person-outline" label="Profile Details" />
            <Item icon="heart-outline" label="Wishlist" onPress={() => go("FavoritesScreen")} />
            <Item icon="map-outline" label="Saved Addresses" />
            <Item icon="card-outline" label="Payments" />
          </>
        ) : (
          <Item icon="log-in-outline" label="Sign in / Create Account" onPress={() => go("Auth")} />
        )}
      </Section>

      {/* --- ORDER SECTION --- */}
      <Section title="Orders">
        <Item icon="cube-outline" label="My Orders" onPress={() => go("OrdersScreen")} />
        <Item icon="location-outline" label="Track Order" onPress={() => go("TrackOrderScreen")} />
        <Item icon="location-outline" label="Return/Exchange" onPress={() => go("ReturnScreen")} />
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
        <Item icon="help-circle-outline" label="Help Center" />
        <Item icon="chatbubble-ellipses-outline" label="Contact Support" />
        <Item icon="information-circle-outline" label="Terms & Policies" />
      </Section>

      {/* --- FOOTER ACTIONS --- */}
      <View style={{ height: 10 }} />
      {user ? (
        <FooterButton label="Logout" icon="log-out-outline" onPress={logout} />
      ) : (
        <FooterButton label="Login / Signup" icon="log-in-outline" onPress={() => go("Auth")} />
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/* --- REUSABLE COMPONENTS --- */

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const Item = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#111" />
    <Text style={styles.rowLabel}>{label}</Text>
    <MaterialIcons name="keyboard-arrow-right" size={22} color="#111" />
  </TouchableOpacity>
);

const FooterButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.footerBtn} activeOpacity={0.7} onPress={onPress}>
    <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 6 }} />
    <Text style={styles.footerBtnText}>{label}</Text>
  </TouchableOpacity>
);

/* --- STYLES --- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  /* header */
  headerBox: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
  },
  subTitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 6,
    maxWidth: width * 0.8,
  },

  /* generic section */
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
    opacity: 0.6,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  /* row */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
    color: "#111",
  },

  /* footer button */
  footerBtn: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  footerBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
