
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function OTP() {
  const { setUser } = useAuth();
  const router = useRouter();
  const { email, redirect } = useLocalSearchParams();

  const safeRedirect =
    typeof redirect === "string" ? redirect : redirect?.[0];

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputs = useRef<TextInput[]>([]);

  /* 🔥 FADE HEADER */
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  /* ⏱ TIMER */
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* 🔢 OTP INPUT HANDLER */
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const otpValue = otp.join("");

  /* 🔐 VERIFY */
  const handleVerify = async () => {
    if (otpValue.length < 6) {
      return Toast.show({ type: "error", text1: "Enter full OTP" });
    }

    try {
      setLoading(true);

      const { data } = await api.post("/api/auth/otp/verify", {
        email,
        otp: otpValue,
      });

      setUser(data.user);

      Toast.show({ type: "success", text1: "Welcome 🎉" });

      router.replace(safeRedirect || "/");

    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.error || "Invalid OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  /* 🔁 RESEND */
  const handleResend = async () => {
    if (timer > 0) return;

    try {
      await api.post("/api/auth/otp/send", { email });
      setTimer(30);

      Toast.show({ type: "success", text1: "OTP resent" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to resend" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>

        {/* 🔵 HEADER */}
        <LinearGradient colors={["#757575", "#0a0a0a"]} style={styles.top}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Animated.View style={{ opacity, transform: [{ scale }] }}>
            <Text style={styles.logo}>Verify OTP</Text>
            <Text style={styles.tag}>Sent to {email}</Text>
          </Animated.View>
        </LinearGradient>

        {/* ⚪ SHEET */}
        <View style={styles.sheet}>
          <Text style={styles.heading}>Enter Code</Text>
          <Text style={styles.sub}>We sent a 6-digit code</Text>

          {/* 🔢 OTP BOXES */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
            ref={(ref) => {
  inputs.current[i] = ref!;
}}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={1}
              />
            ))}
          </View>

          {/* VERIFY BUTTON */}
          <LinearGradient colors={["#757575", "#0a0a0a"]} style={styles.btn}>
            <TouchableOpacity style={styles.btnInner} onPress={handleVerify}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Verify</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {/* RESEND */}
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resend}>
              {timer > 0
                ? `Resend in ${timer}s`
                : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* 🎨 STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef1f7" },

  top: {
    height: height * 0.4,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  back: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
  },

  logo: { color: "#fff", fontSize: 28, fontWeight: "700" },
  tag: { color: "#ccc", fontSize: 13, marginTop: 6 },

  sheet: {
    position: "absolute",
    bottom: height * 0.05,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 24,
    elevation: 10,
  },

  heading: { fontSize: 22, fontWeight: "700" },
  sub: { color: "#888", marginBottom: 20 },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#f7f8fc",
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },

  btn: { borderRadius: 12 },
  btnInner: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },

  resend: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

