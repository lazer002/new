
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,ScrollView
} from "react-native";
import Toast from "react-native-toast-message";
import { scale, verticalScale, normalize } from "@/utils/responsive";

/* 🔥 HEADER SLIDES */
const slides = [

  {
    title: "PREMIUM",
    subtitle: "Join the Future of Streetwear",
  },

  {
    title: "CURATED",
    subtitle: "Luxury Meets Everyday Style",
  },

  {
    title: "GARRIB",
    subtitle: "Create Your Fashion Identity",
  },

];

export default function Register() {
  const { register, user } = useAuth();
  const router = useRouter();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🔥 FADE + SCALE ANIMATION */

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const next = (index + 1) % slides.length;
        setIndex(next);

        scale.setValue(1.05);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(animate, 2000);
        });
      });
    };

    const timeout = setTimeout(animate, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [index]);

  /* ---------- VALIDATION ---------- */

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ---------- REGISTER ---------- */

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Toast.show({
        type: "error",
        text1: "All fields required",
      });
    }

    if (!isValidEmail(email)) {
      return Toast.show({
        type: "error",
        text1: "Invalid email",
      });
    }

    try {
      setLoading(true);

      await register(name, email, password);

      Toast.show({
        type: "success",
        text1: "Account Created 🎉",
      });

    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.error || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  /* ---------- UI ---------- */


return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      {/* ================= HERO ================= */}

      <View style={styles.hero}>
        <Image
          source={require("@/assets/public/banner3.jpg")}
          style={styles.heroImage}
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,.20)",
            "rgba(0,0,0,.88)",
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Bar */}

        <View style={styles.heroTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginLink}>
              SIGN IN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}

        <Animated.View
          style={[
            styles.heroContent,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.collectionTag}>
            <View style={styles.collectionDot} />

            <Text style={styles.collectionText}>
              NEW COLLECTION
            </Text>
          </View>

          <Text style={styles.brand}>
            GARRIB
          </Text>

          <Text style={styles.heroTitle}>
            {slides[index].title}
          </Text>

          <Text style={styles.heroSubtitle}>
            {slides[index].subtitle}
          </Text>

          <View style={styles.sliderRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.sliderDot,
                  i === index &&
                    styles.sliderDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* ================= FORM ================= */}

      <View style={styles.formCard}>
        <View style={styles.handle} />

        <Text style={styles.sheetEyebrow}>
          CREATE ACCOUNT
        </Text>

        <Text style={styles.sheetTitle}>
          Join{"\n"}the Collective.
        </Text>

        <Text style={styles.sheetSubtitle}>
          Create your premium fashion profile and
          discover curated collections.
        </Text>

        {/* NAME */}

        <Text style={styles.fieldLabel}>
          FULL NAME
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#666"
            style={{ marginRight: 12 }}
          />

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* EMAIL */}

        <Text style={styles.fieldLabel}>
          EMAIL ADDRESS
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={{ marginRight: 12 }}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* PASSWORD */}

        <Text style={styles.fieldLabel}>
          PASSWORD
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={{ marginRight: 12 }}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create password"
            placeholderTextColor="#999"
            secureTextEntry={!showPass}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={() =>
              setShowPass(!showPass)
            }
          >
            <Ionicons
              name={
                showPass
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={20}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
        >
          {loading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <Text style={styles.primaryText}>
                CREATE ACCOUNT
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#111"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
                {/* TERMS */}

        <Text style={styles.termsText}>
          By creating an account you agree to our{" "}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {" "}and{" "}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>

        {/* LOGIN */}

        <View style={styles.footer}>
          <Text style={styles.footerLabel}>
            ALREADY HAVE AN ACCOUNT?
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/login")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              SIGN IN
            </Text>

            <View style={styles.secondaryCircle}>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#111"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}

        <View style={styles.brandFooter}>
          <View style={styles.footerLine} />

          <Text style={styles.brandFooterText}>
            PREMIUM STREETWEAR • MINIMAL LUXURY
          </Text>

          <View style={styles.footerLine} />
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    // paddingBottom: 40,
    backgroundColor: "#F8F8F8",
  },

  /* ================= HERO ================= */

  hero: {
    height: verticalScale(380),
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#111",
  },

  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
  },

  heroTop: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 45,
    left: 24,
    right: 24,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    zIndex: 100,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,.12)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,.18)",
  },

  loginLink: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: normalize(12),
    letterSpacing: 2,
  },

  heroContent: {
    position: "absolute",
    left: scale(31),
    right: scale(31),
    top: verticalScale(118),
  },

  collectionTag: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 50,

    backgroundColor: "rgba(255,255,255,.15)",

    marginBottom: 4,
  },

  collectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: "#B6FF2E",

    marginRight: 8,
  },

  collectionText: {
    color: "#FFF",
    fontSize: normalize(10),
    fontWeight: "800",
    letterSpacing: 2,
  },

  brand: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: normalize(54),
    letterSpacing: 4,
  },

  heroTitle: {
    marginTop: 16,

    color: "#FFF",

    fontSize: normalize(34),
    fontWeight: "900",

    lineHeight: normalize(40),
  },

  heroSubtitle: {
    marginTop: 12,

    color: "rgba(255,255,255,.75)",

    fontSize: normalize(16),
    lineHeight: normalize(25),

    width: "85%",
  },

  sliderRow: {
    flexDirection: "row",
    marginTop: 24,
  },

  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,

    marginRight: 8,

    backgroundColor: "rgba(255,255,255,.25)",
  },

  sliderDotActive: {
    width: 32,
    backgroundColor: "#B6FF2E",
  },

  /* ================= FORM CARD ================= */

  formCard: {
    marginTop: -(verticalScale(34)),

    backgroundColor: "#FFF",

    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,

    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 36,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -6,
    },

    elevation: 10,
  },

  handle: {
    alignSelf: "center",

    width: 52,
    height: 5,

    borderRadius: 4,

    backgroundColor: "#DDD",

    marginBottom: 22,
  },

  sheetEyebrow: {
    color: "#888",
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: normalize(11),
  },

  sheetTitle: {
    marginTop: 10,

    color: "#111",

    fontSize: normalize(38),
    fontWeight: "900",

    lineHeight: normalize(42),
  },

  sheetSubtitle: {
    marginTop: 12,
    marginBottom: 34,

    color: "#777",

    fontSize: normalize(15),
    lineHeight: normalize(24),
  },

  fieldLabel: {
    color: "#999",
    fontWeight: "800",
    fontSize: normalize(11),
    letterSpacing: 1.5,

    marginBottom: 10,
  },

  inputBox: {
    height: 60,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    backgroundColor: "#FAFAFA",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#ECECEC",

    marginBottom: 20,
  },

  input: {
    flex: 1,

    color: "#111",

    fontSize: normalize(16),
    fontWeight: "600",
  },

  primaryButton: {
    height: 60,

    marginTop: 10,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",
  },

  primaryText: {
    color: "#111",
    fontWeight: "900",
    fontSize: normalize(15),
    letterSpacing: 1.4,
  },
    /* ================= TERMS ================= */

  termsText: {
    marginTop: 20,
    color: "#8A8A8A",
    textAlign: "center",
    fontSize: normalize(12),
    lineHeight: normalize(20),
    paddingHorizontal: 8,
  },

  termsLink: {
    color: "#111",
    fontWeight: "800",
  },

  /* ================= FOOTER ================= */

  footer: {
    marginTop: 34,
    alignItems: "center",
  },

  footerLabel: {
    color: "#888",
    fontSize: normalize(12),
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 18,
  },

  secondaryButton: {
    height: 60,

    backgroundColor: "#111",

    borderRadius: 30,

    paddingLeft: 24,
    paddingRight: 8,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 6,
  },

  secondaryText: {
    color: "#FFF",
    fontSize: normalize(14),
    fontWeight: "900",
    letterSpacing: 1.5,
    marginRight: 18,
  },

  secondaryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#B6FF2E",
  },

  /* ================= BRAND FOOTER ================= */

  brandFooter: {
    marginTop: 34,

    flexDirection: "row",
    alignItems: "center",
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ECECEC",
  },

  brandFooterText: {
    marginHorizontal: 14,

    color: "#999",

    fontSize: normalize(9),
    fontWeight: "800",

    letterSpacing: 2,

    textAlign: "center",
  },

  /* ================= PREMIUM EXTRAS ================= */

  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 26,
  },

  caption: {
    color: "#666",
    fontSize: normalize(13),
    lineHeight: normalize(22),
  },

  accent: {
    color: "#B6FF2E",
  },

  /* Legacy */

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomText: {
    color: "#777",
    fontSize: normalize(14),
  },

  bottomLink: {
    marginLeft: 8,
    color: "#111",
    fontWeight: "900",
    letterSpacing: 1,
  },

  registerButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#111",
    fontSize: normalize(15),
    fontWeight: "900",
    letterSpacing: 1.4,
  },
});