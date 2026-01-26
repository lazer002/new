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
} from 'react-native';
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

const { width,height } = Dimensions.get('window');

// ----------------------
// Reusable AccordionItem
// ----------------------
function AccordionItem({ title, children, duration = 600 }) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0); // 0 = closed, 1 = open
  const animatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: progress.value * 500, // 👈 500px is "full open" height, adjust if needed
      opacity: progress.value,
      overflow: 'hidden',
      transform: [
        {
          translateY: (1 - progress.value) * -8, // small slide while opening/closing
        },
      ],
    };
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration, // 600ms now for smoother feel
    });
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity onPress={toggle} style={styles.accordionHeader}>
        <Text style={{ fontWeight: '600' }}>{title}</Text>
        <Ionicons name={open ? 'remove' : 'add'} size={20} />
      </TouchableOpacity>

      <Animated.View style={[styles.accordionAnimatedContainer, animatedStyle]}>
        <View style={styles.accordionContent}>{children}</View>
      </Animated.View>
    </View>
  );
}


// ----------------------
// Product Screen
// ----------------------
export default function ProductScreen({ route, navigation }) {
  const { add, cartCount } = useCart();
  const { id } = route.params;
;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const flatListRef = useRef(null);

  // Load product + related
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const prod = res.data;
        setProduct(prod);

        const categoryId = prod.category;
        if (categoryId) {
          try {
            const relatedRes = await api.get('/api/products', {
              params: { category: categoryId },
            });

            const items = Array.isArray(relatedRes.data.items)
              ? relatedRes.data.items
              : [];

            const filtered = items.filter((p) => p._id !== prod._id);
            setRelatedProducts(filtered);
          } catch (err) {
            console.error('Error loading related products:', err);
            setRelatedProducts([]);
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    setSelectedSize(null);
  }, [id]);

  const onMomentumScrollEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveImage(newIndex);
  };

  const scrollToIndex = (index) => {
    setActiveImage(index);
    flatListRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#555' }}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <AppHeader title="Home" />
      <View>
        {/* Main swipeable image */}
        <FlatList
          ref={flatListRef}
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          onMomentumScrollEnd={onMomentumScrollEnd}
          extraData={activeImage}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          )}
        />

        {/* Thumbnails */}
        <FlatList
          data={product.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          extraData={activeImage}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => scrollToIndex(index)}>
              <Image
                source={{ uri: item }}
                style={[
                  styles.thumbnail,
                  activeImage === index && styles.activeThumbnail,
                ]}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Info */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.title}>{product.title}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginVertical: 6,
          }}
        >
          <Text style={styles.price}>₹ {product.price?.toFixed(2)}</Text>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={{ color: '#fff', fontSize: 12 }}>
                {product.discount}% OFF
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Size Selection */}
      {product.inventory && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>
            Select Size:
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(product.inventory).map(([size, qty]) => {
              const isAvailable = qty > 0;

              return (
                <TouchableOpacity
                  key={size}
                  disabled={!isAvailable}
                  onPress={() => isAvailable && setSelectedSize(size)}
                  style={[
                    styles.sizePill,
                    selectedSize === size && styles.selectedSize,
                    !isAvailable && styles.disabledSize,
                  ]}
                >
                  <Text
                    style={[
                      selectedSize === size && { color: '#fff' },
                      !isAvailable && { color: '#999' },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedSize && (
            <Text style={{ marginTop: 8 }}>Selected Size: {selectedSize}</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (!selectedSize) {
                alert('Please select a size first!');
                return;
              }
              add(product._id, selectedSize);
            }}
            style={styles.button}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 6 }}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              isInWishlist(product._id)
                ? removeFromWishlist(product._id)
                : addToWishlist(product._id)
            }
            style={[styles.button, styles.outlineButton]}
          >
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist(product._id) ? 'black' : '#000'}
            />
            <Text style={{ marginLeft: 6 }}>Wishlist</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              marginTop: 12,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: 'black',
            },
          ]}
        >
          <Ionicons name="card-outline" size={20} color="black" />
          <Text style={{ color: 'black', marginLeft: 6 }}>Buy Now</Text>
        </TouchableOpacity>

        {/* Feature Icons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
          }}
        >
          <View style={styles.featureBox}>
            <MaterialIcons name="local-shipping" size={28} color="black" />
            <Text style={{ fontSize: 12, textAlign: 'center' }}>
              Priority Delivery
            </Text>
          </View>
          <View style={styles.featureBox}>
            <MaterialIcons name="swap-horiz" size={28} color="black" />
            <Text style={{ fontSize: 12, textAlign: 'center' }}>
              Easy Exchange
            </Text>
          </View>
          <View style={styles.featureBox}>
            <MaterialIcons name="payment" size={28} color="black" />
            <Text style={{ fontSize: 12, textAlign: 'center' }}>
              Cash on Delivery
            </Text>
          </View>
        </View>
      </View>

      {/* Accordion Section (Reanimated) */}
      <View style={{ marginTop: 24 }}>
        <AccordionItem title="Description" duration={450}>
          <Text>{product.description}</Text>
        </AccordionItem>

        <AccordionItem title="Product Code" duration={450}>
          <View>
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>SKU</Text>
            <Text style={{ fontSize: 14, color: '#111' }}>
              {product.sku ? String(product.sku) : 'N/A'}
            </Text>
          </View>
        </AccordionItem>

        <AccordionItem title="Fit & Size" duration={450}>
          <View>
            <Text style={{ marginBottom: 10 }}>
              {product.fit || 'Standard Fit'}
            </Text>

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
            <Text style={{ fontWeight: '600', marginBottom: 6 }}>
              Product Highlights:
            </Text>

            <Text>• Made in India</Text>
            <Text>• Premium 100% Cotton Fabric</Text>
            <Text>• High-quality non-PVC prints</Text>
            <Text>• Pre-shrunk & bio-washed</Text>
            <Text>• Designed for everyday comfort</Text>
          </View>
        </AccordionItem>
      </View>

      {/* Recommended / Similar Products */}
      {relatedProducts.length > 0 && (
        <View style={{ marginTop: 24, marginBottom: 50 }}>
          <Text
            style={{
              fontWeight: '600',
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            You Might Be Interested
          </Text>

          <FlatList
            data={relatedProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recommendedItem}
                onPress={() =>
                  navigation.push('ProductScreen', { id: item._id })
                }
              >
                <Image
                  source={{
                    uri: item.images?.[0] || 'https://via.placeholder.com/150',
                  }}
                  style={styles.recommendedImage}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: 'black' }}>
                  ₹{item.price}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  price: { fontSize: 16, fontWeight: '700', color: 'black' },
  description: { fontSize: 14, color: '#666', marginTop: 8 },
  discountBadge: {
    backgroundColor: 'black',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  selectedSize: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  disabledSize: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 10,
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'black',
  },
  featureBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  accordionAnimatedContainer: {
    overflow: 'hidden',
  },
  accordionContent: {
    paddingVertical: 8,
  },
  recommendedItem: {
    width: 120,
    marginRight: 12,
  },
  recommendedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  mainImage: {
    width,
    height: 400,
    borderRadius: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: 'black',
  },
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

});
