import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api as baseApi } from "../utils/config";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Redirect, useRouter } from "expo-router";
  import * as AuthSession from "expo-auth-session";
import Toast from "react-native-toast-message";

WebBrowser.maybeCompleteAuthSession();
/* ================= TYPES ================= */

type User = any; // keep flexible – backend controls shape

type AuthContextType = {
  user: User | null;
    setUser: (user: User | null) => void ;
  api: typeof baseApi;
  loading: boolean;
   guestId: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGoogle: (code: string, codeVerifier: string) => Promise<any>;
  promptGoogleLogin: () => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: AuthProviderProps) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const router = useRouter();

  /* ---------- LOAD STORED AUTH ---------- */

  useEffect(() => {
    (async () => {
      try {
        const rawUser = await AsyncStorage.getItem("ds_user");
        const at = await AsyncStorage.getItem("ds_access");
        const rt = await AsyncStorage.getItem("ds_refresh");
        const gid = await AsyncStorage.getItem("ds_guest");

        
        if (gid) {
          setGuestId(gid);
        } else {
          const newGuestId = Math.random().toString(36).substring(2) + Date.now();
          await AsyncStorage.setItem("ds_guest", newGuestId);
          setGuestId(newGuestId);
        }

        if (rawUser) setUser(JSON.parse(rawUser));
        if (at) setAccessToken(at);
        if (rt) setRefreshToken(rt);
      } catch (err) {
        console.error("Failed to load auth state:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- PERSIST STORAGE ---------- */

  useEffect(() => {
    user
      ? AsyncStorage.setItem("ds_user", JSON.stringify(user))
      : AsyncStorage.removeItem("ds_user");
  }, [user]);

  useEffect(() => {
    accessToken
      ? AsyncStorage.setItem("ds_access", accessToken)
      : AsyncStorage.removeItem("ds_access");
  }, [accessToken]);

  useEffect(() => {
    refreshToken
      ? AsyncStorage.setItem("ds_refresh", refreshToken)
      : AsyncStorage.removeItem("ds_refresh");
  }, [refreshToken]);



  

  /* ---------- AXIOS WITH INTERCEPTORS ---------- */
const api = baseApi; 
useEffect(() => {
  const reqId = baseApi.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (guestId) {
      config.headers["x-guest-id"] = guestId;
    }

    return config;
  });

  const resId = baseApi.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalReq = error.config;

      if (
        error.response?.status === 401 &&
        refreshToken &&
        !originalReq._retry
      ) {
        try {
          originalReq._retry = true;

          const { data } = await baseApi.post("/auth/refresh", {
            refreshToken,
          });

          setAccessToken(data.accessToken);

          originalReq.headers.Authorization = `Bearer ${data.accessToken}`;

          return baseApi(originalReq);
        } catch {
          await handleLogout();
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    baseApi.interceptors.request.eject(reqId);
    baseApi.interceptors.response.eject(resId);
  };

}, [accessToken, refreshToken, guestId]);
  /* ---------- LOGOUT ---------- */

const handleLogout = async () => {
  setUser(null);
  setAccessToken(null);
  setRefreshToken(null);

  // 🔥 REMOVE HEADER IMMEDIATELY
  delete baseApi.defaults.headers.common["Authorization"];

  await AsyncStorage.multiRemove([
    "ds_user",
    "ds_access",
    "ds_refresh",
  ]);

  const newGuestId =
    Math.random().toString(36).substring(2) + Date.now();

  await AsyncStorage.setItem("ds_guest", newGuestId);
  setGuestId(newGuestId);

  Toast.show({
    type: "success",
    text1: "Logged out",
  });
};


const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
 androidClientId:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  responseType: "code",
  usePKCE: true,
  extraParams: {
    access_type: "offline",
  },
    shouldAutoExchangeCode: false
});



  /* ---------- AUTH ACTIONS ---------- */

  const login = async (email: string, password: string) => {
    const { data } = await baseApi.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

      try {
    const token = data.accessToken;

    await baseApi.post("/api/orders/merge-orders", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Orders merged after login");
  } catch (err) {
    console.log("❌ Merge failed", err);
  }

    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await baseApi.post("/auth/register", {
      name,
      email,
      password,
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

const loginWithGoogle = async (code: string, codeVerifier: string) => {
  try {
    const { data } = await baseApi.post("api/auth/google/mobile", {
      code,
      codeVerifier
      // ✅ send code instead of token
    });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

try {
  const token = data.accessToken;

  console.log("➡️ Calling merge-orders API (Google)");

  const res = await baseApi.post("/api/orders/merge-orders", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
      
    },
  });

if (!guestId) return;
await baseApi.post("/api/wishlist/sync", {}, {
  headers: {
    Authorization: `Bearer ${data.accessToken}`,
    "x-guest-id": guestId, // 🔥 USE STATE
  },
});

  console.log("✅ Merge response:", res.data);
} catch (err) {
  console.log("❌ Merge failed:", err);
}
    return data;
  } catch (err: any) {
    console.log("Google API login error", err);
    throw err;
  }
};


const promptGoogleLogin = async () => {
  try {
    if (!request || !promptAsync) {
      throw new Error("Google request not ready");
    }

    const result = await promptAsync();

    if (result?.type !== "success") return;

    const code = result.params?.code;
    const codeVerifier = request?.codeVerifier;

    if (!code || !codeVerifier) return;

    await loginWithGoogle(code, codeVerifier);

  } catch (err: any) {
    // 🔥 THIS IS THE FIX
    if (
      err?.message?.includes("authorization grant") ||
      err?.message?.includes("invalid_grant")
    ) {
      console.log("Ignoring Expo token exchange error");
      return;
    }

    console.log("Google prompt error:", err);
  }
};
  /* ---------- PROVIDE ---------- */
  return (
    <AuthContext.Provider
      value={{
        guestId,
        user,
        setUser,
        api,
        loading,
        login,
        register,
        loginWithGoogle,
        logout: handleLogout,
        promptGoogleLogin

      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
