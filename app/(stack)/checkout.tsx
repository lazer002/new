import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";

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

  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "Delhi",
    zip: "",
    country: "India",
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
        price: it.product.price,
        total: it.product.price * it.quantity,
        mainImage: it.product.images?.[0] ?? "",
        bundleProducts: [],
      };
    });
  }, [items]);

  /* ---------- PLACE ORDER ---------- */

  const placeOrder = async (): Promise<void> => {
    if (!address.firstName || !address.phone || !address.address) {
      alert("Please fill required address fields");
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
      });

      if (paymentMethod === "razorpay") {
        router.push({
          pathname: "/razorpay",
          params: { order: JSON.stringify(res.data) },
        });
      } else {
        await clearCart();
        router.replace({
          pathname: "/order-success",
          params: {
            orderNumber: res.data.orderNumber,
            email,
          },
        });
      }
    } catch (err) {
      console.log("Order error:", err);
      alert("Failed to place order");
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
            onChange={(v: string) =>
              setAddress({ ...address, phone: v })
            }
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
              onChange={(v: string) =>
                setAddress({ ...address, city: v })
              }
            />
            <Input
              placeholder="Pincode"
              keyboardType="numeric"
              value={address.zip}
              onChange={(v: string) =>
                setAddress({ ...address, zip: v })
              }
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
            onPress={() => setPaymentMethod("cod")}
          />
          <PaymentOption
            active={paymentMethod === "razorpay"}
            label="Pay Online (Razorpay)"
            onPress={() => setPaymentMethod("razorpay")}
          />
        </Card>

        {/* SUMMARY */}
        <Card>
          <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
          <SummaryRow label="Shipping" value={`₹${shipping}`} />
          <Divider />
          <SummaryRow label="Total" value={`₹${total}`} bold />
        </Card>

        <TouchableOpacity
          style={styles.placeBtn}
          disabled={loading}
          onPress={placeOrder}
        >
          <Text style={styles.placeBtnText}>
            {loading ? "Placing Order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
}) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    keyboardType={keyboardType}
    onChangeText={(v: string) => onChange(v)}
    style={styles.input}
  />
);

const PaymentOption = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.paymentRow} onPress={onPress}>
    <Ionicons
      name={active ? "radio-button-on" : "radio-button-off"}
      size={20}
      color="#111"
    />
    <Text style={styles.paymentText}>{label}</Text>
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
  container: { padding: 16, paddingBottom: 40 },

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

  placeBtn: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 10,
  },
  placeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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

headerBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
},

});
