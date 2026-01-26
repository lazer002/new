import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/config';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function FavoritesScreen({ navigation }) {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { add } = useCart();

  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);

  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ================= FETCH PRODUCTS + BUNDLES ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/bundles'),
        ]);

        setProducts(pRes.data.items || []);
        setBundles(bRes.data.items || bRes.data || []);
      } catch (err) {
        console.log('Wishlist load error:', err);
      }
    };

    load();
  }, []);

  /* ================= BUILD WISHLIST ITEMS ================= */

  const wishlistItems = useMemo(() => {
    const productItems = products
      .filter((p) => wishlist.includes(p._id.toString()))
      .map((p) => ({ ...p, _type: 'product' }));

    const bundleItems = bundles
      .filter((b) => wishlist.includes(b._id.toString()))
      .map((b) => ({ ...b, _type: 'bundle' }));

    return [...productItems, ...bundleItems];
  }, [wishlist, products, bundles]);

  /* ================= HANDLERS ================= */

  const openSizeModal = (product) => {
    setSelectedProduct(product);
    setSizeModalVisible(true);
  };

  const addToCartWithSize = (size) => {
    if (!selectedProduct) return;

    add(selectedProduct._id, size);
    removeFromWishlist(selectedProduct._id); // ✅ remove after add
    setSizeModalVisible(false);
  };

  /* ================= RENDER CARD ================= */

  const renderItem = ({ item }) => {
    const isBundle = item._type === 'bundle';

    const image =
      isBundle
        ? item.mainImages?.[0]
        : item.images?.[0];

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate(
              isBundle ? 'BundleScreen' : 'ProductScreen',
              { id: item._id }
            )
          }
        >
          <Image
            source={{ uri: image || 'https://via.placeholder.com/300' }}
            style={styles.image}
          />
        </TouchableOpacity>

        {/* Remove wishlist */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => removeFromWishlist(item._id)}
        >
          <Ionicons name="heart" size={20} color="black" />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>

          <Text style={styles.price}>₹{item.price}</Text>

          {isBundle ? (
            <TouchableOpacity
              style={styles.bundleBtn}
              onPress={() =>
                navigation.navigate('BundleScreen', { id: item._id })
              }
            >
              <Text style={styles.bundleBtnText}>View Bundle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => openSizeModal(item)}
            >
              <Ionicons name="cart-outline" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 26 }} />
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* SIZE MODAL */}
      <Modal
        visible={sizeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Size</Text>

            <View style={styles.sizeGrid}>
              {SIZE_OPTIONS.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.sizeBtn}
                  onPress={() => addToCartWithSize(size)}
                >
                  <Text style={styles.sizeText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSizeModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },

  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#f5f5f5',
  },

  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },

  info: { padding: 10 },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 8,
    borderRadius: 8,
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },

  bundleBtn: {
    borderWidth: 1,
    borderColor: '#111',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  bundleBtnText: {
    fontWeight: '600',
    color: '#111',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  sizeBtn: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  sizeText: { fontWeight: '600' },

  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  cancelText: {
    color: '#FF4D4F',
    fontWeight: '600',
  },
});
