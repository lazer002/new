
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
import { scale, verticalScale, normalize } from "@/utils/responsive";
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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ---------------- HERO ---------------- */}

      <View style={styles.hero}>

        <Text style={styles.label}>
          SUPPORT
        </Text>

        <Text style={styles.heroTitle}>
          HELP{"\n"}CENTER
        </Text>

        <Text style={styles.heroSubtitle}>
          Everything you need to know about orders,
          returns, payments and your account.
        </Text>

        <View style={styles.greenLine} />

      </View>

      {/* ---------------- SEARCH ---------------- */}

      <View style={styles.searchContainer}>

        <Octicons
          name="search"
          size={verticalScale(20)}
          color="#666"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search help..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />

      </View>

      {/* ---------------- QUICK HELP ---------------- */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionLabel}>
          QUICK HELP
        </Text>

        <Text style={styles.sectionHeading}>
          Popular Topics
        </Text>

      </View>

      <View style={styles.quickGrid}>

        <QuickItem
          icon="package"
          label="Orders"
          onPress={() => router.push("/profile")}
        />

        <QuickItem
          icon="sync"
          label="Returns"
          onPress={() => {}}
        />

        <QuickItem
          icon="credit-card"
          label="Payments"
          onPress={() => {}}
        />

        <QuickItem
          icon="person"
          label="Account"
          onPress={() => {}}
        />

      </View>

      {/* ---------------- FAQ ---------------- */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionLabel}>
          FREQUENTLY ASKED
        </Text>

        <Text style={styles.sectionHeading}>
          Questions
        </Text>

      </View>

      {filteredFAQ.map((cat) => (

        <View
          key={cat.category}
          style={styles.categorySection}
        >

          <View style={styles.categoryHeader}>

            <Text style={styles.categoryLabel}>
              CATEGORY
            </Text>

            <Text style={styles.categoryTitle}>
              {cat.category}
            </Text>

            <View style={styles.categoryLine} />

          </View>

          {cat.items.map((item, idx) => {

            const key =
              cat.category + idx;

            const isOpen =
              openIndex === key;

            return (

              <TouchableOpacity

                key={key}

                activeOpacity={0.92}

                style={[
                  styles.faqCard,
                  isOpen &&
                    styles.faqCardOpen,
                ]}

                onPress={() =>
                  toggle(key)
                }

              >

                <View
                  style={styles.faqHeader}
                >

                  <Text
                    style={styles.question}
                  >
                    {item.q}
                  </Text>

                  <View
                    style={[
                      styles.arrowCircle,
                      isOpen &&
                        styles.arrowCircleActive,
                    ]}
                  >

                    <Octicons
                      name={
                        isOpen
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={verticalScale(17)}
                      color={
                        isOpen
                          ? "#111"
                          : "#FFF"
                      }
                    />

                  </View>

                </View>

                {isOpen && (

                  <View
                    style={styles.answerContainer}
                  >

                    <View
                      style={styles.answerDivider}
                    />

                    <Text
                      style={styles.answer}
                    >
                      {item.a}
                    </Text>

                  </View>

                )}

              </TouchableOpacity>

            );

          })}

        </View>

      ))}

      {/* ---------------- CONTACT ---------------- */}

      <View style={styles.contactSection}>

        <Text style={styles.sectionLabel}>
          STILL NEED HELP?
        </Text>

        <Text style={styles.sectionHeading}>
          Contact Us
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.contactCard}
        >

          <View>

            <Text style={styles.contactTitle}>
              EMAIL SUPPORT
            </Text>

            <Text style={styles.contactText}>
              support@garrib.com
            </Text>

          </View>

          <View style={styles.contactArrow}>

            <Octicons
              name="arrow-right"
              size={height * 0.024}
              color="#111"
            />

          </View>

        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.contactCard,
            {
              marginTop: height * 0.018,
            },
          ]}
        >

          <View>

            <Text style={styles.contactTitle}>
              CALL SUPPORT
            </Text>

            <Text style={styles.contactText}>
              +91 98765 43210
            </Text>

          </View>

          <View style={styles.contactArrow}>

            <Octicons
              name="device-mobile"
              size={height * 0.024}
              color="#111"
            />

          </View>

        </TouchableOpacity>

      </View>

    </ScrollView>

  </Screen>

);}

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
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.quickCard}
    onPress={onPress}
  >
    <View style={styles.quickIconCircle}>
      <Octicons
        name={icon}
        size={height * 0.026}
        color="#111"
      />
    </View>

    <Text style={styles.quickTitle}>
      {label}
    </Text>

    <Text style={styles.quickSubtitle}>
      Explore
    </Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    paddingBottom: height * 0.06,
  },

  /* ---------------- HERO ---------------- */

  hero: {
    backgroundColor: "#111",
    borderBottomLeftRadius: width * 0.09,
    borderBottomRightRadius: width * 0.09,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.075,
    paddingBottom: height * 0.05,
  },

  label: {
    color: "#B6FF2E",
    fontSize: width * 0.03,
    fontWeight: "900",
    letterSpacing: 3,
  },

  heroTitle: {
    marginTop: height * 0.015,
    color: "#FFF",
    fontSize: width * 0.12,
    lineHeight: width * 0.12,
    fontWeight: "900",
    letterSpacing: -2,
  },

  heroSubtitle: {
    marginTop: height * 0.02,
    color: "#999",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
    width: "88%",
  },

  greenLine: {
    marginTop: height * 0.03,
    width: width * 0.22,
    height: 4,
    borderRadius: 20,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- SEARCH ---------------- */

  searchContainer: {
    marginHorizontal: width * 0.06,
    marginTop: -height * 0.028,
    backgroundColor: "#FFF",
    borderRadius: width * 0.045,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    height: height * 0.07,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: width * 0.03,
    color: "#111",
    fontSize: width * 0.04,
    fontWeight: "600",
  },

  /* ---------------- SECTION ---------------- */

  sectionHeader: {
    marginTop: height * 0.045,
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.022,
  },

  sectionLabel: {
    color: "#73D01C",
    fontSize: width * 0.028,
    fontWeight: "900",
    letterSpacing: 2,
  },

  sectionHeading: {
    marginTop: 4,
    color: "#111",
    fontSize: width * 0.075,
    fontWeight: "900",
    letterSpacing: -1,
  },

  /* ---------------- QUICK GRID ---------------- */

  quickGrid: {
    marginHorizontal: width * 0.06,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: width * 0.07,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },

  quickIconCircle: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  quickTitle: {
    marginTop: height * 0.02,
    color: "#FFF",
    fontSize: width * 0.045,
    fontWeight: "800",
  },

  quickSubtitle: {
    marginTop: 5,
    color: "#888",
    fontSize: width * 0.03,
    fontWeight: "600",
    letterSpacing: 1,
  },

  /* ---------------- CATEGORY ---------------- */

  categorySection: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.06,
  },

  categoryHeader: {
    marginBottom: height * 0.018,
  },

  categoryLabel: {
    color: "#73D01C",
    fontSize: width * 0.027,
    fontWeight: "900",
    letterSpacing: 2,
  },

  categoryTitle: {
    marginTop: 4,
    fontSize: width * 0.065,
    fontWeight: "900",
    color: "#111",
  },

  categoryLine: {
    marginTop: height * 0.015,
    width: width * 0.12,
    height: 3,
    borderRadius: 10,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- FAQ ---------------- */

  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: width * 0.06,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingVertical: height * 0.024,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.018,
  },

  faqCardOpen: {
    borderColor: "#B6FF2E",
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    flex: 1,
    color: "#111",
    fontSize: width * 0.042,
    fontWeight: "800",
    lineHeight: height * 0.03,
    paddingRight: width * 0.04,
  },

  arrowCircle: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  arrowCircleActive: {
    backgroundColor: "#B6FF2E",
  },

  answerContainer: {
    marginTop: height * 0.02,
  },

  answerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: height * 0.018,
  },

  answer: {
    color: "#777",
    fontSize: width * 0.037,
    lineHeight: height * 0.03,
    fontWeight: "500",
  },

  /* ---------------- CONTACT ---------------- */

  contactSection: {
    marginTop: height * 0.055,
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.05,
  },

  contactCard: {
    backgroundColor: "#111",
    borderRadius: width * 0.07,
    paddingVertical: height * 0.028,
    paddingHorizontal: width * 0.055,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  contactTitle: {
    color: "#B6FF2E",
    fontSize: width * 0.03,
    fontWeight: "900",
    letterSpacing: 2,
  },

  contactText: {
    marginTop: height * 0.01,
    color: "#FFF",
    fontSize: width * 0.043,
    fontWeight: "700",
  },

  contactArrow: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

});

