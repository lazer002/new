
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");

/* 🔥 HEADER SLIDES */
const slides = [
  { title: "Join Monkey", subtitle: "Create your account" },
  { title: "Fast Setup", subtitle: "Get started quickly" },
  { title: "Secure", subtitle: "Your data is safe" },
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
        <LinearGradient
          colors={["#757575", "#0a0a0a"]}
          style={styles.top}
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* 🔥 FADE TEXT */}
          <Animated.View
            style={[
              styles.slide,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            <Text style={styles.logo}>{slides[index].title}</Text>
            <Text style={styles.tag}>{slides[index].subtitle}</Text>
          </Animated.View>
        </LinearGradient>

        {/* ⚪ FORM */}
        <View
          style={[
            styles.sheet,
            {
              top: isSmall ? height * 0.28 : height * 0.32,
              padding: isSmall ? 18 : 24,
            },
          ]}
        >
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.sub}>Enter your details</Text>

          {/* NAME */}
          <View style={styles.inputBox}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputBox}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputBox}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPass}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <LinearGradient
            colors={["#757575", "#0a0a0a"]}
            style={styles.btn}
          >
            <TouchableOpacity
              style={styles.btnInner}
              onPress={handleRegister}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {/* LOGIN LINK */}
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
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

  top: {
    height: height * 0.4,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
  },

  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
  },

  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  tag: {
    color: "#ddd",
    fontSize: 13,
    marginTop: 6,
  },

  slide: {
    justifyContent: "center",
    alignItems: "center",
  },

  sheet: {
    position: "absolute",
    left: 1,
    right: 1,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 26,
    elevation: 10,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
  },

  sub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fc",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  btn: {
    borderRadius: 12,
    marginTop: 10,
  },

  btnInner: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

