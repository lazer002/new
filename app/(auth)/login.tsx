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
      <View style={styles.container}>
        

<View style={styles.hero}>

  {/* Top Navigation */}

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

  {/* Brand */}

  <Animated.View
    style={[
      styles.heroCenter,
      {
        opacity,
      },
    ]}
  >

    <Text style={styles.brand}>
      GARRIB
    </Text>

    <View style={styles.brandAccent} />

    <Text style={styles.heroTitle}>
      {slides[index].title.toUpperCase()}
    </Text>

    <Text style={styles.heroSubtitle}>
      {slides[index].subtitle}
    </Text>

  </Animated.View>

  {/* Decorative Block */}

  <View style={styles.heroCard}>

    <View style={styles.heroGlow} />

<MaterialCommunityIcons
  name="tshirt-crew-outline"
  size={72}
  color="#111"
/>

  </View>

</View>
<View style={styles.sheet}>
        {/* ⚪ SHEET */}
   <Text style={styles.sheetTitle}>
  Welcome Back
</Text>

<Text style={styles.sheetSubtitle}>
  Sign in to continue your premium shopping experience.
</Text>

{/* EMAIL */}

<Text style={styles.fieldLabel}>
  EMAIL
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
    placeholder="Enter your password"
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

<TouchableOpacity>

  <Text style={styles.forgot}>
    Forgot Password?
  </Text>

</TouchableOpacity>

{/* LOGIN */}

<TouchableOpacity
  style={styles.loginButton}
  onPress={handleContinue}
>

  {loading ? (

    <ActivityIndicator
      color="#111"
    />

  ) : (

    <Text style={styles.loginText}>
      SIGN IN
    </Text>

  )}

</TouchableOpacity>

{/* DIVIDER */}

<View style={styles.dividerRow}>

  <View style={styles.line} />

  <Text style={styles.or}>
    CONTINUE WITH
  </Text>

  <View style={styles.line} />

</View>

{/* GOOGLE */}

<TouchableOpacity
  style={styles.googleButton}
  onPress={handleGoogle}
>

  <Image
    source={require("@/assets/public/google.png")}
    style={styles.socialIcon}
  />

  <Text style={styles.googleText}>
    Continue with Google
  </Text>

</TouchableOpacity>

<View
  style={{
    marginTop:28,
    alignItems:"center",
  }}
>

  <Text
    style={{
      color:"#777",
      fontSize:13,
    }}
  >

    New to GARRIB?

  </Text>

  <TouchableOpacity
    onPress={() =>
      router.push("/register")
    }
  >

    <Text
      style={{
        marginTop:10,
        color:"#111",
        fontWeight:"900",
        letterSpacing:1,
      }}
    >

      CREATE ACCOUNT

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
    backgroundColor: "#FFFFFF",
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

  socialText: {
    fontWeight: "600",
  },
  hero: {

  height: height * 0.42,

  backgroundColor: "#FFF",

  paddingTop: Platform.OS === "ios"
    ? 62
    : 46,

  paddingHorizontal: 24,

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

createAccount: {

  fontSize: 12,

  fontWeight: "800",

  letterSpacing: 1.2,

  color: "#111",

},

heroCenter: {

  marginTop: 46,

},

brand: {

  fontSize: 42,

  fontWeight: "900",

  letterSpacing: 2,

  color: "#111",

},

brandAccent: {

  width: 82,

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

  right: 24,

  bottom: 10,

  width: 130,

  height: 130,

  borderRadius: 32,

  backgroundColor: "#F6F6F6",

  justifyContent: "center",

  alignItems: "center",

  borderWidth: 1,

  borderColor: "#ECECEC",

},

heroGlow: {

  position: "absolute",

  width: 60,

  height: 60,

  borderRadius: 30,

  backgroundColor: "#B6FF2E",

  opacity: .18,

},

sliderContainer: {

  flex: 1,

},

slide: {

  width: "100%",

},
sheet:{

  position:"absolute",

  left:0,

  right:0,

  bottom:0,

  backgroundColor:"#FFF",

  borderTopLeftRadius:40,

  borderTopRightRadius:40,

  paddingHorizontal:28,

  paddingTop:34,

  paddingBottom:36,

},

sheetTitle:{

  fontSize:34,

  fontWeight:"900",

  color:"#111",

  letterSpacing:.4,

},

sheetSubtitle:{

  marginTop:10,

  marginBottom:34,

  fontSize:15,

  lineHeight:24,

  color:"#777",

},

fieldLabel:{

  fontSize:11,

  fontWeight:"800",

  letterSpacing:1.2,

  color:"#999",

  marginBottom:10,

},

inputBox:{

  height:58,

  borderRadius:18,

  backgroundColor:"#F7F7F7",

  borderWidth:1,

  borderColor:"#ECECEC",

  flexDirection:"row",

  alignItems:"center",

  paddingHorizontal:18,

  marginBottom:22,

},

input:{

  flex:1,

  color:"#111",

  fontSize:16,

  fontWeight:"600",

},

forgot:{

  alignSelf:"flex-end",

  color:"#777",

  fontSize:13,

  marginBottom:28,

},

loginButton:{

  height:60,

  borderRadius:18,

  backgroundColor:"#111",

  justifyContent:"center",

  alignItems:"center",

},

loginText:{

  color:"#FFF",

  fontSize:16,

  fontWeight:"900",

  letterSpacing:1,

},

dividerRow:{

  flexDirection:"row",

  alignItems:"center",

  marginVertical:28,

},

line:{

  flex:1,

  height:1,

  backgroundColor:"#ECECEC",

},

or:{

  marginHorizontal:14,

  fontSize:11,

  color:"#999",

  fontWeight:"700",

  letterSpacing:1.5,

},

googleButton:{

  height:58,

  borderRadius:18,

  borderWidth:1,

  borderColor:"#ECECEC",

  flexDirection:"row",

  justifyContent:"center",

  alignItems:"center",

},

googleText:{

  marginLeft:12,

  color:"#111",

  fontSize:15,

  fontWeight:"700",

},
});