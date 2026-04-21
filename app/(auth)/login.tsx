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
import Toast from "react-native-toast-message";
const { height, width } = Dimensions.get("window");
const slides = [
  { title: "Monkey", subtitle: "Fast & Smart" },
  { title: "Secure", subtitle: "Your data is safe" },
  { title: "Easy", subtitle: "One tap login" },
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
      <View style={styles.container}>
        
        {/* 🔵 HEADER */}
<LinearGradient
  colors={["#757575", "#0a0a0a"]}
  style={styles.top}
>
  {/* TOP BAR */}
  <View style={styles.topBar}>
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.switchBtn} >
      <Text style={styles.switchText}>Get Started</Text>
    </TouchableOpacity>
  </View>

  {/* 🔥 SWIPER */}
  <Animated.View
    style={[
      styles.sliderContainer,
    
    ]}
  >
<Animated.View style={[styles.slide, { opacity }]}>
  <Text style={styles.logo}>{slides[index].title}</Text>
  <Text style={styles.tag}>{slides[index].subtitle}</Text>
</Animated.View>
  </Animated.View>
</LinearGradient>

        {/* ⚪ SHEET */}
        <View
          style={[
            styles.sheet,
            {
              top: isSmall ? height * 0.28 : height * 0.32,
              padding: isSmall ? 18 : 24,
            },
          ]}
        >
          <Text style={styles.smallTop}>
            Don’t have an account?
            <Text style={styles.link} onPress={() => router.push("/register")}>
              Get Started
            </Text>
          </Text>

          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.sub}>Enter your details below</Text>

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

          {/* FORGOT */}
     

          {/* BUTTON */}
          <LinearGradient
            colors={["#757575", "#0a0a0a"]}
            style={styles.btn}
          >
            <TouchableOpacity
              style={styles.btnInner}
              onPress={handleContinue}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
     <TouchableOpacity>
            <Text style={styles.forgot}>Forgot your password?</Text>
          </TouchableOpacity>
          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>Or sign in with</Text>
            <View style={styles.line} />
          </View>

          {/* SOCIAL */}
   <View style={styles.socialRow}>
  {/* GOOGLE */}
  <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle}>
    <Image
    source={require("@/assets/public/google.png")}
      style={styles.socialIcon}
    />
    <Text style={styles.socialDark}>Google</Text>
  </TouchableOpacity>

  {/* FACEBOOK */}
  {/* <TouchableOpacity style={styles.socialBtn}>
    <Image
      source={require("@/assets/public/fb.png")}
      style={styles.socialIcon}
    />
    <Text style={styles.socialDark}>Facebook</Text> 
  </TouchableOpacity> */}
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
socialIcon: {
  width: 20,
  height: 20,
  resizeMode: "contain",
},

socialDark: {
  fontWeight: "600",
  color: "#333",
},
top: {
  height: height * 0.4,
  borderBottomLeftRadius: 40,
  borderBottomRightRadius: 40,
  justifyContent: "center",
  overflow: "hidden", // 🔥 MUST ADD
},

  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  switchBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  switchText: {
    color: "#fff",
    fontSize: 12,
  },

  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  sheet: {
    position: "absolute",
    left: 1,
    right: 1,
    bottom: 0,
    
    backgroundColor: "#fff",
    borderRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },

  smallTop: {
    textAlign: "right",
    fontSize: 12,
    color: "#aaa",
    marginBottom: 10,
  },

  link: {
    color: "#5a6cff",
    fontWeight: "600",
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

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fc",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  forgot: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
    fontSize: 12,
  },

  btn: {
    borderRadius: 12,
    marginTop: 6,
  },

  btnInner: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },

  or: {
    marginVertical: 10,
    marginHorizontal: 10,
    color: "#aaa",
    fontSize: 12,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  socialBtn: {
    width: width * 0.9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
sliderContainer: {
  flexDirection: "row",
  width: width * slides.length, // 🔥 dynamic
},

slide: {
  width: width, // 🔥 must match screen
  justifyContent: "center",
  alignItems: "center",
},

tag: {
  color: "#ddd",
  fontSize: 13,
  marginTop: 6,
},
  socialText: {
    fontWeight: "600",
  },
});