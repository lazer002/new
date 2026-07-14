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
                    size={height * 0.024}
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
                marginTop: height * 0.02,
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
                size={height * 0.024}
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
    paddingBottom: height * 0.06,
  },

  /* ---------------- HERO ---------------- */

  hero: {
    backgroundColor: "#111",
    paddingTop: height * 0.075,
    paddingBottom: height * 0.055,
    paddingHorizontal: width * 0.06,
    borderBottomLeftRadius: width * 0.09,
    borderBottomRightRadius: width * 0.09,
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
    fontWeight: "900",
    lineHeight: width * 0.12,
    letterSpacing: -2,
  },

  heroSubtitle: {
    marginTop: height * 0.022,
    color: "#9A9A9A",
    width: "88%",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
  },

  greenLine: {
    marginTop: height * 0.03,
    width: width * 0.22,
    height: 4,
    borderRadius: 20,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- INTRO ---------------- */

  introCard: {
    marginTop: -height * 0.03,
    marginHorizontal: width * 0.06,
    backgroundColor: "#FFF",
    borderRadius: width * 0.07,
    padding: width * 0.06,

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
    fontSize: width * 0.034,
    fontWeight: "900",
    letterSpacing: 2,
  },

  introText: {
    marginTop: height * 0.018,
    color: "#777",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
  },

  /* ---------------- CARD ---------------- */

  card: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.06,
    backgroundColor: "#FFF",
    borderRadius: width * 0.065,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.025,
  },

  cardActive: {
    borderColor: "#B6FF2E",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    color: "#111",
    fontSize: width * 0.05,
    fontWeight: "900",
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

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: height * 0.018,
  },

  answer: {
    color: "#777",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
  },
    /* ---------------- CONTACT ---------------- */

  contactSection: {
    marginTop: height * 0.055,
    marginHorizontal: width * 0.06,
  },

  sectionLabel: {
    color: "#73D01C",
    fontSize: width * 0.03,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  sectionHeading: {
    marginTop: 4,
    color: "#111",
    fontSize: width * 0.075,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: height * 0.025,
  },

  contactCard: {
    backgroundColor: "#111",
    borderRadius: width * 0.07,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.03,
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
    fontSize: width * 0.03,
    fontWeight: "900",
    letterSpacing: 2,
  },

  contactText: {
    marginTop: height * 0.01,
    color: "#FFF",
    fontSize: width * 0.045,
    fontWeight: "700",
  },

  contactIcon: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.07,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ---------------- FOOTER ---------------- */

  footerCard: {
    marginHorizontal: width * 0.06,
    marginTop: height * 0.055,
    marginBottom: height * 0.06,
    backgroundColor: "#111",
    borderRadius: width * 0.08,
    paddingHorizontal: width * 0.065,
    paddingVertical: height * 0.04,
  },

  footerLabel: {
    color: "#B6FF2E",
    fontSize: width * 0.03,
    fontWeight: "900",
    letterSpacing: 3,
  },

  footerTitle: {
    marginTop: height * 0.015,
    color: "#FFF",
    fontSize: width * 0.075,
    fontWeight: "900",
    letterSpacing: -1,
  },

  footerSubtitle: {
    marginTop: height * 0.02,
    color: "#999",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
  },

  footerButton: {
    marginTop: height * 0.035,
    height: height * 0.072,
    borderRadius: height * 0.036,
    backgroundColor: "#B6FF2E",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingLeft: width * 0.06,
    paddingRight: width * 0.025,
  },

  footerButtonText: {
    color: "#111",
    fontSize: width * 0.037,
    fontWeight: "900",
    letterSpacing: 1,
  },

  footerArrow: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

});