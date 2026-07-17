import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "@/utils/config";
import Toast from "react-native-toast-message";

type Address = {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
};

const LIME = "#B6FF2E";
const BLACK = "#111111";
const MUTED = "#777777";
const SOFT = "#F5F5F5";

export default function SavedAddresses() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ---------- FETCH ---------- */

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/address");

      const list = res.data.addresses || [];
      setAddresses(list);

      const defaultAddr = list.find((a: Address) => a.isDefault);

      if (defaultAddr) {
        setSelectedId(defaultAddr._id);
      }
    } catch (err) {
      console.log("Address fetch error", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ---------- SELECT ---------- */

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  /* ---------- DELETE ---------- */

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/address/${id}`);

      setAddresses((prev) =>
        prev.filter((a) => a._id !== id)
      );

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  /* ---------- DELIVER HERE ---------- */

  const handleDeliver = async () => {
    if (!selectedId) return;

    try {
      await api.put(`/api/address/${selectedId}`, {
        isDefault: true,
      });

      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a._id === selectedId,
        }))
      );

      Toast.show({
        type: "success",
        text1: "Delivery address updated!",
      });
    } catch (err) {
      console.log("Deliver error", err);
    }
  };

  /* ---------- RENDER ADDRESS ---------- */

  const renderItem = ({ item }: { item: Address }) => {
    const selected = selectedId === item._id;

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => handleSelect(item._id)}
        style={[
          styles.card,
          selected && styles.selectedCard,
        ]}
      >
        {/* CARD TOP */}

        <View style={styles.cardTop}>
          <View
            style={[
              styles.locationIcon,
              selected && styles.selectedLocationIcon,
            ]}
          >
            <Ionicons
              name="location-outline"
              size={21}
              color={BLACK}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelect(item._id)}
            style={[
              styles.radio,
              selected && styles.radioSelected,
            ]}
          >
            {selected && <View style={styles.radioInner} />}
          </TouchableOpacity>
        </View>

        {/* USER */}

        <Text style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.phone}>
          {item.phone}
        </Text>

        {/* ADDRESS */}

        <Text style={styles.address}>
          {item.address}
        </Text>

        <Text style={styles.meta}>
          {item.city}, {item.state} — {item.zip}
        </Text>

        {/* DEFAULT */}

        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <View style={styles.defaultDot} />

            <Text style={styles.defaultText}>
              DEFAULT ADDRESS
            </Text>
          </View>
        )}

        {/* DIVIDER */}

        <View style={styles.divider} />

        {/* ACTIONS */}

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/profile/addaddress",
                params: {
                  id: item._id,
                },
              })
            }
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={BLACK}
            />

            <Text style={styles.actionText}>
              EDIT
            </Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.actionButton}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color="#D92D20"
            />

            <Text style={styles.deleteText}>
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ---------- HEADER ---------- */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={BLACK}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>
            YOUR ACCOUNT
          </Text>

          <Text style={styles.title}>
            Addresses
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerAdd}
          onPress={() =>
            router.push("/profile/addaddress")
          }
        >
          <Ionicons
            name="add"
            size={23}
            color={BLACK}
          />
        </TouchableOpacity>
      </View>

      {/* ---------- COUNT ---------- */}

      {addresses.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            SAVED ADDRESSES
          </Text>

          <Text style={styles.count}>
            {String(addresses.length).padStart(2, "0")}
          </Text>
        </View>
      )}

      {/* ---------- LIST ---------- */}

      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          addresses.length === 0 &&
            styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={36}
                color={BLACK}
              />
            </View>

            <Text style={styles.emptyTitle}>
              NO ADDRESSES YET
            </Text>

            <Text style={styles.emptyDescription}>
              Add a delivery address to make your
              checkout experience faster.
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.emptyButton}
              onPress={() =>
                router.push("/profile/addaddress")
              }
            >
              <Text style={styles.emptyButtonText}>
                ADD ADDRESS
              </Text>

              <View style={styles.emptyArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={BLACK}
                />
              </View>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ---------- BOTTOM BAR ---------- */}

      {addresses.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.addButton}
            onPress={() =>
              router.push("/profile/addaddress")
            }
          >
            <Ionicons
              name="add"
              size={20}
              color={BLACK}
            />

            <Text style={styles.addButtonText}>
              ADD NEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={selectedId ? 0.9 : 1}
            disabled={!selectedId}
            style={[
              styles.deliverButton,
              !selectedId &&
                styles.deliverButtonDisabled,
            ]}
            onPress={handleDeliver}
          >
            <Text
              style={[
                styles.deliverText,
                !selectedId &&
                  styles.deliverTextDisabled,
              ]}
            >
              DELIVER HERE
            </Text>

            <View
              style={[
                styles.arrowButton,
                !selectedId &&
                  styles.arrowButtonDisabled,
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={18}
                color={selectedId ? BLACK : "#999"}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },

  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: MUTED,
    marginBottom: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: BLACK,
  },

  headerAdd: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: MUTED,
  },

  count: {
    fontSize: 12,
    fontWeight: "700",
    color: BLACK,
  },

  /* LIST */

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* CARD */

  card: {
    backgroundColor: "#F8F8F8",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  selectedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: BLACK,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedLocationIcon: {
    backgroundColor: LIME,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: BLACK,
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: LIME,

  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: BLACK,
  },

  phone: {
    fontSize: 12,
    fontWeight: "500",
    color: MUTED,
    marginTop: 3,
  },

  address: {
    fontSize: 14,
    lineHeight: 21,
    color: "#333333",
    marginTop: 14,
  },

  meta: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },

  /* DEFAULT BADGE */

  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EBFFD0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 15,
  },

  defaultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLACK,
    marginRight: 6,
  },

  defaultText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: BLACK,
  },

  /* ACTIONS */

  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 17,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionDivider: {
    width: 1,
    height: 15,
    backgroundColor: "#DDDDDD",
    marginHorizontal: 18,
  },

  actionText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: BLACK,
  },

  deleteText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#D92D20",
  },

  /* BOTTOM */

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    gap: 10,
  },

  addButton: {
    height: 58,
    paddingHorizontal: 18,
    borderRadius: 29,
    backgroundColor: SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  addButtonText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: BLACK,
  },

  deliverButton: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: BLACK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 22,
    paddingRight: 7,
  },

  deliverButtonDisabled: {
    backgroundColor: "#EAEAEA",
  },

  deliverText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  deliverTextDisabled: {
    color: "#999999",
  },

  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowButtonDisabled: {
    backgroundColor: "#DDDDDD",
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: BLACK,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 280,
  },

  emptyButton: {
    height: 56,
    backgroundColor: BLACK,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 6,
    marginTop: 28,
    gap: 20,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  emptyArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
  },
});