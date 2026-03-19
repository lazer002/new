import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/config";
import Toast from "react-native-toast-message"
import { getAddressFromPincode } from "@/utils/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
/* ================= TYPES ================= */

type PaymentMethod = "cod" | "razorpay";

type Address = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type OrderItem = {
  productId: string | null;
  bundleId: string | null;
  title: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
  mainImage?: string;
  bundleProducts: {
    productId: string;
    title: string;
    variant: string;
    quantity: number;
    price: number;
    mainImage: string;
  }[];
};

/* ================= SCREEN ================= */

export default function CheckoutScreen() {

  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const gid = await AsyncStorage.getItem("ds_guest");
      setGuestId(gid);
    })();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
    }
  }, [items]);

  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState<boolean>(false);

  /* ---------- PRICE ---------- */

  const subtotal = useMemo<number>(() => {
    return items.reduce((sum: number, it: any) => {
      if (it.bundle) return sum + it.bundle.price * it.quantity;
      return sum + it.product.price * it.quantity;
    }, 0);
  }, [items]);

  const shipping: number = subtotal > 500 ? 0 : 50;
  const total: number = subtotal + shipping;
  const savings = shipping === 0 ? 50 : 0;

  /* ---------- ORDER ITEMS ---------- */

  const orderItems = useMemo<OrderItem[]>(() => {
    return items.map((it: any) => {
      if (it.bundle) {
        return {
          bundleId: it.bundle._id,
          productId: null,
          title: it.bundle.title,
          quantity: it.quantity,
          price: it.bundle.price,
          total: it.bundle.price * it.quantity,
          mainImage: it.mainImage,
          bundleProducts: it.bundleProducts.map((bp: any) => ({
            productId: bp.product._id,
            title: bp.product.title,
            variant: `Size: ${bp.size}`,
            quantity: bp.quantity,
            price: bp.product.price,
            mainImage: bp.product.images?.[0] ?? "",
          })),
        };
      }

      return {
        productId: it.product._id,
        bundleId: null,
        title: it.product.title,
        variant: `Size: ${it.size}`,
        quantity: it.quantity,
        price: Number(it.product.price),
        total: it.product.price * it.quantity,
        mainImage: it.product.images?.[0] ?? "",
        bundleProducts: [],
      };
    });
  }, [items]);
  /* ---------- PLACE ORDER ---------- */

  const placeOrder = async (): Promise<void> => {

    if (
      !address.firstName ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.zip ||
      !email
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
      });
      return;
    }

    if (address.phone.length !== 10) {
      Toast.show({ type: "error", text1: "Invalid phone number" });
      return;
    }

    if (!user && !guestId) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/orders/create", {
        items: orderItems,
        subtotal,
        shipping,
        total,
        shippingMethod: "standard",
        billingSame: true,
        shippingAddress: address,
        contactEmail: email,
        paymentMethod,
        source: "mobile",
        userId: user?._id || null,
        guestId: user ? null : guestId,
        userType: user ? "user" : "guest",
      } , {
    headers: {
      "x-guest-id": guestId || "",
    },
  }
    );


    

      if (paymentMethod === "razorpay") {
        router.push({
          pathname: "/razorpay",
          params: { orderId: res.data._id },
        });
      } else {
  const existing = await AsyncStorage.getItem("orders");

let orders = [];

if (existing) {
  orders = JSON.parse(existing);
}

// add new order on top
orders.unshift({
  orderId: res.data._id,
  orderNumber: res.data.orderNumber,
  phone: address.phone,
  email,
  createdAt: new Date().toISOString(),
});

// optional: keep only last 5 orders
orders = orders.slice(0, 5);

await AsyncStorage.setItem("orders", JSON.stringify(orders));
        await clearCart();
        router.replace({
          pathname: "/order-success",
          params: {
            orderNumber: res.data.orderNumber,
            email,
          },
        });
      }
    } catch (err: any) {
      console.log("Order error:", err);
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to place order. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        {/* BACK */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>

        {/* TITLE */}
        <Text style={styles.headerTitle}>Checkout</Text>

        {/* PLP / SHOP */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push("/")}
        >
          <Ionicons name="grid-outline" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ADDRESS */}
        <Card title="Delivery Address">
          <Row>
            <Input
              placeholder="First Name*"
              value={address.firstName}
              onChange={(v: string) =>
                setAddress({ ...address, firstName: v })
              }
            />
            <Input
              placeholder="Last Name"
              value={address.lastName}
              onChange={(v: string) =>
                setAddress({ ...address, lastName: v })
              }
            />
          </Row>

          <Input
            placeholder="Phone*"
            keyboardType="phone-pad"
            value={address.phone}
            maxLength={10}
            onChange={(v: string) => {
              // allow only numbers + max 10 digits
              const cleaned = v.replace(/[^0-9]/g, "").slice(0, 10);

              setAddress({ ...address, phone: cleaned });
            }}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(v: string) => setEmail(v)}
          />

          <Input
            placeholder="Address*"
            value={address.address}
            onChange={(v: string) =>
              setAddress({ ...address, address: v })
            }
          />

          <Input
            placeholder="Apartment (optional)"
            value={address.apartment}
            onChange={(v: string) =>
              setAddress({ ...address, apartment: v })
            }
          />

          <Row>
            <Input
              placeholder="City"
              value={address.city}
              onChange={(v) => { }}
              editable={false}

            />
            <Input
              placeholder="Pincode"
              keyboardType="numeric"
              value={address.zip}
              onChange={async (v: string) => {
                const cleaned = v.replace(/[^0-9]/g, "").slice(0, 6);

                setAddress((prev) => ({ ...prev, zip: cleaned }));

                if (cleaned.length === 6) {
                  const result = await getAddressFromPincode(cleaned);

                  if (result) {
                    setAddress((prev) => ({
                      ...prev,
                      city: result.city,
                      state: result.state,
                      country: result.country,
                    }));
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Invalid pincode",
                    });
                  }
                }
              }}
            />
          </Row>
        </Card>

        {/* ITEMS */}
        <Card title="Order Items">
          {items.map((it: any) => {
            const isBundle = !!it.bundle;
            const img = isBundle
              ? it.mainImage
              : it.product.images?.[0];

            return (
              <View key={it._id} style={styles.itemRow}>
                <Image source={{ uri: img }} style={styles.itemImage} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {isBundle ? it.bundle.title : it.product.title}
                  </Text>

                  {isBundle &&
                    it.bundleProducts.map((bp: any) => (
                      <Text key={bp.product._id} style={styles.subItem}>
                        • {bp.product.title} ({bp.size})
                      </Text>
                    ))}

                  {!isBundle && (
                    <Text style={styles.subItem}>
                      Size: {it.size}
                    </Text>
                  )}
                </View>

                <Text style={styles.itemPrice}>
                  ₹
                  {(isBundle ? it.bundle.price : it.product.price) *
                    it.quantity}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* PAYMENT */}
        <Card title="Payment Method">
          <PaymentOption
            active={paymentMethod === "cod"}
            label="Cash on Delivery"
            icon="cash-outline"
            onPress={() => setPaymentMethod("cod")}
          />

          <PaymentOption
            active={paymentMethod === "razorpay"}
            label="Pay Online (Razorpay)"
            icon="card-outline"
            onPress={() => setPaymentMethod("razorpay")}
          />
        </Card>

        {/* SUMMARY */}
        <Card>
          <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
          <SummaryRow label="Shipping" value={`₹${shipping.toFixed(2)}`} />
          {shipping === 0 ? (
            <Text style={styles.savingsText}>
              🎉 Free Delivery Applied
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: "#666" }}>
              Add ₹{Math.max(0, 500 - subtotal)} more for free delivery
            </Text>
          )}
          <Divider />
          <SummaryRow label="Total" value={`₹${total.toFixed(2)}`} bold />
        </Card>


      </ScrollView>
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.placeBtn, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={placeOrder}
        >
          <Text style={styles.placeBtnText}>
            {loading ? "Placing..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    {children}
  </View>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.row}>{children}</View>
);
const Input = ({
  placeholder,
  value,
  onChange,
  keyboardType = "default",
  editable = true,
  maxLength,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  editable?: boolean;
  maxLength?: number; // 👈 ADD THIS
}) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    keyboardType={keyboardType}
    editable={editable}
    maxLength={maxLength} // 👈 PASS HERE
    onChangeText={(v: string) => onChange(v)}
    style={[
      styles.input,
      !editable && {
        backgroundColor: "#f1f1f1",
        color: "#999",
      },
    ]}
  />
);
const PaymentOption = ({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.paymentRow, active && styles.paymentActive]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={20} color="#111" />

    <Text style={styles.paymentText}>{label}</Text>

    <Ionicons
      name={active ? "radio-button-on" : "radio-button-off"}
      size={20}
      color="#111"
      style={{ marginLeft: "auto" }}
    />
  </TouchableOpacity>
);

const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryText, bold && styles.bold]}>
      {label}
    </Text>
    <Text style={[styles.summaryText, bold && styles.bold]}>
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f6f6f6" },
  container: { padding: 16, paddingBottom: 120 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  row: { flexDirection: "row", gap: 12 },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  itemTitle: { fontWeight: "600", fontSize: 14 },
  subItem: { fontSize: 12, color: "#666" },
  itemPrice: { fontWeight: "700", marginLeft: 8 },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  paymentText: { fontSize: 14, fontWeight: "600" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryText: { fontSize: 14 },
  bold: { fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },


  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#f6f6f6",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  savingsText: {
    color: "green",
    fontSize: 12,
    marginTop: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentActive: {
    backgroundColor: "#f2fdf2",
    borderRadius: 12,
    // paddingHorizontal: 10,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 24, // 👈 add this
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  totalLabel: {
    fontSize: 12,
    color: "#666",
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  placeBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
  },

  placeBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
