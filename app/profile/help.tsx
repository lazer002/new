
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
              size={verticalScale(20)}
              color="#111"
            />

          </View>

        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.contactCard,
            {
              marginTop: verticalScale(15),
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
              size={verticalScale(20)}
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
        size={verticalScale(22)}
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
    paddingBottom: verticalScale(51),
  },

  /* ---------------- HERO ---------------- */

  hero: {
    backgroundColor: "#111",
    borderBottomLeftRadius: scale(35),
    borderBottomRightRadius: scale(35),
    paddingHorizontal: scale(23),
    paddingTop: verticalScale(63),
    paddingBottom: verticalScale(42),
  },

  label: {
    color: "#B6FF2E",
    fontSize: normalize(12),
    fontWeight: "900",
    letterSpacing: 3,
  },

  heroTitle: {
    marginTop: verticalScale(13),
    color: "#FFF",
    fontSize: normalize(47),
    lineHeight: normalize(47),
    fontWeight: "900",
    letterSpacing: -2,
  },

  heroSubtitle: {
    marginTop: verticalScale(17),
    color: "#999",
    fontSize: normalize(15),
    lineHeight: normalize(25),
    width: "88%",
  },

  greenLine: {
    marginTop: verticalScale(25),
    width: scale(86),
    height: 4,
    borderRadius: 20,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- SEARCH ---------------- */

  searchContainer: {
    marginHorizontal: scale(23),
    marginTop: -verticalScale(24),
    backgroundColor: "#FFF",
    borderRadius: scale(18),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    height: verticalScale(59),

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
    marginLeft: scale(12),
    color: "#111",
    fontSize: normalize(16),
    fontWeight: "600",
  },

  /* ---------------- SECTION ---------------- */

  sectionHeader: {
    marginTop: verticalScale(38),
    marginHorizontal: scale(23),
    marginBottom: verticalScale(19),
  },

  sectionLabel: {
    color: "#73D01C",
    fontSize: normalize(11),
    fontWeight: "900",
    letterSpacing: 2,
  },

  sectionHeading: {
    marginTop: 4,
    color: "#111",
    fontSize: normalize(29),
    fontWeight: "900",
    letterSpacing: -1,
  },

  /* ---------------- QUICK GRID ---------------- */

  quickGrid: {
    marginHorizontal: scale(23),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: scale(27),
    paddingVertical: verticalScale(25),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(17),
  },

  quickIconCircle: {
    width: scale(51),
    height: scale(51),
    borderRadius: scale(25),
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  quickTitle: {
    marginTop: verticalScale(17),
    color: "#FFF",
    fontSize: normalize(18),
    fontWeight: "800",
  },

  quickSubtitle: {
    marginTop: 5,
    color: "#888",
    fontSize: normalize(12),
    fontWeight: "600",
    letterSpacing: 1,
  },

  /* ---------------- CATEGORY ---------------- */

  categorySection: {
    marginTop: verticalScale(17),
    marginHorizontal: scale(23),
  },

  categoryHeader: {
    marginBottom: verticalScale(15),
  },

  categoryLabel: {
    color: "#73D01C",
    fontSize: normalize(11),
    fontWeight: "900",
    letterSpacing: 2,
  },

  categoryTitle: {
    marginTop: 4,
    fontSize: normalize(25),
    fontWeight: "900",
    color: "#111",
  },

  categoryLine: {
    marginTop: verticalScale(13),
    width: scale(47),
    height: 3,
    borderRadius: 10,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- FAQ ---------------- */

  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: scale(23),
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
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
    fontSize: normalize(16),
    fontWeight: "800",
    lineHeight: normalize(25),
    paddingRight: scale(16),
  },

  arrowCircle: {
    width: scale(39),
    height: scale(39),
    borderRadius: scale(20),
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  arrowCircleActive: {
    backgroundColor: "#B6FF2E",
  },

  answerContainer: {
    marginTop: verticalScale(17),
  },

  answerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: verticalScale(15),
  },

  answer: {
    color: "#777",
    fontSize: normalize(14),
    lineHeight: normalize(25),
    fontWeight: "500",
  },

  /* ---------------- CONTACT ---------------- */

  contactSection: {
    marginTop: verticalScale(46),
    marginHorizontal: scale(23),
    marginBottom: verticalScale(42),
  },

  contactCard: {
    backgroundColor: "#111",
    borderRadius: scale(27),
    paddingVertical: verticalScale(24),
    paddingHorizontal: scale(21),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  contactTitle: {
    color: "#B6FF2E",
    fontSize: normalize(12),
    fontWeight: "900",
    letterSpacing: 2,
  },

  contactText: {
    marginTop: verticalScale(8),
    color: "#FFF",
    fontSize: normalize(17),
    fontWeight: "700",
  },

  contactArrow: {
    width: scale(51),
    height: scale(51),
    borderRadius: scale(25),
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

});

