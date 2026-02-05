// src/context/WishlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { api } from '../utils/config'; // ✅ NAMED IMPORT (IMPORTANT)
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const GUEST_KEY = 'guestWishlist_v1';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || null;

  const [wishlist, setWishlist] = useState([]); // ['productId']
  const [loading, setLoading] = useState(false);

  /* ---------------- GUEST HELPERS ---------------- */

  const loadGuestWishlist = async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setWishlist(list);
    } catch (e) {
      console.log('Guest wishlist load error', e);
      setWishlist([]);
    }
  };

  const saveGuestWishlist = async (list) => {
    try {
      await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(list));
    } catch (e) {
      console.log('Guest wishlist save error', e);
    }
  };

  /* ---------------- FETCH ---------------- */

  const fetchWishlist = async () => {
    if (!userId) {
      await loadGuestWishlist();
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/api/wishlist/${userId}`);
      setWishlist(data?.wishlist || []);
    } catch (e) {
      console.log('Fetch wishlist error:', e);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD ---------------- */

  const addToWishlist = async (productId) => {
    if (!productId) return;

    if (!userId) {
      const updated = [...new Set([...wishlist, productId])];
      setWishlist(updated);
      saveGuestWishlist(updated);
      return;
    }

    try {
      await api.post('/api/wishlist/add', { userId, productId });
      await fetchWishlist();
    } catch (e) {
      console.log('Add wishlist error:', e);
    }
  };

  /* ---------------- REMOVE ---------------- */

  const removeFromWishlist = async (productId) => {
    if (!productId) return;

    if (!userId) {
      const updated = wishlist.filter((id) => id !== productId);
      setWishlist(updated);
      saveGuestWishlist(updated);
      return;
    }

    try {
      await api.post('/api/wishlist/remove', { userId, productId });
      await fetchWishlist();
    } catch (e) {
      console.log('Remove wishlist error:', e);
    }
  };

  /* ---------------- CHECK ---------------- */

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    fetchWishlist();
  }, [userId]);
  
  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
