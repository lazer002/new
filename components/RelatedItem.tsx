import React from "react";
import { Image, Pressable, Text } from "react-native";

const RelatedItem = React.memo(({ item, router, styles }: any) => {
  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/product/[id]",
          params: {
            id: item._id,
            image: item.images?.[0],
          },
        });
      }}
      style={styles.relatedCard}
    >
      <Image
        source={{ uri: item.images?.[0] }}
        style={styles.relatedImage}
      />

      <Text numberOfLines={1} style={styles.relatedTitle}>
        {item.title}
      </Text>

      <Text style={styles.relatedPrice}>₹{item.price}</Text>
    </Pressable>
  );
});

export default RelatedItem;