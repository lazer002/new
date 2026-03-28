import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import api from "@/utils/config";

/* ---------- TYPES ---------- */

type Item = {
  _id: string;
  title: string;
  mainImage: string;
  quantity: number;
  variant?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  items: Item[];
};

/* ---------- CONSTANT ---------- */

const ACTIONS = ["return", "exchange"] as const;

const RETURN_REASONS = [
  "Wrong item delivered",
  "Damaged product",
  "Quality not good",
  "Changed mind",
];

const EXCHANGE_REASONS = [
  "Size issue",
  "Wrong item",
  "Damaged product",
];

const getReasons = (action: string) =>
  action === "exchange" ? EXCHANGE_REASONS : RETURN_REASONS;

/* ---------- COMPONENT ---------- */

export default function ReturnExchangeScreen() {
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [selected, setSelected] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [openReason, setOpenReason] = useState<string | null>(null);

  /* ---------- FETCH ORDER ---------- */

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders/track", {
        params: { orderNumber, email },
      });
      setOrder(res.data.order);
      setStep(2);
    } catch {
      Toast.show({ type: "error", text1: "Order not found" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- TOGGLE ITEM ---------- */

  const toggleItem = (item: Item) => {
    setSelected((prev) => {
      if (prev[item._id]) {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      }
      return {
        ...prev,
        [item._id]: {
          action: "return",
          reason: "",
          note: "",
          images: [],
        },
      };
    });
  };

  /* ---------- IMAGE PICK ---------- */

  const pickImage = async (itemId: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uris = result.assets.map((a) => a.uri);

      setSelected((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          images: [...(prev[itemId]?.images || []), ...uris],
        },
      }));
    }
  };

  /* ---------- SUBMIT ---------- */

const submit = async () => {
  if (!order) return;

  try {
    setLoading(true);

    const perItemUploaded: Record<string, string[]> = {};
    const itemIds = Object.keys(selected || {});

    /* ---------- UPLOAD IMAGES ---------- */
    for (const itemId of itemIds) {
      perItemUploaded[itemId] = [];

      const images = selected[itemId]?.images || [];

      for (const uri of images) {
        const formData = new FormData();

        formData.append("file", {
          uri,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);

        const res = await api.post("api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res?.data?.url) perItemUploaded[itemId].push(res.data.url);
        else if (res?.data?.path) perItemUploaded[itemId].push(res.data.path);
        else if (res?.data?.publicUrl) perItemUploaded[itemId].push(res.data.publicUrl);
      }
    }

    /* ---------- BUILD ITEMS ---------- */
    const payloadItems = itemIds.map((itemId) => {
      const it =
        (order?.items || []).find((o) => o._id === itemId) || {};

      return {
        orderItemId: itemId,
        productId: (it as any)?.productId || itemId, // ⚠️ adjust if needed
        qty: 1,

        action: selected[itemId]?.action || "return",
        reason: selected[itemId]?.reason || "",
        exchangeSize: selected[itemId]?.exchangeSize || null,
        details: selected[itemId]?.note || "",

        photos: perItemUploaded[itemId] || [],

        title: (it as any)?.title || "",
        variant: (it as any)?.variant || "",
        price: Number((it as any)?.price || 0),
      };
    });

    /* ---------- FINAL PAYLOAD ---------- */
    const payload = {
      orderId: order?._id,
      orderNumber: order?.orderNumber,
      guestEmail: email || null,
      items: payloadItems,
    };

    console.log("FINAL PAYLOAD:", payload);

    const { data } = await api.post("/api/returns", payload);

    if (data?.success) {
      Toast.show({
        type: "success",
        text1: "Return request created",
      });

      setStep(3);
    } else {
      Toast.show({
        type: "error",
        text1: data?.message || "Failed",
      });
    }
  } catch (err: any) {
    console.log("ERROR:", err?.response?.data || err.message);

    Toast.show({
      type: "error",
      text1: err?.response?.data?.message || "Error creating return",
    });
  } finally {
    setLoading(false);
  }
};

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Returns</Text>
        <Text style={styles.subHeader}>Easy returns & exchanges</Text>

        {/* STEP 1 */}
        {step === 1 && (
          <View style={styles.card}>
            <TextInput
              placeholder="Order Number"
              style={styles.input}
              value={orderNumber}
              onChangeText={setOrderNumber}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.btn} onPress={fetchOrder}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Find Order</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && order && (
          <>
            {order.items.map((item) => {
              const active = !!selected[item._id];

              return (
                <View key={item._id} style={styles.card}>
                  {/* PRODUCT */}
                  <TouchableOpacity
                    onPress={() => toggleItem(item)}
                    style={styles.row}
                  >
                    <Image
                      source={{ uri: item.mainImage }}
                      style={styles.img}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.meta}>
                        Qty {item.quantity} • {item.variant}
                      </Text>
                    </View>

                    <View style={styles.checkbox}>
                      {active && <View style={styles.checkboxFill} />}
                    </View>
                  </TouchableOpacity>

                  {/* DETAILS */}
                  {active && (
                    <View style={{ marginTop: 12 }}>
                      {/* ACTION */}
                      <Text style={styles.label}>Action</Text>
                      <View style={styles.rowWrap}>
                        {ACTIONS.map((a) => (
                          <TouchableOpacity
                            key={a}
                            style={[
                              styles.chip,
                              selected[item._id].action === a &&
                                styles.chipActive,
                            ]}
                            onPress={() =>
                              setSelected((p) => ({
                                ...p,
                                [item._id]: {
                                  ...p[item._id],
                                  action: a,
                                  reason: "",
                                },
                              }))
                            }
                          >
                            <Text
                              style={{
                                color:
                                  selected[item._id].action === a
                                    ? "#fff"
                                    : "#333",
                              }}
                            >
                              {a}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* DROPDOWN */}
                      <Text style={styles.label}>Reason</Text>
                      <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() =>
                          setOpenReason(
                            openReason === item._id ? null : item._id
                          )
                        }
                      >
                        <Text>
                          {selected[item._id].reason || "Select reason"}
                        </Text>
                      </TouchableOpacity>

                      {openReason === item._id && (
                        <View style={styles.dropdownList}>
                          {getReasons(selected[item._id].action).map((r) => (
                            <TouchableOpacity
                              key={r}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setSelected((p) => ({
                                  ...p,
                                  [item._id]: {
                                    ...p[item._id],
                                    reason: r,
                                  },
                                }));
                                setOpenReason(null);
                              }}
                            >
                              <Text>{r}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* NOTE */}
                      <TextInput
                        placeholder="Additional details (optional)"
                        style={styles.textArea}
                        multiline
                        onChangeText={(t) =>
                          setSelected((p) => ({
                            ...p,
                            [item._id]: {
                              ...p[item._id],
                              note: t,
                            },
                          }))
                        }
                      />

                      {/* IMAGE */}
                      <TouchableOpacity
                        style={styles.upload}
                        onPress={() => pickImage(item._id)}
                      >
                        <Text>Add Photos</Text>
                      </TouchableOpacity>

                      {/* IMAGE PREVIEW */}
                      {selected[item._id]?.images?.length > 0 && (
                        <ScrollView horizontal>
                          {selected[item._id].images.map(
                            (img: string, i: number) => (
                              <Image
                                key={i}
                                source={{ uri: img }}
                                style={styles.previewImg}
                              />
                            )
                          )}
                        </ScrollView>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={styles.btn} onPress={submit}>
              <Text style={styles.btnText}>Submit Request</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View style={styles.center}>
            <Text style={styles.success}>Request Submitted 🎉</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f6f7" },
  container: { padding: 16 },

  header: { fontSize: 28, fontWeight: "700", color: "#111" },
  subHeader: { fontSize: 13, color: "#777", marginBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  btn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "600" },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap" },

  img: { width: 64, height: 64, borderRadius: 14 },

  title: { fontSize: 15, fontWeight: "600", color: "#111" },
  meta: { fontSize: 12, color: "#888" },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxFill: {
    width: 12,
    height: 12,
    backgroundColor: "#111",
  },

  label: { marginTop: 10, fontSize: 12, color: "#555" },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    marginRight: 8,
    marginTop: 8,
  },

  chipActive: { backgroundColor: "#111" },

  dropdown: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    marginTop: 6,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fafafa",
  },

  upload: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },

  previewImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 10,
  },

  center: { alignItems: "center", marginTop: 40 },
  success: { fontSize: 18, fontWeight: "600" },
});