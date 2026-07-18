//app/(stack)/checkout.tsx
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
  ActivityIndicator,
  InteractionManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/config";
import Toast from "react-native-toast-message"
import { getAddressFromPincode } from "@/utils/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
/* ================= TYPES ================= */
import RazorpayCheckout from "react-native-razorpay";
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
  productId?: string | null;
  bundleId?: string | null;
  customBundle?: boolean;
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
  const { user, guestId } = useAuth();
const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
const [useSaved, setUseSaved] = useState(true);
const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
useEffect(() => {
  const fetchSaved = async () => {
    try {
      const res = await api.get("/api/address");
   const list = res.data.addresses || [];

setSavedAddresses(list);

if (list.length === 0) {
  setUseSaved(false);
  setSelectedAddressId(null);
  return;
}

const def =
  list.find((a: any) => a.isDefault) || list[0];

setSelectedAddressId(def._id);
fillAddress(def);
setUseSaved(true);
    } catch (err) {
      console.log(err);
    }
  };

  fetchSaved();
}, []);

const fillAddress = (a: any) => {
  setAddress({
    firstName: a.name,
    lastName: "",
    phone: a.phone,
    address: a.address,
    apartment: "",
    city: a.city,
    state: a.state,
    zip: a.zip,
    country: "India",
  });
};

const emptyAddress: Address = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

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
  const [verifyingPayment, setVerifyingPayment] = useState(false);
const toggleExpanded = (id: string) => {
  setExpandedItems((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};
  /* ---------- PRICE ---------- */

const subtotal = useMemo(() => {
  return items.reduce((sum: number, it: any) => {

    if (it.bundle?.price) {
      return sum + Number(it.bundle.price) * (it.quantity || 1);
    }

    if (it.customBundle?.price) {
      return sum + Number(it.customBundle.price) * (it.quantity || 1);
    }

    if (it.product?.price) {
      return sum + Number(it.product.price) * (it.quantity || 1);
    }

    return sum;
  }, 0);
}, [items]);

  const shipping: number = subtotal > 1000 ? 0 : 100;
  const total: number = subtotal + shipping;
  const savings = shipping === 0 ? 50 : 0;

  /* ---------- ORDER ITEMS ---------- */

  const orderItems = useMemo<OrderItem[]>(() => {
    return items
      .map((it: any) => {
        // Bundle
        if (it.bundle?._id) {
          return {
            customBundle: false,
            bundleId: it.bundle._id,
            title: it.bundle.title,
            quantity: it.quantity || 1,
            price: Number(it.bundle.price),
            total: Number(it.bundle.price) * (it.quantity || 1),
            mainImage: it.mainImage,
            bundleProducts: (it.bundleProducts || []).map((bp: any) => ({
              productId: bp.product?._id,
              title: bp.product?.title,
              variant: bp.size,
              quantity: bp.quantity,
              price: Number(bp.product?.price || 0),
              mainImage: bp.product?.images?.[0] ?? "",
            })),
          };
        }

        if (it.customBundle) {
          return {
            customBundle: true,
            title: it.customBundle.title,
            quantity: it.quantity,
            price: it.customBundle.price,
            total: it.customBundle.price * it.quantity,
            mainImage: it.mainImage,
            bundleProducts: it.bundleProducts.map((bp: any) => ({
              productId: bp.product._id,
              title: bp.product.title,
              variant: bp.size,
              quantity: bp.quantity,
              price: bp.product.price,
              mainImage: bp.product.images?.[0] ?? "",
            })),
          };
        }

        // Product missing -> skip invalid item
        if (!it.product?._id) {
          console.log("Invalid cart item:", it);
          return null;
        }

        // Product
        return {
          productId: it.product._id,
          title: it.product.title,
          variant: it.size,
          quantity: it.quantity || 1,
          price: Number(it.product.price),
          total: Number(it.product.price) * (it.quantity || 1),
          mainImage: it.product.images?.[0] ?? "",

        };
      })
      .filter(Boolean) as OrderItem[];
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

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    Toast.show({ type: "error", text1: "Invalid Indian phone number" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Toast.show({ type: "error", text1: "Invalid email" });
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
    const res = await api.post(
      "/api/orders/create",
      {
        items: orderItems,
        subtotal,
        shipping,
        total: Number(subtotal) + Number(shipping),
        shippingMethod: "standard",
        billingSame: true,
        shippingAddress: address,
        contactEmail: email,
        paymentMethod,
        source: "mobile",

        // ✅ IMPORTANT
        userId: user?._id || null,
        guestId: user ? null : guestId,
        userType: user ? "user" : "guest",
      },
      {
        headers: {
          "x-guest-id": guestId || "",
        },
      }
    );

    // ✅ CLEAR CART (IMPORTANT FIX)


  console.log("ORDER RESPONSE:", res.data);

if (paymentMethod === "razorpay") {
  console.log("Opening Razorpay:", {
    orderId: res.data.orderId,
    razorpayOrderId: res.data.razorpayOrderId,
    amount: res.data.amount,
    currency: res.data.currency,
  });

  const options = {
    key: process.env.EXPO_PUBLIC_RAZORPAY_KEY,
    amount: res.data.amount,
    currency: res.data.currency || "INR",
    name: "GARRIB",
    description: `Order ${res.data.orderNumber || ""}`,
    order_id: res.data.razorpayOrderId,

    prefill: {
      name: `${address.firstName} ${address.lastName}`.trim(),
      email,
      contact: address.phone,
    },

    theme: {
      color: "#B6FF2E",
    },
  };

  console.log("RAZORPAY OPTIONS:", options);
setVerifyingPayment(true);

// Give React Native time to actually render the full-screen loader
await new Promise<void>((resolve) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
});

try {
  const payment = await RazorpayCheckout.open(options);

console.log("RAZORPAY SUCCESS:", payment);

const verifyRes = await api.post(
  "/api/orders/payment-success",
  {
    orderId: res.data.orderId,

    razorpay_payment_id:
      payment.razorpay_payment_id,

    razorpay_order_id:
      payment.razorpay_order_id,

    razorpay_signature:
      payment.razorpay_signature,
  },
  {
    headers: {
      "x-guest-id": guestId || "",
    },
  }
);

console.log(
  "PAYMENT VERIFY RESPONSE:",
  verifyRes.data
);

if (!verifyRes.data?.success) {
  setVerifyingPayment(false);
  throw new Error(
    "Payment verification failed"
  );
}

await clearCart();

router.replace({
  pathname: "/order-success",
  params: {
    orderNumber: res.data.orderNumber,
    email,
  },
});

return;
} catch (error: any) {
  // Razorpay was cancelled OR payment/verification failed
  setVerifyingPayment(false);
  throw error;
}

}

    // ✅ SUCCESS FLOW
    router.replace({
      pathname: "/order-success",
      params: {
        orderNumber: res.data.orderNumber,
        email,
      },
    });

  } catch (err: any) {
    console.log("Order error:", err);

    Toast.show({
      type: "error",
      text1:
        err.response?.data?.message ||
        "Failed to place order. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  /* ================= UI ================= */

  return (
<SafeAreaView style={styles.root}>
  <View style={styles.heroHeader}>

    <TouchableOpacity
      style={styles.circleBtn}
      onPress={() => router.back()}
    >
      <Ionicons
        name="chevron-back"
        size={22}
        color="#111"
      />
    </TouchableOpacity>

    <View style={{ flex: 1, marginLeft: 18 }}>

      <Text style={styles.heroLabel}>
        GARRIB
      </Text>

      <Text style={styles.heroTitle}>
        Checkout
      </Text>

      <Text style={styles.heroSub}>
        Secure checkout • Premium delivery
      </Text>

    </View>

    <TouchableOpacity
      style={styles.circleBtn}
      onPress={() => router.push("/")}
    >
      <Ionicons
        name="bag-outline"
        size={22}
        color="#111"
      />
    </TouchableOpacity>

  </View>

  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >

    {/* ================= ADDRESS ================= */}

{savedAddresses.length > 0 && (
  <>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />

      <Text style={styles.sectionTitle}>
        DELIVERY ADDRESS
      </Text>
    </View>

    <View style={styles.card}>
      {savedAddresses.map((a) => {
        const active = selectedAddressId === a._id;

        return (
          <TouchableOpacity
            key={a._id}
            activeOpacity={0.9}
            style={[
              styles.addressCard,
              active && styles.addressCardActive,
            ]}
            onPress={() => {
              setUseSaved(true);
              setSelectedAddressId(a._id);
              fillAddress(a);
            }}
          >
            <View style={styles.addressTop}>
              <View style={styles.addressBadge}>
                <Ionicons
                  name="location"
                  size={14}
                  color="#111"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.savedName}>
                  {a.name}
                </Text>

                <Text style={styles.savedAddr}>
                  {a.address}
                </Text>

                <Text style={styles.savedAddr}>
                  {a.city}, {a.state} • {a.zip}
                </Text>

                <Text style={styles.savedAddr}>
                  {a.phone}
                </Text>
              </View>

              {active && (
                <View style={styles.selectedTick}>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#111"
                  />
                </View>
              )}
            </View>

            {a.isDefault && (
              <View style={styles.defaultChip}>
                <Text style={styles.defaultText}>
                  DEFAULT
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.addAddressBtn}
        onPress={() => {
          setUseSaved(false);
          setSelectedAddressId(null);
          setAddress(emptyAddress);
          setEmail(user?.email ?? "");
        }}
      >
        <Ionicons
          name="add"
          size={20}
          color="#111"
        />

        <Text style={styles.addAddressText}>
          ADD NEW ADDRESS
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}

   {(!useSaved || savedAddresses.length === 0) && (
      <>
        <View
          style={styles.sectionHeader}
        >
          <View
            style={
              styles.sectionAccent
            }
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            NEW ADDRESS
          </Text>
        </View>

        <View style={styles.card}>

          <Row>
            <Input
              placeholder="First Name"
              value={
                address.firstName
              }
              onChange={(v) =>
                setAddress({
                  ...address,
                  firstName: v,
                })
              }
            />

            <Input
              placeholder="Last Name"
              value={
                address.lastName
              }
              onChange={(v) =>
                setAddress({
                  ...address,
                  lastName: v,
                })
              }
            />
          </Row>

          <Input
            placeholder="Phone"
            keyboardType="phone-pad"
            value={address.phone}
            maxLength={10}
            onChange={(v) => {
              const cleaned =
                v
                  .replace(
                    /[^0-9]/g,
                    ""
                  )
                  .slice(0, 10);

              setAddress({
                ...address,
                phone: cleaned,
              });
            }}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />

          <Input
            placeholder="Address"
            value={address.address}
            onChange={(v) =>
              setAddress({
                ...address,
                address: v,
              })
            }
          />

          <Input
            placeholder="Apartment"
            value={
              address.apartment
            }
            onChange={(v) =>
              setAddress({
                ...address,
                apartment: v,
              })
            }
          />


          <Row>

            <Input
              placeholder="City"
              value={address.city}
              onChange={(v: string) =>
                setAddress({
                  ...address,
                  city: v,
                })
              }
            />

            <Input
              placeholder="Pincode"
              keyboardType="numeric"
              maxLength={6}
              value={address.zip}
              onChange={async (v: string) => {
                const cleaned = v
                  .replace(/[^0-9]/g, "")
                  .slice(0, 6);

                setAddress((prev) => ({
                  ...prev,
                  zip: cleaned,
                }));

                if (cleaned.length === 6) {
                  const result =
                    await getAddressFromPincode(
                      cleaned
                    );

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
                      text1: "Invalid Pincode",
                    });
                  }
                }
              }}
            />

          </Row>

          <Input
            placeholder="State"
            value={address.state}
            editable={false}
            onChange={() => {}}
          />

          <Input
            placeholder="Country"
            value={address.country}
            editable={false}
            onChange={() => {}}
          />

        </View>
      </>
    )}

    {/* ================= ORDER ITEMS ================= */}

    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />

      <Text style={styles.sectionTitle}>
        ORDER SUMMARY
      </Text>
    </View>

  <View style={styles.orderContainer}>

  {items.map((it: any, index: number) => {

const isCustomBundle = !!it.customBundle;
const isBundle = !!it.bundle && !isCustomBundle;

    const id = it._id || String(index);

    const expanded = expandedItems[id];

    const image =
      isBundle || isCustomBundle
        ? it.mainImage
        : it.product?.images?.[0];

    const title = isBundle
      ? it.bundle.title
      : isCustomBundle
      ? it.customBundle.title
      : it.product?.title;

    const price = Number(
      isBundle
        ? it.bundle.price
        : isCustomBundle
        ? it.customBundle.price
        : it.product?.price || 0
    );

    return (

      <View
        key={id}
        style={styles.orderCard}
      >

        {/* ================= HEADER ================= */}

<TouchableOpacity
          activeOpacity={0.9}
          style={styles.orderHeader}
          onPress={() => {
            if (isBundle || isCustomBundle) {
              toggleExpanded(id);
            }
          }}
        >

          <Image
            source={{ uri: image }}
            style={styles.orderImage}
          />

<View style={styles.orderInfo}>

  <View style={styles.topRow}>

    <View style={{ flex: 1 }}>

      <View style={styles.titleRow}>

        <Text
          numberOfLines={2}
          style={styles.orderTitle}
        >
          {title}
        </Text>

      {(isBundle || isCustomBundle) && (() => {
  const originalPrice = (it.bundleProducts || []).reduce(
    (sum: number, bp: any) =>
      sum +
      Number(bp.product?.price || 0) *
        (bp.quantity || 1),
    0
  );

  const bundlePrice = Number(
    isBundle
      ? it.bundle?.price || 0
      : it.customBundle?.price || 0
  );

  const saved = Math.max(
    0,
    originalPrice - bundlePrice
  );

  return (
    <View style={styles.pricePill}>


      {saved > 0 && (
        <Text style={styles.pricePillSave}>
          SAVE ₹{saved}
        </Text>
      )}

    </View>
  );
})()}

      </View>

      {(isBundle || isCustomBundle) ? (

        <View style={styles.stackImages}>

          {(it.bundleProducts || [])
            .slice(0, 3)
            .map((bp: any, i: number) => (
              <Image
                key={i}
                source={{
                  uri: bp.product?.images?.[0],
                }}
                style={[
                  styles.stackImage,
                  {
                    marginLeft:
                      i === 0 ? 0 : -12,
                    zIndex: 20 - i,
                  },
                ]}
              />
            ))}

        </View>

      ) : (

        <Text style={styles.orderMeta}>
          Size {it.size}
        </Text>

      )}

    {(isBundle || isCustomBundle) && (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.drawerPill}
    onPress={() => toggleExpanded(id)}
  >
    <Text style={styles.drawerPillText}>
      {expanded
        ? "HIDE ITEMS"
        : "VIEW INCLUDED ITEMS"}
    </Text>

    <Ionicons
      name={
        expanded
          ? "chevron-up"
          : "chevron-down"
      }
      size={16}
      color="#111"
    />
  </TouchableOpacity>
)}

      <View style={styles.orderBottom}>

        <Text style={styles.orderQty}>
          Qty {it.quantity}
        </Text>

        <Text style={styles.orderPrice}>
          ₹{price.toFixed(0)}
        </Text>

      </View>

    </View>

  </View>

</View>
   
 </TouchableOpacity>

 {(isBundle || isCustomBundle) && expanded && (

<View style={styles.bundleDrawer}>

  <View style={styles.drawerDivider} />

  <Text style={styles.drawerTitle}>
    {isBundle
      ? "WHAT'S INCLUDED"
      : "YOUR CUSTOM LOOK"}
  </Text>

  {(it.bundleProducts || []).map(
    (bp: any, i: number) => (

      <View
        key={i}
        style={styles.drawerItem}
      >

        <Image
          source={{
            uri:
              bp.product?.images?.[0],
          }}
          style={styles.drawerImage}
        />

        <View
          style={{
            flex: 1,
            marginHorizontal: 12,
          }}
        >

          <Text
            numberOfLines={2}
            style={styles.drawerProductTitle}
          >
            {bp.product?.title}
          </Text>

          <Text style={styles.drawerMeta}>
            Size {bp.size}
            {"  •  "}
            Qty {bp.quantity}
          </Text>

        </View>

        <Text style={styles.drawerPrice}>
          ₹{bp.product?.price}
        </Text>

      </View>

    )
  )}

  <View style={styles.bundleFooter}>

    <View style={styles.bundleGift}>
      <Ionicons
        name="gift-outline"
        size={18}
        color="#111"
      />
    </View>

    <Text style={styles.bundleFooterText}>
      Bundle Price
    </Text>

    <Text style={styles.bundleFooterPrice}>
      ₹
      {isBundle
        ? it.bundle.price
        : it.customBundle.price}
    </Text>

  </View>

  <View style={styles.saveCard}>

    <View style={styles.saveLeft}>

      <View style={styles.saveIcon}>
        <Ionicons
          name="pricetag"
          size={18}
          color="#111"
        />
      </View>

      <View>

        <Text style={styles.saveTitle}>
          YOU SAVE
        </Text>

        <Text style={styles.saveSubtitle}>
          Exclusive bundle pricing
        </Text>

      </View>

    </View>

    <Text style={styles.saveAmount}>
      ₹
      {Math.max(
        0,
        (it.bundleProducts || []).reduce(
          (sum: number, bp: any) =>
            sum +
            Number(bp.product?.price || 0) *
              (bp.quantity || 1),
          0
        ) -
          Number(
            isBundle
              ? it.bundle.price
              : it.customBundle.price
          )
      )}
    </Text>

  </View>

</View>

)}
      </View>

    );

  })}

</View>

    {/* ================= PAYMENT ================= */}

    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />

      <Text style={styles.sectionTitle}>
        PAYMENT
      </Text>
    </View>

    <View style={styles.card}>

      <PaymentOption
        active={paymentMethod === "cod"}
        label="Cash on Delivery"
        icon="cash-outline"
        onPress={() =>
          setPaymentMethod("cod")
        }
      />

      <PaymentOption
        active={
          paymentMethod === "razorpay"
        }
        label="Pay Online (Razorpay)"
        icon="card-outline"
        onPress={() =>
          setPaymentMethod(
            "razorpay"
          )
        }
      />

    </View>
        {/* ================= PRICE DETAILS ================= */}

    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />

      <Text style={styles.sectionTitle}>
        PRICE DETAILS
      </Text>
    </View>

    <View style={styles.card}>

      <SummaryRow
        label="Subtotal"
        value={`₹${subtotal.toFixed(2)}`}
      />

      <SummaryRow
        label="Shipping"
        value={
          shipping === 0
            ? "FREE"
            : `₹${shipping.toFixed(2)}`
        }
      />

      {shipping === 0 ? (
        <View style={styles.freeShippingBox}>

          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#111"
          />

          <Text style={styles.freeShippingText}>
            Free delivery applied
          </Text>

        </View>
      ) : (
        <View style={styles.shippingInfo}>

          <Ionicons
            name="bag-outline"
            size={16}
            color="#777"
          />

          <Text style={styles.shippingInfoText}>
            Add ₹
            {Math.max(
              0,
              1000 - subtotal
            )}{" "}
            more for FREE delivery
          </Text>

        </View>
      )}

      <View style={styles.divider} />

      <SummaryRow
        label="Total"
        value={`₹${total.toFixed(2)}`}
        bold
      />

    </View>

    <View style={{ height: 60 }} />

  </ScrollView>

  {/* ================= FLOATING CTA ================= */}

  <View style={styles.checkoutBar}>

    <View>

      <Text style={styles.checkoutLabel}>
        TOTAL
      </Text>

      <Text style={styles.checkoutPrice}>
        ₹{total.toFixed(2)}
      </Text>

    </View>

    <TouchableOpacity
      activeOpacity={0.9}
      disabled={loading}
      onPress={placeOrder}
      style={[
        styles.checkoutButton,
        loading && {
          opacity: 0.6,
        },
      ]}
    >

      <Text style={styles.checkoutButtonText}>
        {loading
          ? "PLACING..."
          : "PLACE ORDER"}
      </Text>

      <View style={styles.checkoutArrow}>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#111"
        />

      </View>

    </TouchableOpacity>

  </View>
{verifyingPayment && (
  <View style={styles.paymentLoader}>
    <View style={styles.paymentLoaderCard}>
      <ActivityIndicator
        size="large"
        color="#111"
      />

      <Text style={styles.paymentLoaderTitle}>
        PAYMENT SUCCESSFUL
      </Text>

      <Text style={styles.paymentLoaderText}>
        Confirming your order...
      </Text>
    </View>
  </View>
)}
</SafeAreaView>
  );
}

/* ================= SMALL COMPONENTS ================= */



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
  maxLength?: number;
}) => (
  <TextInput
    placeholder={placeholder}
    placeholderTextColor="#7A7A7A"
    value={value}
    keyboardType={keyboardType}
    editable={editable}
    maxLength={maxLength}
    onChangeText={onChange}
    style={[
      styles.input,
      !editable && {
        backgroundColor: "#F1F1F1",
        color: "#666",
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
  /* ================= ROOT ================= */

  root: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },

  container: {
    paddingHorizontal: 18,
    paddingBottom: 140,
  },

  /* ================= HEADER ================= */

  heroHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,

    backgroundColor: "#FFF",
  },

  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: "#F4F4F4",

    justifyContent: "center",
    alignItems: "center",
  },

  heroLabel: {
    color: "#777",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  heroTitle: {
    marginTop: 8,

    color: "#111",

    fontSize: 34,
    fontWeight: "900",
  },

  heroSub: {
    marginTop: 4,

    color: "#777",

    fontSize: 14,
  },

  /* ================= SECTION ================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 26,
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

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 2,
  },

  /* ================= CARD ================= */

  card: {
    backgroundColor: "#FFF",

    borderRadius: 26,

    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,

    marginBottom: 18,
  },

  /* ================= ADDRESS ================= */

  addressCard: {
    borderWidth: 1,
    borderColor: "#ECECEC",

    borderRadius: 18,

    padding: 16,

    marginBottom: 12,
  },

  addressCardActive: {
    borderColor: "#B6FF2E",

    backgroundColor: "#F9FFE9",
  },

  addressTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  addressBadge: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "#F5F5F5",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  selectedTick: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",
    alignItems: "center",
  },

  savedName: {
    color: "#111",

    fontSize: 15,
    fontWeight: "800",

    marginBottom: 4,
  },

  savedAddr: {
    color: "#777",

    fontSize: 13,

    lineHeight: 20,
  },

  defaultChip: {
    alignSelf: "flex-start",

    marginTop: 12,

    backgroundColor: "#111",

    borderRadius: 30,

    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  defaultText: {
    color: "#FFF",

    fontSize: 10,
    fontWeight: "900",

    letterSpacing: 1.5,
  },

  emptyText: {
    color: "#888",
    fontSize: 14,
  },

  addAddressBtn: {
    marginTop: 8,

    height: 54,

    borderRadius: 16,

    backgroundColor: "#F5F5F5",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  addAddressText: {
    marginLeft: 8,

    color: "#111",

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 1.2,
  },

  /* ================= INPUTS ================= */

  row: {
    flexDirection: "row",
    gap: 12,
  },

input: {
  flex: 1,

  height: 58,

  borderRadius: 18,

  backgroundColor: "#FAFAFA",
 
  borderWidth: 1,
  borderColor: "#E8E8E8",

  paddingHorizontal: 18,

  color: "#111",

  fontSize: 15,
  fontWeight: "600",

  marginBottom: 14,
},

  /* ================= PRODUCTS ================= */

  productRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 12,

    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },

  productImage: {
    width: 72,
    height: 72,

    borderRadius: 16,

    backgroundColor: "#EEE",
  },

  productTitle: {
    color: "#111",

    fontSize: 15,
    fontWeight: "800",
  },

  productMeta: {
    color: "#777",

    fontSize: 12,

    marginTop: 4,
  },

  productQty: {
    marginTop: 6,

    color: "#999",

    fontSize: 12,

    fontWeight: "700",
  },

  productPrice: {
    color: "#111",

    fontWeight: "900",

    fontSize: 15,
  },

  /* ================= PAYMENT ================= */

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 16,

    borderRadius: 16,

    paddingHorizontal: 14,

    marginBottom: 10,

    backgroundColor: "#FAFAFA",
  },

  paymentActive: {
    backgroundColor: "#F4FFD8",

    borderWidth: 1,
    borderColor: "#B6FF2E",
  },
orderContainer: {
  gap: 18,
},

orderCard: {
  backgroundColor: "#FFF",

  borderRadius: 26,

  overflow: "hidden",

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 18,

  shadowOffset: {
    width: 0,
    height: 8,
  },

  elevation: 4,
},

orderHeader: {
  flexDirection: "row",

  alignItems: "center",

  padding: 18,
},

orderImage: {
  width: 82,
  height: 82,

  borderRadius: 18,

  backgroundColor: "#EEE",
},

orderInfo: {
  flex: 1,

  marginHorizontal: 16,
},

orderTitleRow: {
  flexDirection: "row",

  alignItems: "center",

  flexWrap: "wrap",
},

orderTitle: {
  flex: 1,
  color: "#111",
  fontSize: 18,
  fontWeight: "900",
  lineHeight: 24,
  marginRight: 10,
},
bundleChip: {
  marginLeft: 8,

  backgroundColor: "#F2F8D5",

  borderRadius: 30,

  paddingHorizontal: 10,
  paddingVertical: 5,
},

bundleChipText: {
  color: "#7A8900",

  fontSize: 10,

  fontWeight: "900",

  letterSpacing: 1,
},

orderMeta: {
  marginTop: 10,

  color: "#777",

  fontSize: 13,
},

orderBottom:{
  marginTop:16,

  flexDirection:"row",

  alignItems:"center",

  justifyContent:"space-between",
},
topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

stackImages: {
  flexDirection: "row",
  alignItems: "center",
},

stackImage: {
  width: 34,
  height: 34,
  borderRadius: 17,
  borderWidth: 2,
  borderColor: "#FFF",
  backgroundColor: "#EEE",
},

itemsChip: {
  alignSelf: "flex-start",
  backgroundColor: "#111",
  borderRadius: 20,
  paddingHorizontal: 10,
  paddingVertical: 5,
},

itemsChipText: {
  color: "#FFF",
  fontSize: 10,
  fontWeight: "900",
  letterSpacing: 1,
},

drawerPill: {
  marginTop: 14,
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F4F4F4",
  borderRadius: 30,
  paddingHorizontal: 14,
  paddingVertical: 10,
},

drawerPillText: {
  color: "#111",
  fontWeight: "800",
  fontSize: 12,
  marginRight: 8,
},
orderQty: {
  color: "#888",

  fontWeight: "700",
},

orderPrice: {
  color: "#111",

  fontWeight: "900",

  fontSize: 18,
},

expandButton: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "#F6F6F6",

  justifyContent: "center",
  alignItems: "center",
},
  paymentText: {
    marginLeft: 12,

    color: "#111",

    fontSize: 15,
    fontWeight: "700",
  },

  /* ================= SUMMARY ================= */

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginVertical: 8,
  },

  summaryText: {
    color: "#666",

    fontSize: 14,
  },

  bold: {
    color: "#111",

    fontWeight: "900",
  },

  divider: {
    height: 1,

    backgroundColor: "#ECECEC",

    marginVertical: 16,
  },

  freeShippingBox: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 10,
  },

  freeShippingText: {
    marginLeft: 8,

    color: "#111",

    fontWeight: "700",
  },

  shippingInfo: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 10,
  },

  shippingInfoText: {
    marginLeft: 8,

    color: "#777",

    fontSize: 13,
  },

  /* ================= FLOATING BAR ================= */

  checkoutBar: {
    position: "absolute",

    left: 18,
    right: 18,
    bottom: 18,

    height: 84,

    backgroundColor: "#111",

    borderRadius: 28,

    paddingHorizontal: 22,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 12,
  },

  checkoutLabel: {
    color: "#888",

    fontSize: 11,

    fontWeight: "800",

    letterSpacing: 2,
  },

  checkoutPrice: {
    marginTop: 6,

    color: "#FFF",

    fontSize: 24,

    fontWeight: "900",
  },

  checkoutButton: {
    height: 56,

    backgroundColor: "#B6FF2E",

    borderRadius: 28,

    paddingLeft: 22,
    paddingRight: 8,

    flexDirection: "row",
    alignItems: "center",
  },

  checkoutButtonText: {
    color: "#111",

    fontWeight: "900",

    fontSize: 14,

    letterSpacing: 1.5,
  },
bundleDrawer: {
  paddingHorizontal: 18,
  paddingBottom: 18,
  backgroundColor: "#FFF",
},

drawerDivider: {
  height: 1,
  backgroundColor: "#EFEFEF",
  marginBottom: 18,
},

drawerTitle: {
  color: "#111",
  fontSize: 12,
  fontWeight: "900",
  letterSpacing: 2,
  marginBottom: 16,
},

drawerItem: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
},

drawerImage: {
  width: 58,
  height: 58,
  borderRadius: 14,
  backgroundColor: "#F2F2F2",
},

drawerProductTitle: {
  color: "#111",
  fontSize: 14,
  fontWeight: "700",
},

drawerMeta: {
  marginTop: 6,
  color: "#888",
  fontSize: 12,
},

drawerPrice: {
  color: "#111",
  fontSize: 15,
  fontWeight: "900",
},

bundleFooter: {
  marginTop: 10,

  borderTopWidth: 1,
  borderTopColor: "#F0F0F0",

  paddingTop: 18,

  flexDirection: "row",
  alignItems: "center",
},

bundleGift: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "#F6F6F6",

  justifyContent: "center",
  alignItems: "center",

  marginRight: 14,
},
titleRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
},
bundleFooterText: {
  flex: 1,

  color: "#555",

  fontWeight: "700",

  fontSize: 14,
},

bundleFooterPrice: {
  color: "#111",

  fontSize: 20,

  fontWeight: "900",
},

/* ================= SAVE CARD ================= */

saveCard:{
  marginTop:14,

  height:74,

  backgroundColor:"#B6FF2E",

  borderRadius:18,

  paddingHorizontal:16,

  flexDirection:"row",

  alignItems:"center",

  justifyContent:"space-between",
},

saveLeft: {
  flexDirection: "row",
  alignItems: "center",
},

saveIcon:{
  width:36,
  height:36,
  borderRadius:18,

  backgroundColor:"#FFF",

  justifyContent:"center",
  alignItems:"center",

  marginRight:10,
},

saveTitle:{
  fontSize:11,
  fontWeight:"900",
  letterSpacing:1,
  color:"#111",
},

saveSubtitle:{
  marginTop:2,
  fontSize:11,
  color:"#444",
},
pricePill: {
  alignSelf: "flex-start",

  backgroundColor: "#B6FF2E",

  borderRadius: 20,

  paddingHorizontal: 12,
  paddingVertical: 7,

  alignItems: "center",

  justifyContent: "center",

  minWidth: 88,
},

pricePillPrice: {
  color: "#111",
  fontSize: 16,
  fontWeight: "900",
},

pricePillSave: {
  marginTop: 2,
  color: "#111",
  fontSize: 10,
  fontWeight: "800",
  letterSpacing: 0.5,
},
saveAmount:{
  fontSize:18,
  fontWeight:"900",
  color:"#111",
},
  checkoutArrow: {
    width: 40,
    height: 40,

    borderRadius: 20,

    marginLeft: 16,

    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",
  },
  paymentLoader: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "#B6FF2E",
  zIndex: 9999,
  elevation: 9999,
  justifyContent: "center",
  alignItems: "center",
},

paymentLoaderCard: {
  alignItems: "center",
  justifyContent: "center",
},

paymentLoaderTitle: {
  marginTop: 24,
  color: "#111",
  fontSize: 20,
  fontWeight: "900",
  letterSpacing: 1.5,
},

paymentLoaderText: {
  marginTop: 8,
  color: "#555",
  fontSize: 14,
  fontWeight: "600",
},
});