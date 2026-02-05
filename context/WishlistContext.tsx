import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../utils/config";
import { useAuth } from "./AuthContext";

/* ================= TYPES ================= */

type WishlistContextType = {
  wishlist: string[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
};

type WishlistProviderProps = {
  children: ReactNode;
};

/* ================= CONTEXT ================= */

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

/* ================= CONSTANTS ================= */

const GUEST_KEY = "guestWishlist_v1";

/* ================= PROVIDER ================= */

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { user } = useAuth();
  const userId = user?._id ?? null;

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- GUEST HELPERS ---------- */

  const loadGuestWishlist = async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setWishlist(list);
    } catch (e) {
      console.log("Guest wishlist load error:", e);
      setWishlist([]);
    }
  };

  const saveGuestWishlist = async (list: string[]) => {
    try {
      await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(list));
    } catch (e) {
      console.log("Guest wishlist save error:", e);
    }
  };

  const clearGuestWishlist = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_KEY);
    } catch (e) {
      console.log("Guest wishlist clear error:", e);
    }
  };

  /* ---------- FETCH / REFRESH ---------- */

  const refreshWishlist = async () => {
    // ---------- GUEST ----------
    if (!userId) {
      await loadGuestWishlist();
      return;
    }

    // ---------- LOGGED IN ----------
    try {
      setLoading(true);

      // 1️⃣ Merge guest wishlist ON LOGIN
      const raw = await AsyncStorage.getItem(GUEST_KEY);
      const guestItems: string[] = raw ? JSON.parse(raw) : [];

      if (guestItems.length > 0) {
        await api.post("/api/wishlist/sync", {
          items: guestItems,
        });
        await clearGuestWishlist();
      }

      // 2️⃣ Fetch canonical wishlist from DB
      const { data } = await api.get("/api/wishlist");
      setWishlist(data?.items ?? []);
    } catch (e) {
      console.log("Wishlist refresh error:", e);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- ADD ---------- */

  const addToWishlist = async (productId: string) => {
    if (!productId) return;

    // Guest
    if (!userId) {
      const updated = Array.from(new Set([...wishlist, productId]));
      setWishlist(updated);
      await saveGuestWishlist(updated);
      return;
    }

    // Logged in
    try {
      await api.post("/api/wishlist/wishadd", { productId });
      setWishlist((prev) =>
        prev.includes(productId) ? prev : [...prev, productId]
      );
    } catch (e) {
      console.log("Add wishlist error:", e);
    }
  };

  /* ---------- REMOVE ---------- */

  const removeFromWishlist = async (productId: string) => {
    if (!productId) return;

    // Guest
    if (!userId) {
      const updated = wishlist.filter((id) => id !== productId);
      setWishlist(updated);
      await saveGuestWishlist(updated);
      return;
    }

    // Logged in
    try {
      await api.post("/api/wishlist/wishremove", { productId });
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } catch (e) {
      console.log("Remove wishlist error:", e);
    }
  };

  /* ---------- CHECK ---------- */

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  /* ---------- EFFECT ---------- */

  useEffect(() => {
    refreshWishlist();
  }, [userId]);

  /* ---------- PROVIDE ---------- */

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
};
