import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const router = useRouter();
  const { items } = useCart();

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

 return (
  <Pressable
    style={styles.wrapper}
    onPress={() => router.push("/cart")}
  >

    <View style={styles.container}>

      <Ionicons
        name="bag-handle-outline"
        size={22}
        color="#FFF"
      />

      {itemCount > 0 && (

        <View style={styles.badge}>

          <Text style={styles.badgeText}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>

        </View>

      )}

    </View>

  </Pressable>
);
}

const styles = StyleSheet.create({

wrapper:{

  justifyContent:"center",

  alignItems:"center",

},

container:{

  width:48,

  height:48,

  borderRadius:16,

  backgroundColor:"#111",

  justifyContent:"center",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#242424",

},

badge:{

  position:"absolute",

  top:-4,

  right:-4,

  minWidth:20,

  height:20,

  paddingHorizontal:4,

  borderRadius:10,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",

  borderWidth:2,

  borderColor:"#111",

},

badgeText:{

  color:"#111",

  fontSize:10,

  fontWeight:"900",

},

});