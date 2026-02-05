import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo
} from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/config';

import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Toast from 'react-native-toast-message';

const CartContext = createContext(null);

// 🔐 Async guestId using AsyncStorage (no localStorage in RN)
async function ensureGuestId() {
  try {
    let gid = await AsyncStorage.getItem('ds_guest');
    if (!gid) {
      gid = uuidv4();
      await AsyncStorage.setItem('ds_guest', gid);
    }
    return gid;
  } catch (err) {
    console.error('Failed to ensure guest id:', err);
    return null;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [guestId, setGuestId] = useState(null);

  // Load/ensure guestId once
  useEffect(() => {
    (async () => {
      const id = await ensureGuestId();
      setGuestId(id);
    })();
  }, []);

  // Small helper: only build client when guestId exists
  const client = (token) => {
    if (!guestId) {
      // we will guard calls with guestId check
      throw new Error('Guest id not ready yet');
    }

    const headers = {
      'x-guest-id': guestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return {
      get: (url) => api.get(`api/cart${url}`, { headers }),
      post: (url, data) => api.post(`api/cart${url}`, data, { headers }),
    };
  };

  const refresh = async () => {
    if (!guestId) return; // wait until guestId ready
    setLoading(true);
    try {
      const { data } = await client().get('/');
      setItems(data.items || []);
     
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: 'Failed to refresh cart',
      });
    } finally {
      setLoading(false);
    }
    
  };

  // Fetch cart when guestId is ready
  useEffect(() => {
    if (guestId) {
      refresh();
    }
  }, [guestId]);

  // Merge guest cart after login
  const mergeGuestCart = async () => {
    if (!user || !guestId) return;

    try {
      const token = await AsyncStorage.getItem('ds_access');
      if (!token) return;

      await client(token).post('/merge', { guestId });
      await refresh();
      Toast.show({
        type: 'success',
        text1: 'Cart Updated',
        text2: 'Guest cart merged successfully',
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: 'Failed to merge guest cart',
      });
    }
  };

  useEffect(() => {
    if (user && guestId) {
      mergeGuestCart();
    }
  }, [user, guestId]);

  const add = async (productId, size, quantity = 1) => {
    if (!guestId) return;
    if (!size) {
      Toast.show({
        type: 'error',
        text1: 'Please select a size',
      });
      return;
    }

    const existing = items.find(
      (i) => i.product && i.product._id === productId && i.size === size
    );

    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.product && i.product._id === productId && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { product: { _id: productId }, size, quantity },
      ]);
    }

    try {
      await client().post('/add', { productId, size, quantity });
      await refresh();
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
      });
    } catch (err) {
      console.error(err);

      if (err.response?.data?.code === 11000) {
        Toast.show({
          type: 'error',
          text1: 'Already in cart',
          text2: 'This product & size already exists in cart',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cart Error',
          text2: 'Failed to add item',
        });
      }

      refresh();
    }
  };

  const update = async (id, quantity, size, isBundle = false) => {
    if (!guestId) return;

    if (quantity <= 0) {
      return remove(id, size, isBundle);
    }

    setItems((prev) =>
      prev.map((i) => {
        if (isBundle) {
          return i.bundle?._id === id ? { ...i, quantity } : i;
        } else {
          return i.product?._id === id && i.size === size
            ? { ...i, quantity }
            : i;
        }
      })
    );

    try {
      await client().post('/update', {
        quantity,
        size: isBundle ? undefined : size,
        productId: isBundle ? undefined : id,
        bundleId: isBundle ? id : undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Cart updated',
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: 'Failed to update cart',
      });
      await refresh();
    }
  };

  const remove = async (id, size, isBundle = false) => {
    if (!guestId) return;

    if (isBundle) {
      setItems((prev) => prev.filter((i) => i.bundle?._id !== id));
    } else {
      setItems((prev) =>
        prev.filter((i) => !(i.product?._id === id && i.size === size))
      );
    }

    try {
      if (isBundle) {
        await client().post('/remove', { bundleId: id });
      } else {
        await client().post('/remove', { productId: id, size });
      }

    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: err.response?.data?.error || 'Failed to remove item',
      });
      await refresh();
    }
  };

  const clearCart = async (opts = { server: true }) => {
    if (!guestId) return;

    setLoading(true);
    try {
      setItems([]);

      if (opts.server) {
        await client().post('/clear');
      }

      Toast.show({
        type: 'success',
        text1: 'Cart cleared',
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: 'Failed to clear cart',
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const addBundleToCart = async (bundle, selectedSizes) => {
    if (!guestId) return;
    
    const allSizesSelected =
      bundle.products.every((p) => selectedSizes[p._id]) &&
      Object.keys(selectedSizes).length === bundle.products.length;


    if (!allSizesSelected) {
      Toast.show({
        type: 'error',
        text1: 'Missing sizes',
        text2: 'Please select size for all products in the bundle',
      });
      return;
    }

    const existing = items.find((item) => {
      if (!item.bundle) return false;
      if (item.bundle._id !== bundle._id) return false;

      return item.bundleProducts.every((bp) => {
        const productId = bp.product?._id || bp.product;
        return selectedSizes[productId] && bp.size === selectedSizes[productId];
      });
    });

    if (existing) {
      setItems((prev) =>
        prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const bundleProducts = bundle.products.map((p) => ({
        product: {
          _id: p._id,
          title: p.title,
          price: p.price,
          images: p.images,
        },
        size: selectedSizes[p._id],
        quantity: 1,
      }));

      setItems((prev) => [
        ...prev,
        {
          bundle: {
            _id: bundle._id,
            title: bundle.title,
            price: bundle.price,
            mainImage: bundle.mainImages?.[0] || '/placeholder.jpg',
          },
          bundleProducts,
          quantity: 1,
        },
      ]);
    }

    try {
      await client().post('/addbundle', {
        bundleId: bundle._id,
        mainImage: bundle.mainImages?.[0] || '',
        bundleProducts: bundle.products.map((p) => ({
          productId: p._id,
          size: selectedSizes[p._id],
          quantity: 1,
        })),
      });

      await refresh();
      Toast.show({
        type: 'success',
        text1: 'Bundle added to cart',
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: 'Failed to add bundle',
      });
      await refresh();
    }
  };
const cartCount = useMemo(() => {
  return items.reduce((sum, it) => sum + (it.quantity || 1), 0);
}, [items]);


  const value = {
    items,
    add,
    update,
    remove,
    refresh,
    mergeGuestCart,
    addBundleToCart,
    clearCart,
    loading,
    cartCount
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
