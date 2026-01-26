// screens/BundlePLPScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Dimensions, Modal, Pressable, ScrollView
} from "react-native";
import Animated, { Layout, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import AppHeader from "../components/AppHeader";
import api from "../utils/config";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SideFilterPanel from "../components/SideFilterPanel";

const { width } = Dimensions.get("window");
const SIZE_OPTIONS = ["S", "M", "L", "XL"];
import { SafeAreaView,useSafeAreaInsets  } from 'react-native-safe-area-context';
import { useFilter } from "../context/FilterContext";

export default function BundlePLPScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { filters } = useFilter();
  const [bundles, setBundles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addBundleToCart } = useCart();
const [filterVisible, setFilterVisible] = useState(false);

  /* 🧾 load bundles */
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await api.get("/api/bundles");
        setBundles(res.data.items);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBundles();
  }, []);

  /* ❤️ wishlist */
  const toggleWishlist = (id) =>
    isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id);

  /* 🛒 Quick Add */
  const openModal = (bundle) => {
    setSelectedBundle(bundle);
    setSelectedSizes({});
    setModalVisible(true);
  };

  const handleAddToCart = async () => {
    const missing = selectedBundle.products.some(p => !selectedSizes[p._id]);
    if (missing) return alert("Select size for all items");

    await addBundleToCart(selectedBundle, selectedSizes);
    setModalVisible(false);
  };

  /* 🎞 animation card */
  const CardContainer = ({ children }) => {
    const scale = useSharedValue(1);
    const anim = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
    }));

    return (
      <Animated.View
        style={[styles.cardWrapper, anim]}
        onTouchStart={() => scale.value = withTiming(0.97, { duration: 120 })}
        onTouchEnd={() => scale.value = withTiming(1, { duration: 120 })}
      >
        {children}
      </Animated.View>
    );
  };

 const filteredBundles = bundles.filter(bundle => {
   if (filters.price && bundle.price > filters.price) return false;

  // check inside bundle items for size - ANY is enough
  if (filters.sizes.length > 0) {
    const sizesInBundle = bundle.items?.flatMap(i => i.sizes ?? []);
    if (!sizesInBundle?.some(s => filters.sizes.includes(s))) return false;
  }

  if (filters.colors.length > 0) {
    const colors = bundle.items?.flatMap(i => i.color ?? []);
    if (!colors?.some(c => filters.colors.includes(c))) return false;
  }

  if (filters.category && bundle.category !== filters.category) return false;
  return true;
});


  /* 🧱 each bundle card */
  const BundleCard = ({ item }) => {
    const img = item.mainImages[0];
    const productCount = item.products.length;

    return (
      <CardContainer>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, viewMode === "list" && styles.cardList]}
          onPress={() => navigation.navigate('BundleScreen', { id: item._id })}
        >
          <Image
            source={{ uri: img }}
            style={viewMode === "grid" ? styles.imageGrid : styles.imageList}
          />

          {/* ❤️ */}
          <TouchableOpacity style={styles.wishlistIcon} onPress={() => toggleWishlist(item._id)}>
            {isInWishlist(item._id)
              ? <Ionicons name="heart-sharp" size={22} color="#000" />
              : <Ionicons name="heart-outline" size={22} color="#000" />}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

            {/* 🔥 item preview thumbnails */}
            <View style={styles.thumbRow}>
              {item.products.slice(0, 4).map(p => (
                <Image key={p._id} source={{ uri: p.images[0] }} style={styles.thumbImg} />
              ))}
              {productCount > 4 && (
                <View style={styles.thumbMore}>
                  <Text style={styles.thumbMoreTxt}>+{productCount - 4}</Text>
                </View>
              )}
            </View>

            <Text style={styles.countText}>{productCount} items</Text>
            <Text style={styles.price}>₹{item.price}</Text>

            <TouchableOpacity style={styles.quickBtn} onPress={() => openModal(item)}>
              <Text style={styles.quickTxt}>QUICK ADD</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </CardContainer>
    );
  };
  return (
    <View style={{ flex:1, paddingTop: insets.top,backgroundColor:"#fff" }}>
      <AppHeader title="Bundles" />

      {/* 🛠 icon-only toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
  <Ionicons name="filter-outline" size={22} color="#000" />
</TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
          {viewMode === "grid"
            ? <MaterialIcons name="view-agenda" size={26} color="#000" />
            : <MaterialIcons name="grid-view" size={26} color="#000" />}
        </TouchableOpacity>
      </View>

      {/* 📑 listing */}
      <Animated.View layout={Layout} style={{ flex: 1 }}>
        <FlatList
          data={filteredBundles}
          renderItem={({ item }) => <BundleCard item={item} />}
          key={viewMode}
          numColumns={viewMode === "grid" ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      </Animated.View>

      {/* 🧵 Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedBundle?.title}</Text>

            <ScrollView style={{ maxHeight: 350 }}>
              {selectedBundle?.products.map((p) => (
                <View key={p._id} style={styles.modalItem}>
                  <Image source={{ uri: p.images[0] }} style={styles.modalImg} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemTitle}>{p.title}</Text>

                    <View style={styles.sizeRow}>
                      {SIZE_OPTIONS.map(size => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeBtn,
                            selectedSizes[p._id] === size && styles.sizeBtnActive
                          ]}
                          onPress={() =>
                            setSelectedSizes(prev => ({ ...prev, [p._id]: size }))
                          }
                        >
                          <Text style={[
                            styles.sizeTxt,
                            selectedSizes[p._id] === size && { color: "#fff" }
                          ]}>
                            {size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
              <Text style={styles.addCartTxt}>Add Bundle to Cart</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

  <SideFilterPanel
  visible={filterVisible}
  onClose={() => setFilterVisible(false)}
/>

    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#fff"},

  toolbar:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:16,
    paddingVertical:12,
    borderBottomWidth:1,
    borderColor:"#ddd"
  },

  /* card layout */
  cardWrapper:{},
card: {
      backgroundColor: '#fff',
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 12,
  marginHorizontal: 6,
  width: (width / 2) - 18,  
      borderWidth: 0.5,
    borderColor: '#E5E7EB', // ⭐ FIXED WIDTH GRID
},

  cardList: {
  width: width - 18,
  flexDirection: "row",
},

imageGrid: {
  width: "100%",
  height: (width / 2) * 1.4,  // ⭐ LOOKS LIKE CLOTHES CATEGORY RATIO
  resizeMode: "cover",
},
imageList: {
  width: (width / 2) - 18,
  height: width * 0.9,
  resizeMode: "cover",
},


  wishlistIcon:{position:"absolute",top:10,right:10},

  infoBox:{padding:12},
  title:{fontSize:18,fontWeight:"800"},
  price:{fontSize:22,fontWeight:"900",marginVertical:6},
  countText:{fontSize:13,opacity:0.6},

  /* 🔥 bundle preview thumbnails */
  thumbRow:{flexDirection:"row",marginVertical:6},
  thumbImg:{
    width:28,height:28,borderRadius:6,
    borderWidth:1,borderColor:"#000",
    marginRight:-6,backgroundColor:"#fff"
  },
  thumbMore:{
    width:28,height:28,borderRadius:6,
    backgroundColor:"#000",alignItems:"center",justifyContent:"center"
  },
  thumbMoreTxt:{color:"#fff",fontSize:12,fontWeight:"800"},

  quickBtn:{borderWidth:1,borderColor:"#000",paddingVertical:6,borderRadius:8,alignItems:"center"},
  quickTxt:{fontWeight:"700",fontSize:14},

  /* modal */
  overlay:{flex:1,backgroundColor:"rgba(0,0,0,0.4)",justifyContent:"center",padding:20},
  modalBox:{backgroundColor:"#fff",borderRadius:16,padding:16},
  modalTitle:{fontSize:20,fontWeight:"900",marginBottom:6},

  modalItem:{
    flexDirection:"row",gap:10,paddingVertical:12,borderBottomWidth:1,borderColor:"#eee"
  },
  modalImg:{width:60,height:60,borderRadius:8,borderWidth:1,borderColor:"#000"},
  modalItemTitle:{fontWeight:"700",fontSize:16},

  sizeRow:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:6},
  sizeBtn:{borderWidth:1,borderColor:"#000",paddingVertical:4,paddingHorizontal:16,borderRadius:8},
  sizeBtnActive:{backgroundColor:"#000"},
  sizeTxt:{fontWeight:"800",color:"#000"},

  addCartBtn:{backgroundColor:"#000",paddingVertical:14,borderRadius:10,marginTop:16},
  addCartTxt:{color:"#fff",fontWeight:"900",fontSize:16,textAlign:"center"}
});
