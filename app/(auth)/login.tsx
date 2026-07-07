import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState ,useRef} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated
} from "react-native";
import { Image } from "react-native";
import Screen from "@/components/Screen";
import Toast from "react-native-toast-message";
const { height, width } = Dimensions.get("window");
const slides = [

  {
    title: "Premium",
    subtitle: "Streetwear Without Limits",
  },

  {
    title: "Curated",
    subtitle: "Luxury Meets Everyday",
  },

  {
    title: "Minimal",
    subtitle: "Built For Modern Fashion",
  },

];
export default function Login() {
  const { promptGoogleLogin, user } = useAuth();
  const router = useRouter();
  const { redirect } = useLocalSearchParams();

  const isSmall = height < 700;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- VALIDATION ---------- */
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ---------- HANDLERS ---------- */

  const handleContinue = async () => {
    if (!email) return Toast.show({ type: "error", text1: "Required", text2: "Enter email" });
    if (!isValidEmail(email))
      return Toast.show({ type: "error", text1: "Invalid", text2: "Enter valid email" });

    try {
      setLoading(true);
      await api.post("/api/auth/otp/send", { email });

      router.push({
        pathname: "/otp",
        params: { email, redirect },
      });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err?.response?.data?.error || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await promptGoogleLogin();
      Toast.show({ type: "success", text1: "Logged in with Google", text2: "Successfully logged in with Google" });
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Google Login Failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  /* ---------- UI ---------- */


const opacity = useRef(new Animated.Value(1)).current;
const [index, setIndex] = useState(0);

useEffect(() => {
  let isMounted = true;

  const animate = () => {
    if (!isMounted) return;

    // fade out
    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // change slide
      const next = (index + 1) % slides.length;
      setIndex(next);

      // fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(animate, 5000);
      });
    });
  };

  const timeout = setTimeout(animate, 2000);

  return () => {
    isMounted = false;
    clearTimeout(timeout);
  };
}, [index]);



return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <Screen>

        {/* ================= BACKGROUND ================= */}

        <View style={styles.bgCircleOne} />
        <View style={styles.bgCircleTwo} />
        <View style={styles.gridOverlay} />

        {/* ================= HERO ================= */}

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#111"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
            >
              <Text style={styles.createAccount}>
                CREATE ACCOUNT
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity,
              },
            ]}
          >
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />

              <Text style={styles.brandLabel}>
                PREMIUM STREETWEAR
              </Text>
            </View>

            <Text style={styles.brand}>
              GARRIB
            </Text>

            <Text style={styles.heroTitle}>
              {slides[index].title.toUpperCase()}
            </Text>

            <Text style={styles.heroSubtitle}>
              {slides[index].subtitle}
            </Text>

            <View style={styles.slideIndicator}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Premium Fashion Card */}

          <View style={styles.fashionCard}>
            <View style={styles.fashionGlow} />

            <MaterialCommunityIcons
              name="hanger"
              size={62}
              color="#111"
            />

            <Text style={styles.cardTitle}>
              NEW DROP
            </Text>

            <Text style={styles.cardSubtitle}>
              Editorial Collection
            </Text>

            <View style={styles.cardAccent} />
          </View>
        </View>

        {/* ================= LOGIN SHEET ================= */}

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetEyebrow}>
            MEMBER ACCESS
          </Text>

          <Text style={styles.sheetTitle}>
            Welcome{"\n"}Back.
          </Text>

          <Text style={styles.sheetSubtitle}>
            Sign in to continue your premium shopping experience.
          </Text>

          {/* EMAIL */}

          <Text style={styles.fieldLabel}>
            EMAIL ADDRESS
          </Text>

          <View style={styles.inputBox}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#777"
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
              color="#777"
              style={{ marginRight: 12 }}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPass}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
            >
              <Ionicons
                name={
                  showPass
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgot}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleContinue}
          >
            {loading ? (
              <ActivityIndicator color="#111" />
            ) : (
              <>
                <Text style={styles.loginText}>
                  CONTINUE
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#111"
                  style={{ marginLeft: 10 }}
                />
              </>
            )}
          </TouchableOpacity>
                    {/* DIVIDER */}

          <View style={styles.dividerRow}>
            <View style={styles.line} />

            <View style={styles.dividerChip}>
              <Text style={styles.or}>
                OR CONTINUE WITH
              </Text>
            </View>

            <View style={styles.line} />
          </View>

          {/* GOOGLE */}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogle}
            activeOpacity={0.9}
          >
            <View style={styles.googleIconWrap}>
              <Image
                source={require("@/assets/public/google.png")}
                style={styles.socialIcon}
              />
            </View>

            <Text style={styles.googleText}>
              Continue with Google
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#111"
            />
          </TouchableOpacity>

          {/* REGISTER */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              NEW TO GARRIB?
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/register")}
            >
              <View style={styles.registerButton}>
                <Text style={styles.registerText}>
                  CREATE ACCOUNT
                </Text>

                <View style={styles.registerArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#111"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* BOTTOM BRAND */}

          <View style={styles.bottomBrand}>
            <View style={styles.bottomLine} />

            <Text style={styles.bottomBrandText}>
              MINIMAL LUXURY • MODERN STREETWEAR
            </Text>

            <View style={styles.bottomLine} />
          </View>
        </View>
    </Screen>
  </KeyboardAvoidingView>
);
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({


  /* ---------------- BACKGROUND ---------------- */

  bgCircleOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(182,255,46,0.08)",
    top: -120,
    right: -80,
  },

  bgCircleTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#F7F7F7",
    bottom: 220,
    left: -80,
  },

  gridOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.28,
  },

  /* ---------------- HERO ---------------- */

  hero: {
    height: height * 0.44,
    paddingTop: Platform.OS === "ios" ? 62 : 48,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  createAccount: {
    fontSize: 12,
    color: "#111",
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroContent: {
    marginTop: 18,
    width: "65%",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B6FF2E",
    marginRight: 10,
  },

  brandLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#777",
    letterSpacing: 2,
  },

  brand: {
    fontSize: 48,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 3,
  },

  heroTitle: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 1,
    lineHeight: 36,
  },

  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#777",
    lineHeight: 25,
    paddingRight: 10,
  },

  slideIndicator: {
    flexDirection: "row",
    marginTop: 24,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDD",
    marginRight: 8,
  },

  activeDot: {
    width: 30,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- FASHION CARD ---------------- */

  fashionCard: {
    position: "absolute",
    right: 26,
    bottom: 15,

    width: 145,
    height: 170,

    borderRadius: 34,

    backgroundColor: "#111",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  fashionGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#B6FF2E",
    opacity: 0.28,
  },

  cardTitle: {
    marginTop: 18,
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 2,
  },

  cardSubtitle: {
    marginTop: 6,
    color: "#999",
    fontSize: 11,
    letterSpacing: 1,
  },

  cardAccent: {
    marginTop: 18,
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#B6FF2E",
  },

  /* ---------------- SHEET ---------------- */

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,

    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 34,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 15,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#DDD",
    marginBottom: 22,
  },

  sheetEyebrow: {
    color: "#777",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },

  sheetTitle: {
    color: "#111",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },

  sheetSubtitle: {
    marginTop: 12,
    marginBottom: 34,
    color: "#777",
    lineHeight: 24,
    fontSize: 15,
  },

  fieldLabel: {
    color: "#999",
    fontWeight: "800",
    letterSpacing: 1.4,
    fontSize: 11,
    marginBottom: 10,
  },

  inputBox: {
    height: 60,

    backgroundColor: "#FAFAFA",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#ECECEC",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    marginBottom: 22,
  },

  input: {
    flex: 1,
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },

  forgot: {
    alignSelf: "flex-end",
    color: "#777",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 28,
  },

  loginButton: {
    height: 60,
    borderRadius: 20,

    backgroundColor: "#B6FF2E",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1.5,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ECECEC",
  },

  dividerChip: {
    paddingHorizontal: 12,
  },

  or: {
    color: "#999",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  googleButton: {
    height: 60,

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#ECECEC",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,

    backgroundColor: "#FFF",
  },

  googleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },

  socialIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

  googleText: {
    flex: 1,
    marginLeft: 16,
    color: "#111",
    fontWeight: "700",
    fontSize: 15,
  },
    footer: {
    marginTop: 34,
    alignItems: "center",
  },

  footerText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 18,
  },

  registerButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#111",

    borderRadius: 22,

    paddingVertical: 7,
    paddingLeft: 22,
    paddingRight: 8,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  registerText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginRight: 18,
  },

  registerArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#B6FF2E",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 34,
  },

  bottomLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ECECEC",
  },

  bottomBrandText: {
    marginHorizontal: 14,
    color: "#999",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  sliderContainer: {
    flex: 1,
  },

  slide: {
    width: "100%",
  },

  socialDark: {
    fontWeight: "600",
    color: "#333",
  },

  smallTop: {
    textAlign: "right",
    fontSize: 12,
    color: "#AAA",
    marginBottom: 10,
  },

  link: {
    color: "#111",
    fontWeight: "700",
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  sub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },

  btn: {
    borderRadius: 20,
    marginTop: 6,
  },

  btnInner: {
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  socialBtn: {
    width: width * 0.9,
    height: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ECECEC",
    gap: 8,
    backgroundColor: "#FFF",
  },

  socialText: {
    fontWeight: "700",
    color: "#111",
  },
});