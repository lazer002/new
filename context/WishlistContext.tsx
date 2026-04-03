import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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

  /* ---------- FETCH ---------- */

  const refreshWishlist = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/wishlist", {
        headers: {
          "x-guest-id": guestId || "",
        },
      });

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
      await api.post(
        "/api/wishlist/wishadd",
        { productId },
        {
          headers: {
            "x-guest-id": guestId || "",
          },
        }
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
      await api.post(
        "/api/wishlist/wishremove",
        { productId },
        {
          headers: {
            "x-guest-id": guestId || "",
          },
        }
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

  /* ---------- EFFECT ---------- */

  useEffect(() => {
    if (guestId) {
      refreshWishlist();
    }
  }, [userId, guestId]);

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