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

/* ================= PROVIDER ================= */

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { user, guestId } = useAuth();
  const userId = user?._id ?? null;

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- HELPER: HEADERS ---------- */

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("ds_access");

  const headers: any = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (guestId) {
    headers["x-guest-id"] = guestId;
  }

  console.log("Using headers:", headers);

  return headers;
};
  /* ---------- FETCH ---------- */

const refreshWishlist = async () => {
  try {
    setLoading(true);

    const headers = await getHeaders();

    // 🔥 STOP if empty
    if (!headers.Authorization && !headers["x-guest-id"]) {
      console.log("Skipping wishlist (no identity)");
      return;
    }

    const { data } = await api.get("/api/wishlist", { headers });

    setWishlist(Array.from(new Set(data?.items ?? [])));
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

    try {
      const headers = await getHeaders();

      await api.post(
        "/api/wishlist/wishadd",
        { productId },
        { headers }
      );

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

    try {
      const headers = await getHeaders();

      await api.post(
        "/api/wishlist/wishremove",
        { productId },
        { headers }
      );

      setWishlist((prev) => prev.filter((id) => id !== productId));
    } catch (e) {
      console.log("Remove wishlist error:", e);
    }
  };

  /* ---------- CHECK ---------- */

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  /* ---------- SYNC AFTER LOGIN ---------- */

  useEffect(() => {
    const syncWishlist = async () => {
      const token = await AsyncStorage.getItem("ds_access");
      const gid = await AsyncStorage.getItem("ds_guest");

      if (!token || !gid) return;

      try {
        console.log("🔄 SYNCING WISHLIST");

        // 1. get guest wishlist
        const res = await api.get("/api/wishlist", {
          headers: { "x-guest-id": gid },
        });

        const guestItems = res.data.items || [];

        if (guestItems.length > 0) {
          // 2. sync to user
          await api.post(
            "/api/wishlist/sync",
            { items: guestItems },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        // 3. cleanup guest
        await AsyncStorage.removeItem("ds_guest");

        console.log("✅ Wishlist synced");
      } catch (err) {
        console.error("Sync failed", err);
      }
    };

    if (user) {
      syncWishlist();
    }
  }, [user]);

  /* ---------- EFFECT ---------- */
useEffect(() => {
  if (!guestId && !user) return; // 🔥 must

  refreshWishlist();
}, [guestId, user]);

  /* ---------- PROVIDE ---------- */
console.log("WishlistContext render",  wishlist.length );
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