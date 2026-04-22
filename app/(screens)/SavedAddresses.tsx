
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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

      // 🔥 auto select default
      const defaultAddr = list.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedId(defaultAddr._id);

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

      // 🔥 instant UI update
      setAddresses((prev) => prev.filter((a) => a._id !== id));

      // reset selection if deleted
      if (selectedId === id) setSelectedId(null);

    } catch (err) {
      console.log("Delete error", err);
    }
  };

  /* ---------- DELIVER HERE ---------- */

  const handleDeliver = async () => {
    try {
      await api.put(`/api/address/${selectedId}`, {
        isDefault: true,
      });

      // 🔥 update UI
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

  /* ---------- RENDER ITEM ---------- */

  const renderItem = ({ item }: { item: Address }) => {
    const selected = selectedId === item._id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleSelect(item._id)}
        style={[styles.card, selected && styles.selectedCard]}
      >
        {/* TOP ROW */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {item.name} • {item.phone}
            </Text>

            <Text style={styles.address}>
              {item.address}, {item.city}
            </Text>

            <Text style={styles.meta}>
              {item.state} - {item.zip}
            </Text>
          </View>

          <Ionicons
            name={selected ? "radio-button-on" : "radio-button-off"}
            size={22}
            color={selected ? "#111" : "#aaa"}
          />
        </View>

        {/* BADGE */}
        {item.isDefault && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Default</Text>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/addaddress",
                params: { id: item._id }, // 🔥 FIXED
              })
            }
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={[styles.actionText, { color: "#ff3b30" }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Saved Addresses</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* LIST */}
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/addaddress")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>Add New Address</Text>
      </TouchableOpacity>

      {/* CONTINUE */}
      {selectedId && (
        <TouchableOpacity style={styles.continueBtn} onPress={handleDeliver}>
          <Text style={styles.continueText}>Deliver Here</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* 🎨 STYLES SAME AS YOURS */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },

  selectedCard: {
    borderColor: "#111",
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontWeight: "600",
    fontSize: 14,
  },

  address: {
    marginTop: 4,
    color: "#444",
  },

  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },

  badge: {
    marginTop: 10,
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
  },

  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },

  actionText: {
    fontSize: 13,
    color: "#111",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },

  continueBtn: {
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

