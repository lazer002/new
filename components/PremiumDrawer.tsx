import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
const { width, height } = Dimensions.get("window");

const DRAWER_WIDTH = width * 0.84;

type Props = {
  visible: boolean;
  onClose: () => void;
   categories:any[];
};

export default function PremiumDrawer({
  visible,
  onClose,
  categories
}: Props) {
const { user, logout } = useAuth();
const router = useRouter();

const [activeMenu, setActiveMenu] = React.useState("home");
const [mounted, setMounted] =
  React.useState(false);

const navigate = (
  key: string,
  route?: string
) => {

  setActiveMenu(key);

  onClose();

  if (route) {

    setTimeout(() => {

      router.push(route as any);

    }, 220);

  }

};



const username =
  user?.name || "Guest";

const initials =
  username
    .split(" ")
    .map((x : string) => x[0])
    .join("")
    .slice(0,2)
    .toUpperCase();

  const translateX =
    useSharedValue(-DRAWER_WIDTH);


const [categoryOpen, setCategoryOpen] =
  React.useState(false);
const categoryHeight =
  useSharedValue(0);


  const overlayOpacity =
    useSharedValue(0);

useEffect(() => {

  if (visible) {

    setMounted(true);

    translateX.value = withTiming(
      0,
      { duration: 320 }
    );

    overlayOpacity.value = withTiming(
      1,
      { duration: 300 }
    );

  } else {

  translateX.value =
withSpring(

visible
? 0
: -DRAWER_WIDTH,

{

damping:18,

stiffness:120,

mass:.9,

}

);

    overlayOpacity.value = withTiming(
      0,
      {
        duration: 300,
      }
    );

    const timer =
      setTimeout(() => {

        setMounted(false);

      },320);

    return () =>
      clearTimeout(timer);

  }

}, [visible]);

  const drawerStyle =
    useAnimatedStyle(() => {

      return {

        transform: [
          {
            translateX:
              translateX.value,
          },
        ],

      };

    });

  const overlayStyle =
    useAnimatedStyle(() => {

      return {

        opacity:
          overlayOpacity.value,

      };

    });

const toggleCategory = () => {

  const next = !categoryOpen;

  setCategoryOpen(next);

categoryHeight.value = withTiming(
    next ? categories.length * 42 : 0
);

};
const categoryStyle =
  useAnimatedStyle(() => {

    return {

      height: categoryHeight.value,

      opacity:
        categoryHeight.value === 0
          ? 0
          : 1,

      overflow: "hidden",

    };

  });

if (!mounted)
  return null;

  return (

    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
    >

      {/* Overlay */}

      <Animated.View
        style={[
          styles.overlay,
          overlayStyle,
        ]}
      >

        <Pressable
          style={{
            flex: 1,
            
          }}
          onPress={onClose}
        />

      </Animated.View>

   

      <Animated.View
        style={[
          styles.drawer,
          drawerStyle,
        ]}
      >

<Animated.ScrollView
  showsVerticalScrollIndicator={false}
  bounces={false}
  contentContainerStyle={{
    flexGrow: 1,
    paddingBottom: 30,
  }}
>

      {/* ---------- HEADER ---------- */}

<View style={styles.header}>

  <View style={styles.brandRow}>

    <View>

      <Text style={styles.brand}>
        GARRIB
      </Text>

      <Text style={styles.brandSub}>
        Premium Streetwear
      </Text>

    </View>

    <Pressable
      style={styles.closeButton}
      onPress={onClose}
    >

      <View
        style={{
          transform: [
            {
              rotate: "45deg",
            },
          ],
        }}
      >

        <View style={styles.closeLine1} />

        <View style={styles.closeLine2} />

      </View>

    </Pressable>

  </View>

</View>



<View style={styles.divider} />
{/* ---------------- MENU ---------------- */}

<View style={styles.menuContainer}>

  {/* HOME */}

<Pressable
  onPress={() =>
    navigate("home", "/")
  }
  style={[
    styles.menuItem,
    activeMenu === "home" &&
      styles.menuItemActive,
  ]}
>

  <View
    style={[
      styles.iconBox,
      activeMenu === "home" &&
        styles.iconBoxActive,
    ]}
  >

    <Ionicons
      name="home-outline"
      size={20}
      color={
        activeMenu === "home"
          ? "#111"
          : "#FFF"
      }
    />

  </View>

  <Text
    style={[
      styles.menuText,
      activeMenu === "home" &&
        styles.menuTextActive,
    ]}
  >
    Home
  </Text>

</Pressable>

  {/* NEW DROPS */}

  <Pressable
    onPress={() =>
      navigate("new-drops", "/new-drops")
    }
    style={[
      styles.menuItem,
      activeMenu === "new-drops" &&
        styles.menuItemActive,
    ]}
  >

    <View
      style={[
        styles.iconBox,
        activeMenu === "new-drops" &&
          styles.iconBoxActive,
      ]}
    >

      <Ionicons
        name="flame-outline"
        size={20}
        color={
          activeMenu === "new-drops"
            ? "#111"
            : "#B6FF2E"
        }
      />

    </View>

    <Text
      style={[
        styles.menuText,
        activeMenu === "new-drops" &&
          styles.menuTextActive,
      ]}
    >
      New Drops
    </Text>

  </Pressable>
  

  {/* CATEGORY */}

<Pressable
  style={[
    styles.menuItem,
    activeMenu === "categories" &&
      styles.menuItemActive,
  ]}
  onPress={() => {

    setActiveMenu("categories");

    toggleCategory();

  }}
>

  <View
    style={[
      styles.iconBox,
      activeMenu === "categories" &&
        styles.iconBoxActive,
    ]}
  >

    <Ionicons
      name="grid-outline"
      size={20}
      color={
        activeMenu === "categories"
          ? "#111"
          : "#FFF"
      }
    />

  </View>

  <Text
    style={[
      styles.menuText,
      activeMenu === "categories" &&
        styles.menuTextActive,
    ]}
  >
    Categories
  </Text>

  <View style={{ flex: 1 }} />

  <Ionicons
    name={
      categoryOpen
        ? "chevron-up"
        : "chevron-down"
    }
    size={18}
    color="#888"
  />

</Pressable>

<Animated.View
  style={[
    styles.categoryContainer,
    categoryStyle,
  ]}
>

  {[
    "Oversized",
    "T-Shirts",
    "Hoodies",
    "Shirts",
    "Jeans",
    "Sneakers",
    "Accessories",
  ].map((item) => (

<Pressable
  key={item}
  style={styles.subMenu}
  onPress={() => {

    onClose();

    router.push({
      pathname: "/plpcategory",
      params: {
        category: item,
      },
    });

  }}
>

      <View style={styles.dot} />

      <Text style={styles.subMenuText}>
        {item}
      </Text>

    </Pressable>

  ))}

</Animated.View>

  {/* COLLECTION */}

  <Pressable
    onPress={() =>
      navigate("collections", "/collections")
    }
    style={[
      styles.menuItem,
      activeMenu === "collections" &&
        styles.menuItemActive,
    ]}
  >

    <View
      style={[
        styles.iconBox,
        activeMenu === "collections" &&
          styles.iconBoxActive,
      ]}
    >

      <Ionicons
        name="albums-outline"
        size={20}
        color={
          activeMenu === "collections"
            ? "#111"
            : "#FFF"
        }
      />

    </View>

    <Text
      style={[
        styles.menuText,
        activeMenu === "collections" &&
          styles.menuTextActive,
      ]}
    >
      Collections
    </Text>

  </Pressable>

  {/* BUILD BUNDLE */}

  <Pressable
    onPress={() =>
      navigate("build-bundle", "/build-bundle")
    }
    style={[
      styles.menuItem,
      activeMenu === "build-bundle" &&
        styles.menuItemActive,
    ]}
  >

    <Ionicons
      name="cube-outline"
      size={22}
      color="#FFF"
    />

    <Text style={styles.menuText}>
      Build Bundle
    </Text>

  </Pressable>

  {/* WISHLIST */}

  <Pressable
    onPress={() =>
      navigate("wishlist", "/wishlist")
    }
    style={[
      styles.menuItem,
      activeMenu === "wishlist" &&
        styles.menuItemActive,
    ]}
  >

    <Ionicons
      name="heart-outline"
      size={22}
      color="#FFF"
    />

    <Text style={styles.menuText}>
      Wishlist
    </Text>

  </Pressable>

  {/* ORDERS */}

  <Pressable
    onPress={() =>
      navigate("orders", "/orders")
    }
    style={[
      styles.menuItem,
      activeMenu === "orders" &&
        styles.menuItemActive,
    ]}
  >

    <Ionicons
      name="bag-handle-outline"
      size={22}
      color="#FFF"
    />

    <Text style={styles.menuText}>
      Orders
    </Text>

  </Pressable>
    <Pressable
    onPress={() =>
      navigate("settings", "/settings")
    }
    style={[
      styles.menuItem,
      activeMenu === "settings" &&
        styles.menuItemActive,
    ]}
  >

    <Ionicons
      name="settings-outline"
      size={22}
      color="#FFF"
    />

    <Text style={styles.menuText}>
      Settings
    </Text>

  </Pressable>

  <Pressable
    onPress={() =>
      navigate("help", "/help")
    }
    style={[
      styles.menuItem,
      activeMenu === "help" &&
        styles.menuItemActive,
    ]}
  >

    <Ionicons
      name="help-circle-outline"
      size={22}
      color="#FFF"
    />

    <Text style={styles.menuText}>
      Help & Support
    </Text>

  </Pressable>

{user ? (

<Pressable
  style={styles.logoutBtn}
onPress={() => {

  logout();

  onClose();

}}
>

<Ionicons
  name="log-out-outline"
  size={22}
  color="#FF5A5F"
/>

<Text
  style={styles.logoutText}
>
  Logout
</Text>

</Pressable>

) : (

<Pressable
  style={styles.logoutBtn}
  onPress={() => {

    onClose();

    router.push("/login");

  }}
>

<Ionicons
  name="log-in-outline"
  size={22}
  color="#B6FF2E"
/>

<Text
  style={{
    color:"#B6FF2E",
    marginLeft:16,
    fontWeight:"700",
    fontSize:17
  }}
>

Login

</Text>

</Pressable>

)}

</View>

{/* ---------------- BOTTOM ---------------- */}



</Animated.ScrollView>


<View
  style={[
    styles.drawerBottom,
    {
      paddingBottom: 20,
    },
  ]}
>



  <View style={styles.bottomDivider} />

  {/* PROFILE */}

<Pressable
  onPress={() => {

    onClose();

    router.push(
      user
        ? "/profile"
        : "/login"
    );

  }}
  style={styles.bottomProfile}
>

    <View style={styles.bottomAvatar}>

      <Text style={styles.bottomAvatarText}>
        {initials}
      </Text>

    </View>

    <View
      style={{
        flex: 1,
        marginLeft: 14,
      }}
    >

      <Text style={styles.bottomName}>
       {user
 ? username
 : "Guest"}
      </Text>

      <Text style={styles.bottomPlan}>
       {user
 ? "Premium Member"
 : "Tap to Login"}
      </Text>

    </View>

    <Ionicons
      name="chevron-forward"
      size={20}
      color="#777"
    />

  </Pressable>

  <Text style={styles.version}>
    GARRIB v1.0.0
  </Text>

</View>

      </Animated.View>

    </View>

  );

}

const styles =
  StyleSheet.create({

    overlay: {

      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(0,0,0,.35)",

    },

    drawer: {

      position: "absolute",

      left: 0,

      top: 0,

      bottom: 0,

      width: DRAWER_WIDTH,

      backgroundColor: "#111",

      borderTopRightRadius: 34,

      borderBottomRightRadius: 34,

      paddingTop: 70,

      paddingHorizontal: 24,

      shadowColor: "#000",

      shadowOpacity: .35,

      shadowRadius: 30,

      shadowOffset: {

        width: 10,

        height: 0,

      },

      elevation: 30,

    },
header: {
  marginBottom: 32,
},

brandRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

brand: {
  color: "#FFF",
  fontSize: 30,
  fontWeight: "900",
  letterSpacing: 5,
},

brandSub: {
  marginTop: 6,
  color: "#7D7D7D",
  fontSize: 14,
},

closeButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#1D1D1D",

  justifyContent: "center",
  alignItems: "center",
},

closeLine1: {
  position: "absolute",

  width: 18,
  height: 2.5,

  borderRadius: 2,

  backgroundColor: "#FFF",

  transform: [
    {
      rotate: "90deg",
    },
  ],
},

closeLine2: {
  width: 18,
  height: 2.5,

  borderRadius: 2,

  backgroundColor: "#FFF",
},

profileCard: {
  flexDirection: "row",
  alignItems: "center",

  backgroundColor: "#191919",

  borderRadius: 26,

  padding: 18,

  marginBottom: 28,
},

avatar: {
  width: 64,
  height: 64,

  borderRadius: 32,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",
  alignItems: "center",
},

avatarText: {
  color: "#111",
  fontSize: 24,
  fontWeight: "900",
},

userName: {
  color: "#FFF",
  fontSize: 19,
  fontWeight: "800",
},

userPlan: {
  marginTop: 6,
  color: "#B6FF2E",
  fontSize: 14,
  fontWeight: "600",
},

divider: {
  height: 1,
  backgroundColor: "#262626",
  marginBottom: 28,
},
menuContainer: {

},

menuItem: {

  flexDirection: "row",

  alignItems: "center",

  height: 56,

},

menuText: {

  color: "#FFF",

  fontSize: 17,

  fontWeight: "700",

  marginLeft: 16,

},

categoryContainer: {

  marginLeft: 38,

  overflow: "hidden",

},

subMenu: {

  flexDirection: "row",

  alignItems: "center",

  height: 42,

},

dot: {

  width: 7,

  height: 7,

  borderRadius: 4,

  backgroundColor: "#B6FF2E",

},

subMenuText: {

  marginLeft: 14,

  color: "#B5B5B5",

  fontSize: 15,

},
drawerBottom: {

  marginTop: "auto",

  paddingTop: 20,

},

bottomDivider: {

  height: 1,

  backgroundColor: "#252525",

  marginVertical: 20,

},

logoutBtn: {

  flexDirection: "row",

  alignItems: "center",

  height: 56,

},

logoutText: {

  color: "#FF5A5F",

  fontSize: 17,

  fontWeight: "700",

  marginLeft: 16,

},

bottomProfile: {

  flexDirection: "row",

  alignItems: "center",

  backgroundColor: "#181818",

  borderRadius: 22,

  padding: 16,

  borderWidth: 1,

  borderColor: "#262626",

},

bottomAvatar: {

  width: 58,

  height: 58,

  borderRadius: 29,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",

  alignItems: "center",

},

bottomAvatarText: {

  fontSize: 20,

  fontWeight: "900",

  color: "#111",

},
menuItemActive: {

  backgroundColor: "#1B1B1B",

  borderRadius: 18,

},

iconBox: {

  width: 38,

  height: 38,

  borderRadius: 12,

  backgroundColor: "#222",

  justifyContent: "center",

  alignItems: "center",

},

iconBoxActive: {

  backgroundColor: "#B6FF2E",

},

menuTextActive: {

  color: "#B6FF2E",

},
bottomName: {

  color: "#FFF",

  fontSize: 18,

  fontWeight: "800",

},

bottomPlan: {

  marginTop: 5,

  color: "#8DFF32",

  fontWeight: "600",

},

version: {

  marginTop: 18,

  color: "#666",

  fontSize: 12,

  textAlign: "center",

  letterSpacing: 1,

},
  });