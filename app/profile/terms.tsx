import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

import Screen from "@/components/Screen";

import Octicons from "@expo/vector-icons/Octicons";

import { normalize, scale, verticalScale } from "@/utils/responsive";

const { width, height } = Dimensions.get("window");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
const TERMS = [

  {
    title: "Account",
    icon: "person",
    content:
      "By creating a GARRIB account you agree to provide accurate information and keep your login credentials secure. You are responsible for all activities that occur under your account.",
  },

  {
    title: "Orders",
    icon: "package",
    content:
      "All orders are subject to product availability and payment verification. GARRIB reserves the right to cancel orders because of pricing errors, inventory issues or suspected fraudulent activity.",
  },

  {
    title: "Payments",
    icon: "credit-card",
    content:
      "We accept UPI, Credit Cards, Debit Cards, Net Banking, Wallets and Cash on Delivery where available. All payments are processed securely using trusted payment gateways.",
  },

  {
    title: "Shipping",
    icon: "truck",
    content:
      "Orders are generally delivered within 3–7 business days. Delivery timelines may vary depending on your location, weather conditions or courier operations.",
  },

  {
    title: "Returns",
    icon: "sync",
    content:
      "Eligible products may be returned within 7 days of delivery. Returned items must be unused, unwashed and include original packaging unless the product is defective.",
  },

  {
    title: "Privacy",
    icon: "shield-check",
    content:
      "We collect only the information required to provide our services including order processing, delivery, support and personalized shopping experiences. Your information is never sold.",
  },

  {
    title: "Your Rights",
    icon: "law",
    content:
      "You may request access, correction or deletion of your personal information by contacting our support team in accordance with applicable laws.",
  },

];


export default function TermsPrivacyScreen() {

  const [open, setOpen] =
    useState<number | null>(0);

  const toggle = (index: number) => {

    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    setOpen(
      open === index ? null : index
    );

  };

  return (

    <Screen>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ---------- HERO ---------- */}

        <View style={styles.hero}>

          <Text style={styles.label}>
            LEGAL
          </Text>

          <Text style={styles.heroTitle}>
            Terms{"\n"}&
            {"\n"}Privacy
          </Text>

          <Text style={styles.heroSubtitle}>
            Everything you need to know
            before shopping with GARRIB.
          </Text>

          <View style={styles.greenLine} />

        </View>

        {/* ---------- INTRO ---------- */}

        <View style={styles.introCard}>

          <Text style={styles.introTitle}>
            OUR COMMITMENT
          </Text>

          <Text style={styles.introText}>
            We believe shopping should be
            transparent, secure and simple.
            Please review these policies to
            understand your rights,
            responsibilities and how we
            protect your information.
          </Text>

        </View>

        {/* ---------- TERMS ---------- */}

        {TERMS.map((item, index) => {

          const expanded =
            open === index;

          return (

            <TouchableOpacity

              key={item.title}

              activeOpacity={0.9}

              style={[
                styles.card,

                expanded &&
                  styles.cardActive,

              ]}

              onPress={() =>
                toggle(index)
              }

            >

              <View
                style={styles.cardHeader}
              >

                <View
                  style={styles.iconCircle}
                >

                  <Octicons
                    name={item.icon as any}
                    size={verticalScale(20)}
                    color="#111"
                  />

                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 18,
                  }}
                >

                  <Text
                    style={styles.cardTitle}
                  >
                    {item.title}
                  </Text>

                </View>

                <View
                  style={[
                    styles.arrowCircle,

                    expanded &&
                      styles.arrowCircleActive,

                  ]}
                >

                  <Octicons
                    name={
                      expanded
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color={
                      expanded
                        ? "#111"
                        : "#FFF"
                    }
                  />

                </View>

              </View>

              {expanded && (

                <View
                  style={styles.answerContainer}
                >

                  <View
                    style={styles.divider}
                  />

                  <Text
                    style={styles.answer}
                  >
                    {item.content}
                  </Text>

                </View>

              )}

            </TouchableOpacity>

          );

        })}

                {/* ---------- CONTACT ---------- */}

        <View style={styles.contactSection}>

          <Text style={styles.sectionLabel}>
            NEED HELP?
          </Text>

          <Text style={styles.sectionHeading}>
            Contact Support
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.contactCard}
          >

            <View>

              <Text style={styles.contactTitle}>
                EMAIL
              </Text>

              <Text style={styles.contactText}>
                support@garrib.com
              </Text>

            </View>

            <View style={styles.contactIcon}>

              <Octicons
                name="mail"
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
                marginTop: verticalScale(17),
              },
            ]}
          >

            <View>

              <Text style={styles.contactTitle}>
                PHONE
              </Text>

              <Text style={styles.contactText}>
                +91 98765 43210
              </Text>

            </View>

            <View style={styles.contactIcon}>

              <Octicons
                name="device-mobile"
                size={verticalScale(20)}
                color="#111"
              />

            </View>

          </TouchableOpacity>

        </View>

        {/* ---------- FOOTER ---------- */}

        <View style={styles.footerCard}>

          <Text style={styles.footerLabel}>
            GARRIB
          </Text>

          <Text style={styles.footerTitle}>
            Premium Fashion.
          </Text>

          <Text style={styles.footerSubtitle}>
            By continuing to use GARRIB you
            agree to these Terms &
            Privacy Policy. We are committed
            to protecting your data while
            delivering a premium shopping
            experience.
          </Text>

          <View style={styles.footerButton}>

            <Text style={styles.footerButtonText}>
              SHOP WITH CONFIDENCE
            </Text>

            <View style={styles.footerArrow}>

              <Octicons
                name="arrow-right"
                size={18}
                color="#111"
              />

            </View>

          </View>

        </View>

      </ScrollView>

    </Screen>

  );

}


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
    paddingTop: verticalScale(63),
    paddingBottom: verticalScale(46),
    paddingHorizontal: scale(23),
    borderBottomLeftRadius: scale(35),
    borderBottomRightRadius: scale(35),
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
    fontWeight: "900",
    lineHeight: normalize(47),
    letterSpacing: -2,
  },

  heroSubtitle: {
    marginTop: verticalScale(19),
    color: "#9A9A9A",
    width: "88%",
    fontSize: normalize(15),
    lineHeight: normalize(25),
  },

  greenLine: {
    marginTop: verticalScale(25),
    width: scale(86),
    height: 4,
    borderRadius: 20,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- INTRO ---------------- */

  introCard: {
    marginTop: -verticalScale(25),
    marginHorizontal: scale(23),
    backgroundColor: "#FFF",
    borderRadius: scale(27),
    padding: scale(23),

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  introTitle: {
    color: "#111",
    fontSize: normalize(13),
    fontWeight: "900",
    letterSpacing: 2,
  },

  introText: {
    marginTop: verticalScale(15),
    color: "#777",
    fontSize: normalize(15),
    lineHeight: normalize(25),
  },

  /* ---------------- CARD ---------------- */

  card: {
    marginTop: verticalScale(17),
    marginHorizontal: scale(23),
    backgroundColor: "#FFF",
    borderRadius: scale(25),
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(21),
  },

  cardActive: {
    borderColor: "#B6FF2E",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: scale(51),
    height: scale(51),
    borderRadius: scale(25),
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    color: "#111",
    fontSize: normalize(20),
    fontWeight: "900",
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

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: verticalScale(15),
  },

  answer: {
    color: "#777",
    fontSize: normalize(15),
    lineHeight: normalize(25),
  },
    /* ---------------- CONTACT ---------------- */

  contactSection: {
    marginTop: verticalScale(46),
    marginHorizontal: scale(23),
  },

  sectionLabel: {
    color: "#73D01C",
    fontSize: normalize(12),
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  sectionHeading: {
    marginTop: 4,
    color: "#111",
    fontSize: normalize(29),
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: verticalScale(21),
  },

  contactCard: {
    backgroundColor: "#111",
    borderRadius: scale(27),
    paddingHorizontal: scale(23),
    paddingVertical: verticalScale(25),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
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
    fontSize: normalize(18),
    fontWeight: "700",
  },

  contactIcon: {
    width: scale(55),
    height: scale(55),
    borderRadius: scale(27),
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ---------------- FOOTER ---------------- */

  footerCard: {
    marginHorizontal: scale(23),
    marginTop: verticalScale(46),
    marginBottom: verticalScale(51),
    backgroundColor: "#111",
    borderRadius: scale(31),
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(34),
  },

  footerLabel: {
    color: "#B6FF2E",
    fontSize: normalize(12),
    fontWeight: "900",
    letterSpacing: 3,
  },

  footerTitle: {
    marginTop: verticalScale(13),
    color: "#FFF",
    fontSize: normalize(29),
    fontWeight: "900",
    letterSpacing: -1,
  },

  footerSubtitle: {
    marginTop: verticalScale(17),
    color: "#999",
    fontSize: normalize(15),
    lineHeight: normalize(25),
  },

  footerButton: {
    marginTop: verticalScale(30),
    height: verticalScale(61),
    borderRadius: verticalScale(30),
    backgroundColor: "#B6FF2E",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingLeft: scale(23),
    paddingRight: scale(10),
  },

  footerButtonText: {
    color: "#111",
    fontSize: normalize(14),
    fontWeight: "900",
    letterSpacing: 1,
  },

  footerArrow: {
    width: scale(47),
    height: scale(47),
    borderRadius: scale(23),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

});