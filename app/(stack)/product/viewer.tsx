import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { normalize } from "@/utils/responsive";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");



type ViewerImageProps = {
  uri: string;
  onClose: () => void;
  setParentScroll: (v: boolean) => void;
};

const ViewerImage = memo(
  ({
    uri,
    onClose,
    setParentScroll,
  }: ViewerImageProps) => {
    const scale =
      useSharedValue(1);

    const savedScale =
      useSharedValue(1);

    const translateX =
      useSharedValue(0);

    const translateY =
      useSharedValue(0);

    const savedX =
      useSharedValue(0);

    const savedY =
      useSharedValue(0);

    const resetImage = () => {
      "worklet";

      scale.value =
        withSpring(1);

      savedScale.value = 1;

      translateX.value =
        withSpring(0);

      translateY.value =
        withSpring(0);

      savedX.value = 0;
      savedY.value = 0;

      runOnJS(setParentScroll)(
        true
      );
    };

const pinch = Gesture.Pinch()
  .onBegin(() => {
    runOnJS(setParentScroll)(false);
  })

  .onUpdate((e) => {
    // Continue from previous zoom instead of restarting
    const nextScale = savedScale.value * e.scale;

    scale.value = Math.max(
      1,
      Math.min(4, nextScale)
    );
  })

  .onEnd(() => {
    // Save current zoom for the next pinch
    savedScale.value = scale.value;

    if (savedScale.value <= 1.01) {
      savedScale.value = 1;

      scale.value = withSpring(1);

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);

      savedX.value = 0;
      savedY.value = 0;

      runOnJS(setParentScroll)(true);
    }
  });

    const pan =
      Gesture.Pan()

        .onUpdate((e) => {
          if (
            savedScale.value <=
            1
          ) {
            translateY.value =
              e.translationY *
              0.45;

            return;
          }

          translateX.value =
            savedX.value +
            e.translationX;

          translateY.value =
            savedY.value +
            e.translationY;
        })

        .onEnd(() => {
          if (
            savedScale.value <=
            1 &&
            translateY.value >
            160
          ) {
            runOnJS(
              onClose
            )();

            return;
          }

          if (
            savedScale.value <=
            1
          ) {
            translateY.value =
              withSpring(0);

            return;
          }

          savedX.value =
            translateX.value;

          savedY.value =
            translateY.value;
        });



   const gesture = Gesture.Simultaneous(
  pinch,
  pan
);

    const imageStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            translateX:
              translateX.value,
          },
          {
            translateY:
              translateY.value,
          },
          {
            scale:
              scale.value,
          },
        ],
      }));

    return (
      <View
        style={styles.page}
      >
        <GestureDetector
          gesture={gesture}
        >
          <Animated.Image
            source={{
              uri,
            }}
            resizeMode="contain"
            style={[
              styles.image,
              imageStyle,
            ]}
          />
        </GestureDetector>
      </View>
    );
  }
);

ViewerImage.displayName =
  "ViewerImage";
export default function Viewer() {
  const router = useRouter();

  const {
    images,
    index,
  } = useLocalSearchParams<{
    images: string;
    index: string;
  }>();

  const flatRef =
    useRef<FlatList<string>>(null);

  const thumbRef =
    useRef<FlatList<string>>(null);

  const parsedImages =
    useMemo(() => {
      try {
        return JSON.parse(
          images || "[]"
        );
      } catch {
        return [];
      }
    }, [images]);

  const initialIndex =
    Number(index || 0);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(initialIndex);

  const [
    scrollEnabled,
    setScrollEnabled,
  ] = useState(true);

  const opacity =
    useSharedValue(0);

  useEffect(() => {
    opacity.value =
      withTiming(1, {
        duration: 220,
      });

    requestAnimationFrame(() => {
      flatRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });

      thumbRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0.5,
      });
    });
  }, []);

  const closeViewer =
    useCallback(() => {
      opacity.value =
        withTiming(
          0,
          {
            duration: 180,
          },
          () => {
            runOnJS(
              router.back
            )();
          }
        );
    }, []);

  const containerStyle =
    useAnimatedStyle(() => ({
      opacity:
        opacity.value,
    }));

  const onViewableItemsChanged =
    useRef(
      ({
        viewableItems,
      }: any) => {
        if (
          !viewableItems.length
        )
          return;

        const i =
          viewableItems[0]
            .index ?? 0;

        setCurrentIndex(i);

        thumbRef.current?.scrollToIndex(
          {
            index: i,
            animated: true,
            viewPosition: 0.5,
          }
        );
      }
    ).current;

  const viewabilityConfig =
    useRef({
      itemVisiblePercentThreshold: 60,
    }).current;

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item: string;
      }) => (
        <ViewerImage
          uri={item}
          onClose={
            closeViewer
          }
          setParentScroll={
            setScrollEnabled
          }
        />
      ),
      [closeViewer]
    );

  const renderThumb =
    useCallback(
      ({
        item,
        index,
      }: {
        item: string;
        index: number;
      }) => {
        const active =
          index ===
          currentIndex;

        return (
          <Pressable
            onPress={() => {
              flatRef.current?.scrollToIndex(
                {
                  index,
                  animated: true,
                }
              );
            }}
            style={[
              styles.thumbBox,
              active &&
              styles.thumbActive,
            ]}
          >
            <Image
              source={{
                uri: item,
              }}
              style={
                styles.thumb
              }
            />
          </Pressable>
        );
      },
      [currentIndex]
    );


    const goNext = () => {
  if (currentIndex >= parsedImages.length - 1) return;

  flatRef.current?.scrollToIndex({
    index: currentIndex + 1,
    animated: true,
  });
};

const goPrev = () => {
  if (currentIndex <= 0) return;

  flatRef.current?.scrollToIndex({
    index: currentIndex - 1,
    animated: true,
  });
};

  return (
    <>
      <StatusBar
        hidden
      />

      <Animated.View
        style={[
          styles.container,
          containerStyle,
        ]}
      >
        <Pressable
          style={
            styles.close
          }
          onPress={
            closeViewer
          }
        >
          <Ionicons
            name="close"
            size={30}
            color="#fff"
          />
        </Pressable>

        <View
          style={
            styles.counter
          }
        >
          <Text
            style={
              styles.counterText
            }
          >
            {currentIndex + 1} /
            {
              parsedImages.length
            }
          </Text>
        </View>
{currentIndex > 0 && (
  <Pressable
    style={[styles.navArrow, styles.leftArrow]}
    onPress={goPrev}
  >
    <Ionicons
      name="chevron-back"
      size={34}
      color="#fff"
    />
  </Pressable>
)}
{currentIndex < parsedImages.length - 1 && (
  <Pressable
    style={[styles.navArrow, styles.rightArrow]}
    onPress={goNext}
  >
    <Ionicons
      name="chevron-forward"
      size={34}
      color="#fff"
    />
  </Pressable>
)}
        <FlatList
          ref={flatRef}
          data={
            parsedImages
          }
          keyExtractor={(
            _,
            i
          ) =>
            i.toString()
          }
          renderItem={
            renderItem
          }
          horizontal
          pagingEnabled
          bounces={false}
          scrollEnabled={
            scrollEnabled
          }
          showsHorizontalScrollIndicator={
            false
          }
          onViewableItemsChanged={
            onViewableItemsChanged
          }
          viewabilityConfig={
            viewabilityConfig
          }
          initialNumToRender={
            2
          }
          maxToRenderPerBatch={
            2
          }
          windowSize={3}
          removeClippedSubviews
          getItemLayout={(
            _,
            i
          ) => ({
            length: width,
            offset:
              width * i,
            index: i,
          })}
        />
        <View style={styles.thumbnailContainer}>
          <FlatList
            ref={thumbRef}
            data={parsedImages}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderThumb}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbContent}
            getItemLayout={(_, index) => ({
              length: 72,
              offset: 72 * index,
              index,
            })}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  page: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width,
    height,
  },

  close: {
    position: "absolute",
    top: 55,
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  counter: {
    position: "absolute",
    top: 58,
    left: 18,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  counterText: {
    color: "#fff",
    fontSize: normalize(15),
    fontWeight: "600",
  },

  thumbnailContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },

  thumbContent: {
    paddingHorizontal: 12,
    alignItems: "center",
  },

  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#111",
  },

  thumbActive: {
    borderColor: "#B6FF2E",
  },

  thumb: {
    width: "100%",
    height: "100%",
  },

  navArrow: {
  position: "absolute",
  top: "50%",
  marginTop: -28,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

leftArrow: {
  left: 18,
},

rightArrow: {
  right: 18,
},
});