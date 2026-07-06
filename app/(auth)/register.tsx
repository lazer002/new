
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,

  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");

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

  const isSmall = height < 700;

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
      <View style={styles.container}>
        
        {/* 🔵 HEADER */}
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
      onPress={() => router.push("/login")}
    >

      <Text style={styles.loginLink}>
        SIGN IN
      </Text>

    </TouchableOpacity>

  </View>

  <Animated.View
    style={[
      styles.heroCenter,
      {
        opacity,
        transform:[
          { scale }
        ]
      },
    ]}
  >

    <Text style={styles.brand}>
      GARRIB
    </Text>

    <View style={styles.brandAccent} />

    <Text style={styles.heroTitle}>
      {slides[index].title}
    </Text>

    <Text style={styles.heroSubtitle}>
      {slides[index].subtitle}
    </Text>

  </Animated.View>

  <View style={styles.heroCard}>

    <View style={styles.heroGlow} />

    <Ionicons
      name="shirt-outline"
      size={74}
      color="#111"
    />

  </View>

</View>

        {/* ⚪ FORM */}
<View
  style={[
    styles.sheet,
    {
      top: isSmall
        ? height * 0.31
        : height * 0.34,
    },
  ]}
>

  <Text style={styles.sheetTitle}>
    Create Account
  </Text>

  <Text style={styles.sheetSubtitle}>
    Build your premium fashion profile and start shopping.
  </Text>

  {/* NAME */}

  <Text style={styles.fieldLabel}>
    FULL NAME
  </Text>

  <View style={styles.inputBox}>

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
        color="#666"
      />

    </TouchableOpacity>

  </View>

  <TouchableOpacity
    style={styles.registerButton}
    onPress={handleRegister}
  >

    {loading ? (

      <ActivityIndicator
        color="#FFF"
      />

    ) : (

      <Text style={styles.registerText}>
        CREATE ACCOUNT
      </Text>

    )}

  </TouchableOpacity>

  <View style={styles.bottomRow}>

    <Text style={styles.bottomText}>
      Already have an account?
    </Text>

    <TouchableOpacity
      onPress={() =>
        router.push("/login")
      }
    >

      <Text style={styles.bottomLink}>
        SIGN IN
      </Text>

    </TouchableOpacity>

  </View>

</View>
        </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f7",
  },

  hero: {

  height: height * 0.42,

  backgroundColor: "#FFF",

  paddingTop:
    Platform.OS === "ios"
      ? 62
      : 46,

  paddingHorizontal: 24,

},
sheet: {

  position: "absolute",

  left: 0,

  right: 0,

  bottom: 0,

  backgroundColor: "#FFF",

  borderTopLeftRadius: 42,

  borderTopRightRadius: 42,

  paddingHorizontal: 28,

  paddingTop: 36,

  paddingBottom: 36,

  shadowColor: "#000",

  shadowOpacity: .08,

  shadowRadius: 25,

  shadowOffset: {
    width: 0,
    height: -8,
  },

},

sheetTitle: {

  fontSize: 34,

  fontWeight: "900",

  color: "#111",

  letterSpacing: .5,

},

sheetSubtitle: {

  marginTop: 10,

  marginBottom: 32,

  color: "#777",

  fontSize: 15,

  lineHeight: 23,

},

fieldLabel: {

  color: "#999",

  fontSize: 11,

  fontWeight: "800",

  letterSpacing: 1.3,

  marginBottom: 10,

},

inputBox: {

  height: 58,

  borderRadius: 18,

  backgroundColor: "#F8F8F8",

  borderWidth: 1,

  borderColor: "#ECECEC",

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: 18,

  marginBottom: 20,

},

input: {

  flex: 1,

  color: "#111",

  fontSize: 16,

  fontWeight: "600",

},

registerButton: {

  marginTop: 14,

  height: 60,

  borderRadius: 18,

  backgroundColor: "#111",

  justifyContent: "center",

  alignItems: "center",

},

registerText: {

  color: "#FFF",

  fontSize: 16,

  fontWeight: "900",

  letterSpacing: 1,

},

bottomRow: {

  marginTop: 30,

  flexDirection: "row",

  justifyContent: "center",

  alignItems: "center",

},

bottomText: {

  color: "#777",

  fontSize: 14,

},

bottomLink: {

  marginLeft: 8,

  color: "#111",

  fontWeight: "900",

  letterSpacing: .8,

},
heroTop: {

  flexDirection: "row",

  justifyContent: "space-between",

  alignItems: "center",

},

backButton: {

  width: 48,

  height: 48,

  borderRadius: 16,

  backgroundColor: "#F5F5F5",

  justifyContent: "center",

  alignItems: "center",

},

loginLink: {

  fontSize: 12,

  fontWeight: "900",

  letterSpacing: 1.2,

  color: "#111",

},

heroCenter: {

  marginTop: 48,

},

brand: {

  fontSize: 42,

  fontWeight: "900",

  color: "#111",

  letterSpacing: 2,

},

brandAccent: {

  width: 84,

  height: 5,

  borderRadius: 3,

  backgroundColor: "#B6FF2E",

  marginTop: 12,

  marginBottom: 26,

},

heroTitle: {

  fontSize: 30,

  fontWeight: "900",

  color: "#111",

  letterSpacing: 1,

},

heroSubtitle: {

  marginTop: 10,

  fontSize: 16,

  color: "#777",

  lineHeight: 24,

},

heroCard: {

  position: "absolute",

  right: 26,

  bottom: 12,

  width: 132,

  height: 132,

  borderRadius: 34,

  backgroundColor: "#F7F7F7",

  borderWidth: 1,

  borderColor: "#ECECEC",

  justifyContent: "center",

  alignItems: "center",

},

heroGlow: {

  position: "absolute",

  width: 62,

  height: 62,

  borderRadius: 31,

  backgroundColor: "#B6FF2E",

  opacity: .18,

},
});

