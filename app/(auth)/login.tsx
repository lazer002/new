import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Login() {
  const { promptGoogleLogin, user } = useAuth();
  const router = useRouter();
  const { redirect } = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ───────── VALIDATION ───────── */
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ───────── HANDLERS ───────── */

  const handleContinue = async () => {
    if (!email) {
      return Alert.alert("Required", "Please enter your email");
    }

    if (!isValidEmail(email)) {
      return Alert.alert("Invalid Email", "Enter a valid email address");
    }

    try {
      setLoading(true);

      await api.post("/api/auth/otp/send", { email });

      router.push({
        pathname: "/OTP",
        params: { email, redirect },
      });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await promptGoogleLogin();

    } catch (err) {
      Alert.alert("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (user) {
    router.replace("/");
  }
}, [user]);
  /* ───────── UI ───────── */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subHeading}>
          Login to access your orders, wishlist & more
        </Text>
      </View>

      {/* INPUT */}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: isFocused ? "#000" : "#ddd" },
        ]}
      >
        <Ionicons name="mail-outline" size={20} color="#666" />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {/* CONTINUE */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          !email && { opacity: 0.6 },
        ]}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* DIVIDER */}
      <Text style={styles.orText}>OR</Text>

      {/* GOOGLE */}
      <TouchableOpacity
        style={styles.googleBtn}
        onPress={handleGoogle}
        disabled={loading}
      >
        <MaterialCommunityIcons name="google" size={20} color="#fff" />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.footer}>
        By continuing, you agree to our Terms & Privacy Policy
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  header: {
    marginBottom: 40,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#000",
  },

  subHeading: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  orText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#999",
  },

  googleBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },

  googleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  footer: {
    marginTop: 30,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});