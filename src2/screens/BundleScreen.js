// BundleScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '../utils/config';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import AppHeader from '../components/AppHeader';

const { width, height } = Dimensions.get('window');
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
// AccordionItem: same approach/timing as your PDP (450ms)
function AccordionItem({ title, children, duration = 450 }) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: progress.value * 700,
    opacity: progress.value,
    overflow: 'hidden',
    transform: [{ translateY: (1 - progress.value) * -6 }],
  }));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, { duration });
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity onPress={toggle} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Ionicons name={open ? 'remove' : 'add'} size={20} />
      </TouchableOpacity>
      <Animated.View style={[styles.accordionAnimatedContainer, animatedStyle]}>
        <View style={styles.accordionContent}>{children}</View>
      </Animated.View>
    </View>
  );
}

export default function BundleScreen({ route, navigation }) {
  const { id } = route.params;
  const { addBundleToCart, cartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();


  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [activeImage, setActiveImage] = useState(0);
  const flatListRef = useRef(null);
 const [relatedBundles, setRelatedBundles] = useState([]);

const handleSizeChange = (productId, size) => {
  setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  setDropdownOpen((prev) => ({ ...prev, [productId]: false })); // auto-close
};


  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        let res;
        try {
          res = await api.get(`/api/bundles/${id}`);
        } catch (err) {
          const listRes = await api.get('/api/bundles');
          const items = Array.isArray(listRes.data.items) ? listRes.data.items : listRes.data || [];
          const found = items.find((b) => b._id === id) || null;
          res = { data: found };
        }
        setBundle(res?.data || null);
      } catch (err) {
        console.error('Error fetching bundle:', err);
        setBundle(null);
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [id]);

useEffect(() => {
    if (!bundle) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/bundles');
        const items = Array.isArray(res.data.items) ? res.data.items : res.data || [];
        const filtered = items.filter((b) => b._id !== bundle._id);
        if (mounted) setRelatedBundles(filtered);
      } catch (err) {
        console.error('Error fetching related bundles:', err);
        if (mounted) setRelatedBundles([]);
      }
    })();
    return () => (mounted = false);
  }, [bundle]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }
  if (!bundle) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#555' }}>Bundle not found.</Text>
      </View>
    );
  }

  const mainImages = bundle.mainImages?.length
    ? bundle.mainImages
    : bundle.products?.map((p) => p.images?.[0]).filter(Boolean) || ['https://via.placeholder.com/800x800'];

  const onMomentumScrollEnd = (e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveImage(page);
  };
  const scrollToIndex = (i) => {
    setActiveImage(i);
    flatListRef.current?.scrollToOffset({ offset: i * width, animated: true });
  };

  const toggleDropdown = (prodId) => {
    setDropdownOpen((prev) => {
      const next = { ...prev, [prodId]: !prev[prodId] };
      // close others
      Object.keys(next).forEach((k) => {
        if (k !== prodId) next[k] = false;
      });
      return next;
    });
  };
  const closeAllDropdowns = () => setDropdownOpen({});

 
  const openProduct = (productId) => navigation.push('ProductScreen', { id: productId });
  const anyDropdownOpen = Object.values(dropdownOpen).some(Boolean);
console.log('cartCount:', cartCount);
  return (
    <SafeAreaView style={styles.safe}>
     {/* <AppHeader title="Home" /> */}
      <ScrollView contentContainerStyle={styles.content}>
        {anyDropdownOpen && (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeAllDropdowns} />
        )}

        {/* Carousel */}
        <View>
          <FlatList
            ref={flatListRef}
            data={mainImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={onMomentumScrollEnd}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} resizeMode="cover" />
            )}
          />
          <FlatList
            data={mainImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => scrollToIndex(index)}>
                <Image source={{ uri: item }} style={[styles.thumbnail, activeImage === index && styles.activeThumbnail]} />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Header */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.title}>{bundle.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
            <Text style={styles.price}>₹{bundle.price}</Text>
            {bundle.published === false && <View style={styles.unpublishedBadge}><Text>Draft</Text></View>}
          </View>
          {!!bundle.description && <Text style={styles.descriptionText} numberOfLines={3}>{bundle.description}</Text>}
          <Text style={styles.mutedText}>{bundle.products?.length ?? 0} item{(bundle.products?.length ?? 0) !== 1 ? 's' : ''} in this bundle</Text>
        </View>

        {/* Included items */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Included products</Text>
          {bundle.products?.map((prod) => {
            const dropdownIsOpen = !!dropdownOpen[prod._id];
            return (
              <View key={prod._id} style={styles.bundleProductBlock}>
                <TouchableOpacity onPress={() => openProduct(prod._id)}>
                  <Image source={{ uri: prod.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.bundleProductThumb} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <TouchableOpacity onPress={() => openProduct(prod._id)}>
                    <Text numberOfLines={1} style={styles.productTitle}>{prod.title}</Text>
                  </TouchableOpacity>
                  <Text style={styles.productPrice}>₹{prod.price}</Text>

                  {/* size dropdown (absolute) */}
            <View style={{ marginTop: 110, position: 'relative' }}>
  {/* Toggle Button */}
  <TouchableOpacity
    style={styles.sizeDropdownToggle}
    onPress={() => toggleDropdown(prod._id)}
  >
    <Text style={styles.sizeDropdownLabel}>
      {selectedSizes[prod._id] ? `Size: ${selectedSizes[prod._id]}` : 'Select Size'}
    </Text>
    <Ionicons
      name={dropdownIsOpen ? 'chevron-up' : 'chevron-down'}
      size={18}
      color="#111"
    />
  </TouchableOpacity>

  {/* Absolute Dropdown List */}
  {dropdownIsOpen && (
    <View style={styles.dropdownListAbsolute}>
      {SIZE_OPTIONS.map((s) => {
        const hasInventory =
          prod.inventory && typeof prod.inventory === 'object';

        // skip if no stock
        if (hasInventory && (!prod.inventory[s] || prod.inventory[s] <= 0)) {
          return null;
        }

        const chosen = selectedSizes[prod._id] === s;

        return (
          <TouchableOpacity
            key={s}
            onPress={() => handleSizeChange(prod._id, s)}  //  ✅ HERE
            style={[
              styles.dropdownOption,
              chosen && styles.dropdownOptionActive,
            ]}
          >
            <Text
              style={
                chosen
                  ? styles.dropdownOptionTextActive
                  : styles.dropdownOptionText
              }
            >
              {s}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )}
</View>

                </View>

              </View>
            );
          })}
        </View>

        {/* Action buttons (PDP style): 50/50 then full width buy now */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => {
              
              addBundleToCart(bundle, selectedSizes);
            }} disabled={adding}>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>{adding ? 'Adding...' : 'Add Bundle'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.wishlistButton} onPress={() =>
              isInWishlist(bundle._id)
                ? removeFromWishlist(bundle._id)
                : addToWishlist(bundle._id)}>
              <Ionicons
                           name={isInWishlist(bundle._id) ? 'heart' : 'heart-outline'}
                           size={20}
                           color={isInWishlist(bundle._id) ? 'black' : '#000'}
                         />
              <Text style={styles.wishlistButtonText}>Wishlist</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buyNowFull} onPress={() => Alert.alert('Buy now', 'Proceed to checkout (implement)')}>
            <Ionicons name="card-outline" size={20} color="#111" />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Feature row (PDP: below actions) */}
        <View style={styles.featureRow}>
          <View style={styles.featureBox}>
            <MaterialIcons name="local-shipping" size={26} color="black" />
            <Text style={styles.featureText}>Priority Delivery</Text>
          </View>
          <View style={styles.featureBox}>
            <MaterialIcons name="swap-horiz" size={26} color="black" />
            <Text style={styles.featureText}>Easy Exchange</Text>
          </View>
          <View style={styles.featureBox}>
            <MaterialIcons name="payment" size={26} color="black" />
            <Text style={styles.featureText}>Cash on Delivery</Text>
          </View>
        </View>

        {/* Accordions (same as PDP) */}
        <View style={{ marginTop: 20 }}>
          <AccordionItem title="Description" duration={450}>
            <Text style={styles.accordionBodyText}>{bundle.description || 'No description provided.'}</Text>
          </AccordionItem>

          <AccordionItem title="Included products (details)" duration={450}>
            <View>
              {bundle.products?.map((p) => (
                <View key={p._id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: '600' }}>{p.title}</Text>
                  <Text style={{ color: '#666' }}>₹{p.price}</Text>
                  {p.description && <Text numberOfLines={2} style={{ color: '#444', marginTop: 4 }}>{typeof p.description === 'string' ? p.description.replace(/<\/?[^>]+(>|$)/g, '') : ''}</Text>}
                </View>
              ))}
            </View>
          </AccordionItem>
 <AccordionItem title="Fit & Size" duration={450}>
          <View>
           

            <Text style={{ fontWeight: '600', marginBottom: 8 }}>
              Size Guide (Unisex Oversized):
            </Text>

            <View style={{ marginBottom: 10 }}>
              <Text>• XS — Chest 34-36" • Length 26"</Text>
              <Text>• S — Chest 36-38" • Length 27"</Text>
              <Text>• M — Chest 38-40" • Length 28"</Text>
              <Text>• L — Chest 40-42" • Length 29"</Text>
              <Text>• XL — Chest 42-44" • Length 30"</Text>
              <Text>• XXL — Chest 44-46" • Length 31"</Text>
            </View>

            <Text style={{ fontSize: 12, color: '#666' }}>
              Measurements may vary slightly depending on wash/fabric.
            </Text>
          </View>
        </AccordionItem>
          <AccordionItem title="Additional Details" duration={450}>
            <View>
              <Text style={{ fontWeight: '600', marginBottom: 6 }}>Bundle Highlights</Text>
              <Text>• Pre-packed bundle price</Text>
              <Text>• Carefully selected items</Text>
              <Text>• Save compared to buying items individually</Text>
            </View>
          </AccordionItem>
        </View>

    

        {/* NEW: More Bundles (additional section below "You Might Be Interested") */}
        {relatedBundles.length > 1 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 12 }}>You Might Be Interested</Text>
            <FlatList
              data={relatedBundles.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(b) => b._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recommendedItem, { width: 160 }]}
                  onPress={() => navigation.push('BundleScreen', { id: item._id })}
                >
                  <Image source={{ uri: item.mainImages?.[0] || item.products?.[0]?.images?.[0] || 'https://via.placeholder.com/150' }} style={[styles.recommendedImage, { width: 160, height: 110 }]} />
                  <Text numberOfLines={1} style={styles.recommendedTitle}>{item.title}</Text>
                  <Text style={styles.recommendedPrice}>₹{item.price}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* bottom spacing */}
        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingBottom: 32, backgroundColor: '#fff' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height:  height * 0.07,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff' // keep it transparent so carousel shows through if you want
  },
  headerLeft: { width: 48, justifyContent: 'center', alignItems: 'flex-start'},
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 19, paddingRight: 4 },
  headerIcon: { marginLeft: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  price: { fontSize: 18, fontWeight: '800', color: '#111', marginRight: 8 },
  descriptionText: { color: '#444', marginTop: 4 },
  mutedText: { color: '#666', marginTop: 6 },

  // images
  mainImage: { width, height: height * 0.55, resizeMode: 'cover', borderRadius: 12, backgroundColor: '#f8f8f8' },
  thumbnail: { width: 70, height: 70, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  activeThumbnail: { borderWidth: 2, borderColor: '#111' },

  sectionTitle: { color: '#111', fontWeight: '700', marginBottom: 8 },

  // included product row
  bundleProductBlock: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f3f3', paddingRight: 8 },
  bundleProductThumb: { width: width * 0.46, height: width * 0.46, borderRadius: 8, backgroundColor: '#fff' },
  productTitle: { color: '#111', fontWeight: '600' },
  productPrice: { color: '#111', marginTop: 6 },

  // size dropdown toggle (light, pill-like)
  sizeDropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
   width: width * 0.46
  },
  sizeDropdownLabel: { color: '#111', fontSize: 14 },

  // absolute dropdown list (light)
  dropdownListAbsolute: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: width * 0.46,
    zIndex: 30,
    elevation: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#111',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  dropdownOption: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#fafafa' },
  dropdownOptionActive: { backgroundColor: '#111' },
  dropdownOptionText: { color: '#111' },
  dropdownOptionTextActive: { color: '#fff' },

  // actions (PDP style)
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addButton: { flex: 1, backgroundColor: '#111', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  wishlistButton: { flex: 1, borderWidth: 1, borderColor: '#111', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  wishlistButtonText: { color: '#111', marginLeft: 8, fontWeight: '600' },

  buyNowFull: { marginTop: 12, borderWidth: 1, borderColor: '#111', paddingVertical: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', backgroundColor: '#fff' },
  buyNowText: { color: '#111', marginLeft: 8, fontWeight: '600' },

  // feature row
  featureRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18 },
  featureBox: { alignItems: 'center', width: '30%' },
  featureText: { fontSize: 12, textAlign: 'center', marginTop: 6, color: '#333' },

  // accordion (PDP-like)
  accordionItem: { borderBottomWidth: 1, borderBottomColor: '#f3f3f3', marginBottom: 8 },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  accordionTitle: { fontSize: 15, color: '#111', fontWeight: '600' },
  accordionAnimatedContainer: { overflow: 'hidden' },
  accordionContent: { paddingVertical: 8 },
  accordionBodyText: { color: '#333' },

  recommendedItem: { width: 140, marginRight: 12, backgroundColor: '#fff' },
  recommendedImage: { width: 140, height: 120, borderRadius: 8, backgroundColor: '#f8f8f8' },
  recommendedTitle: { fontSize: 12, fontWeight: '500', marginTop: 4, color: '#111' },
  recommendedPrice: { fontSize: 12, color: '#111' },

  unpublishedBadge: { backgroundColor: '#f3f3f3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
cartBadge: {
  position: 'absolute',
  top: -4,
  right: -6,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: '#111',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},

cartBadgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '700',
},

  // overlay to close dropdowns
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9, backgroundColor: 'transparent' },
});
