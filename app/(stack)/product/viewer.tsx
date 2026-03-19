import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  StyleSheet,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ViewerScreen() {
  const router = useRouter();
  const { images, index } = useLocalSearchParams<any>();
  const listRef = useRef<FlatList>(null);

  const parsedImages: string[] = JSON.parse(images || "[]");
  const startIndex = Number(index) || 0;

  return (
    <View style={styles.root}>
      {/* Close */}
      <Pressable style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={32} color="#fff" />
      </Pressable>

      {/* Fullscreen Swiper */}
      <FlatList
        ref={listRef}
        data={parsedImages}
        horizontal
        pagingEnabled
        initialScrollIndex={startIndex}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  close: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});