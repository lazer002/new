
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import Screen from "@/components/Screen";

// Enable animation (Android)
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* ---------------- FAQ DATA ---------------- */


 const FAQ_DATA = [
  {
    category: "Orders",
    items: [
      {
        q: "Where is my order?",
        a: "Go to Profile → Orders to track your order status in real-time.",
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, you can cancel before the order is dispatched.",
      },
      {
        q: "Why is my order delayed?",
        a: "Delays may happen due to high demand, weather, or courier issues.",
      },
      {
        q: "Can I change delivery address after placing order?",
        a: "No, address cannot be changed after order confirmation.",
      },
      {
        q: "I received a wrong item",
        a: "Please go to Orders → Report issue and request a replacement.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "Payment failed but money deducted?",
        a: "The amount will be refunded automatically within 5-7 business days.",
      },
      {
        q: "What payment methods are available?",
        a: "We support UPI, Cards, Net Banking, Wallets, and COD.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for selected locations.",
      },
      {
        q: "Why was my payment declined?",
        a: "It could be due to bank restrictions, insufficient balance, or network issues.",
      },
      {
        q: "Can I pay after delivery?",
        a: "Yes, via Cash on Delivery if available.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Orders are typically delivered within 3-7 business days.",
      },
      {
        q: "Do you deliver to my location?",
        a: "We deliver across most cities. Enter your PIN code to check availability.",
      },
      {
        q: "Can I schedule delivery?",
        a: "Currently, scheduled delivery is not supported.",
      },
      {
        q: "What if I miss the delivery?",
        a: "Our courier will attempt delivery again or contact you.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "How do I return a product?",
        a: "Go to Orders → Select item → Request return.",
      },
      {
        q: "What is the return policy?",
        a: "Returns are accepted within 7 days of delivery.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed within 5-7 business days.",
      },
      {
        q: "Can I exchange instead of returning?",
        a: "Yes, exchanges are available for select products.",
      },
      {
        q: "Are there any return charges?",
        a: "Returns are free for defective or incorrect items.",
      },
    ],
  },
  {
    category: "Account & Profile",
    items: [
      {
        q: "How do I update my profile?",
        a: "Go to Profile → Edit Profile to update your details.",
      },
      {
        q: "I forgot my password",
        a: "Use the 'Forgot Password' option on login screen.",
      },
      {
        q: "How do I change my phone number?",
        a: "Update it from Profile settings.",
      },
      {
        q: "Is my personal data safe?",
        a: "Yes, we use secure encryption to protect your data.",
      },
    ],
  },
  {
    category: "Technical Issues",
    items: [
      {
        q: "App is not working properly",
        a: "Try restarting the app or updating to the latest version.",
      },
      {
        q: "I am unable to login",
        a: "Check your credentials or try resetting your password.",
      },
      {
        q: "Images are not loading",
        a: "Check your internet connection or refresh the page.",
      },
      {
        q: "App is slow or crashing",
        a: "Clear cache or reinstall the app.",
      },
    ],
  },
  {
    category: "Offers & Discounts",
    items: [
      {
        q: "How do I apply a coupon?",
        a: "Enter the coupon code during checkout.",
      },
      {
        q: "Why is my coupon not working?",
        a: "Check expiry date or minimum order value.",
      },
      {
        q: "Can I use multiple coupons?",
        a: "Only one coupon can be applied per order.",
      },
    ],
  },
];



/* ---------------- COMPONENT ---------------- */

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  /* -------- FILTER FAQ -------- */

  const filteredFAQ = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;

    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.q.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  /* -------- TOGGLE -------- */

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === key ? null : key);
  };

  /* ---------------- UI ---------------- */


// 🔥 Improved UI version

return (
  <Screen>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔍 SEARCH */}
      <View style={styles.searchBox}>
        <Octicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search help..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>

      {/* ⚡ QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Help</Text>

      <View style={styles.quickRow}>
        <QuickItem icon="package" label="Orders" onPress={() => router.push("/profile")} />
        <QuickItem icon="sync" label="Returns" onPress={() => {}} />
        <QuickItem icon="credit-card" label="Payments" onPress={() => {}} />
        <QuickItem icon="person" label="Account" onPress={() => {}} />
      </View>

      {/* 📚 FAQ */}
      <Text style={styles.sectionTitle}>FAQs</Text>

      {filteredFAQ.map((cat) => (
        <View key={cat.category} style={styles.categoryCard}>
          <Text style={styles.category}>{cat.category}</Text>

          {cat.items.map((item, idx) => {
            const key = cat.category + idx;
            const isOpen = openIndex === key;

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                style={styles.faqCard}
                onPress={() => toggle(key)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.question}>{item.q}</Text>

                  <Octicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#555"
                  />
                </View>

                {isOpen && (
                  <View style={styles.answerBox}>
                    <Text style={styles.answer}>{item.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* 📞 CONTACT */}
      <Text style={styles.sectionTitle}>Need more help?</Text>

      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard}>
          <Text style={styles.contactTitle}>📧 Email</Text>
          <Text style={styles.contactSub}>support@yourapp.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard}>
          <Text style={styles.contactTitle}>📞 Call</Text>
          <Text style={styles.contactSub}>+91 9876543210</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </Screen>
);


}

/* ---------------- COMPONENTS ---------------- */

const QuickItem = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickItem} onPress={onPress}>
    <Octicons name={icon} size={22} />
    <Text style={styles.quickText}>{label}</Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 6,
  },

  /* 🔍 SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },

  /* SECTION */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },

  /* QUICK */
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  quickItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },

  quickText: {
    fontSize: 12,
    marginTop: 6,
  },

  /* CATEGORY */
  categoryCard: {
    marginBottom: 12,
  },

  category: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  /* FAQ */
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  question: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    paddingRight: 10,
  },

  answerBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
  },

  answer: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },

  /* CONTACT */
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  contactCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
  },

  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
  },

  contactSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});



