import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import  Toast  from "react-native-toast-message";

import { useAuth } from "./AuthContext";
import api from "../utils/config";

/* ================= TYPES ================= */

type CartItem = any; // keep flexible (your backend controls shape)

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  cartCount: number;
  add: (productId: string, size: string, quantity?: number) => Promise<void>;
  update: (
    id: string,
    quantity: number,
    size?: string,
    isBundle?: boolean
  ) => Promise<void>;
  remove: (id: string, size?: string, isBundle?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  addBundleToCart: (bundle: any, selectedSizes: Record<string, string>) => Promise<void>;
  clearCart: (opts?: { server?: boolean }) => Promise<void>;
};

type CartProviderProps = {
  children: ReactNode;
};

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= GUEST ID ================= */

async function ensureGuestId(): Promise<string | null> {
  try {
    let gid = await AsyncStorage.getItem("ds_guest");
    if (!gid) {
      gid = Crypto.randomUUID();
      await AsyncStorage.setItem("ds_guest", gid);
    }
    return gid;
  } catch (err) {
    console.error("Failed to ensure guest id:", err);
    return null;
  }
}

/* ================= PROVIDER ================= */

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  /* ---------- INIT GUEST ID ---------- */

  useEffect(() => {
    (async () => {
      const id = await ensureGuestId();
      setGuestId(id);
    })();
  }, []);

  /* ---------- API CLIENT ---------- */

  const client = (token?: string) => {
    if (!guestId) return null;

    const headers = {
      "x-guest-id": guestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return {
      get: (url: string) => api.get(`/api/cart${url}`, { headers }),
      post: (url: string, data?: any) =>
        api.post(`/api/cart${url}`, data, { headers }),
    };
  };

  /* ---------- REFRESH ---------- */

  const refresh = async () => {
    if (!guestId) return;

    setLoading(true);
    try {
      const c = client();
      if (!c) return;

      const { data } = await c.get("/");
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      Toast.show({type: "error", text1: "Failed to refresh cart"});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guestId) refresh();
  }, [guestId]);

  /* ---------- MERGE GUEST CART ---------- */

  const mergeGuestCart = async () => {
    if (!user || !guestId) return;

    try {
      const token = await AsyncStorage.getItem("ds_access");
      if (!token) return;

      const c = client(token);
      if (!c) return;

      await c.post("/merge", { guestId });
      await refresh();
      Toast.show({type: "success", text1: "Guest cart merged successfully"});
    } catch (err) {
      console.error(err);
      Toast.show({type: "error", text1: "Failed to merge guest cart"});
    }
  };

  useEffect(() => {
    if (user && guestId) mergeGuestCart();
  }, [user, guestId]);

  /* ---------- ADD ---------- */

  const add = async (productId: string, size: string, quantity = 1) => {
    if (!guestId) return;

    if (!size) {
      Toast.show({type: "error", text1: "Please select a size"});
      return;
    }

    try {
      const c = client();
      if (!c) return;

      await c.post("/add", { productId, size, quantity });
      await refresh();
      Toast.show({type: "success", text1: "Added to cart"});
    } catch (err: any) {
      console.error(err);
      Toast.show({type: "error", text1: 
        err?.response?.data?.code === 11000
          ? "Already in cart"
          : "Failed to add item"
      });
    }
  };

  /* ---------- UPDATE ---------- */

  const update = async (
    id: string,
    quantity: number,
    size?: string,
    isBundle = false
  ) => {
    if (!guestId) return;

    if (quantity <= 0) {
      return remove(id, size, isBundle);
    }

    try {
      const c = client();
      if (!c) return;

      await c.post("/update", {
        quantity,
        size: isBundle ? undefined : size,
        productId: isBundle ? undefined : id,
        bundleId: isBundle ? id : undefined,
      });

      await refresh();
      Toast.show({type: "success", text1: "Cart updated"});
    } catch (err) {
      console.error(err);
      Toast.show({type: "error", text1: "Failed to update cart"});
      await refresh();
    }
  };

  /* ---------- REMOVE ---------- */

  const remove = async (
    id: string,
    size?: string,
    isBundle = false
  ) => {
    if (!guestId) return;

    try {
      const c = client();
      if (!c) return;

      await c.post("/remove", isBundle ? { bundleId: id } : { productId: id, size });
      await refresh();
    } catch (err) {
      console.error(err);
      Toast.show({type: "error", text1: "Failed to remove item"});
      await refresh();
    }
  };

  /* ---------- CLEAR ---------- */

const clearCart = async (opts?: { server?: boolean }) => {
  if (!guestId) return;

  const shouldClearServer = opts?.server ?? true;

  setLoading(true);
  try {
    setItems([]);

    if (shouldClearServer) {
      const c = client();
      if (c) await c.post("/clear");
    }

    Toast.show({type: "success", text1: "Cart cleared"});
  } catch (err) {
    console.error("Failed to clear cart:", err);
    Toast.show({type: "error", text1: "Failed to clear cart"});
    await refresh();
  } finally {
    setLoading(false);
  }
};

  /* ---------- BUNDLE ---------- */

  const addBundleToCart = async (bundle: any, selectedSizes: Record<string, string>) => {
    if (!guestId) return;

    try {
      const c = client();
      if (!c) return;

      await c.post("/addbundle", {
        bundleId: bundle._id,
        mainImage: bundle.mainImages?.[0] || "",
        bundleProducts: bundle.products.map((p: any) => ({
          productId: p._id,
          size: selectedSizes[p._id],
          quantity: 1,
        })),
      });

      await refresh();
      Toast.show({type: "success", text1: "Bundle added to cart"});
    } catch (err) {
      console.error(err);
      Toast.show({type: "error", text1: "Failed to add bundle"});
      await refresh();
    }
  };

  /* ---------- COUNT ---------- */

  const cartCount = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  }, [items]);

  /* ---------- PROVIDE ---------- */

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount,
        add,
        update,
        remove,
        refresh,
        mergeGuestCart,
        addBundleToCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
