import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated, Text, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons'; // Import icon
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
const bannerHeight = height * 0.75;

const images = [
  require('../assets/banner1.jpg'),
  require('../assets/banner2.jpg'),
  require('../assets/banner3.jpg'),
];

export default function HeroBanner({}) {
   const navigation = useNavigation();
  const [autoplayDirection, setAutoplayDirection] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;

  const searchPlaceholders = ['Search "pants"', 'Search "hoodie"', 'Search "shirts"', 'Search "shoes"'];
  const [currentIndex, setCurrentIndex] = useState(0);

  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Animate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const nextIndex = (currentIndex + 1) % searchPlaceholders.length;
        setCurrentIndex(nextIndex);
        translateYAnim.setValue(10); // Start below
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Marquee messages
  const messages = [
    { text: 'ORDERS SHIP WITHIN ', highlight: '24 HOURS', highlightColor: '#E58C6F' },
    { text: 'FREE 7DAY RETURNS', highlight: '', highlightColor: '' },
    { text: 'MADE IN INDIA', highlight: ' FOR THE WORLD', highlightColor: '#FFFFFF' },
    { text: 'FLAT 10% OFF ON FIRST PURCHASE USE CODE: ', highlight: 'APP10', highlightColor: '#E58C6F' },
  ];

  const repeatedMessages = [];
  for (let i = 0; i < 10; i++) {
    messages.forEach((msg, idx) => {
      repeatedMessages.push(
        <Text key={`${i}-${idx}`} style={styles.marqueeMessage}>
          <Text style={{ color: '#FFFFFF' }}>{msg.text}</Text>
          {msg.highlight ? <Text style={{ color: msg.highlightColor }}>{msg.highlight}</Text> : null}
          {'  •  '}
        </Text>
      );
    });
  }

  useEffect(() => {
    const totalWidth = repeatedMessages.length * 200;
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: 200000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={[styles.container, { height: bannerHeight }]}>
      <Swiper
        autoplay
        autoplayTimeout={2.5}
        loop={false}
        showsPagination
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        autoplayDirection={autoplayDirection}
        onIndexChanged={(index) => {
          if (index === images.length - 1) setAutoplayDirection(false);
          if (index === 0) setAutoplayDirection(true);
        }}
      >
        {images.map((img, index) => (
          <Image key={index} source={img} style={[styles.image, { height: bannerHeight }]} resizeMode="cover" />
        ))}
      </Swiper>

      {/* Floating search box */}
      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SearchScreen')}
      >
        <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 10 }} />
        <Animated.Text
          style={[
            styles.searchPlaceholder,
            { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] },
          ]}
        >
          {searchPlaceholders[currentIndex]}
        </Animated.Text>
      </TouchableOpacity>

      {/* Marquee */}
      <View style={styles.marqueeContainer}>
        <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: scrollX }] }}>
          {repeatedMessages}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, overflow: 'hidden', backgroundColor: '#000' },
  image: { width },
  dot: { backgroundColor: 'rgba(255,255,255,0.5)', width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  activeDot: { backgroundColor: '#FF6347', width: 10, height: 10, borderRadius: 5, marginHorizontal: 3 },
  marqueeContainer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 6, overflow: 'hidden' },
  marqueeMessage: { fontSize: 12, textTransform: 'uppercase', marginRight: 16 },
  searchBox: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: '#111', paddingVertical: 18, paddingHorizontal: 16, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  searchPlaceholder: { color: '#888', fontSize: 14 },
});
