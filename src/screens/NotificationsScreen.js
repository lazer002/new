// NotificationsScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import {SafeAreaView} from 'react-native-safe-area-context';
const { width } = Dimensions.get("window");

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = React.useState([
    {
      id: "1",
      type: "order",
      title: "Order Shipped!",
      body: "Your order #349823 has been shipped.",
      time: "2h ago",
      read: false,
    },
    {
      id: "2",
      type: "offer",
      title: "Limited Time Offer",
      body: "Get FLAT 20% OFF on Oversized Tees!",
      time: "5h ago",
      read: false,
    },
    {
      id: "3",
      type: "wishlist",
      title: "Wishlist Item Back in Stock",
      body: "The tee you loved is now available in all sizes.",
      time: "Yesterday",
      read: true,
    },
    {
      id: "4",
      type: "delivery",
      title: "Out for Delivery",
      body: "Your package is arriving today.",
      time: "2 days ago",
      read: true,
    },
  ]);

  // icon per type
  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <MaterialIcons name="local-shipping" size={26} color="#111" />;
      case "offer":
        return <Ionicons name="pricetag-outline" size={26} color="#111" />;
      case "wishlist":
        return <Ionicons name="heart-outline" size={26} color="#111" />;
      case "delivery":
        return <MaterialIcons name="delivery-dining" size={26} color="#111" />;
      default:
        return <Ionicons name="notifications-outline" size={26} color="#111" />;
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView >
    <View style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={{ width: 30 }} /> 
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{ height: 12 }} />
        )}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOut}
            layout={Layout.springify()}
            style={[
              styles.card,
              !item.read && styles.unreadCard,
            ]}
          >
            {/* Swipe Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeNotification(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Content */}
            <View style={{ flexDirection: "row" }}>
              <View style={styles.iconBox}>{getIcon(item.type)}</View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    position: "relative",
  },

  unreadCard: {
    borderColor: "#111",
  },

  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 30,
    zIndex: 5,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  body: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },
});
