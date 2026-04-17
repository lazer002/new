import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api as baseApi } from "../utils/config";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as AuthSession from "expo-auth-session"
WebBrowser.maybeCompleteAuthSession();

/* ================= TYPES ================= */

type User = any;

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  api: typeof baseApi;
  loading: boolean;
  guestId: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGoogle: (code: string, codeVerifier: string) => Promise<any>;
  promptGoogleLogin: () => Promise<void>;
  promptFacebookLogin: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMerged, setIsMerged] = useState(false);

  const router = useRouter();

  /* ---------- INIT ---------- */

/* ---------- LOAD STORED AUTH ---------- */

useEffect(() => {
  (async () => {
    try {
      const rawUser = await AsyncStorage.getItem("ds_user");
      const at = await AsyncStorage.getItem("ds_access");
      const rt = await AsyncStorage.getItem("ds_refresh");
      const gid = await AsyncStorage.getItem("ds_guest");

      // ✅ Guest setup (keep as is)
      if (gid) {
        setGuestId(gid);
      } else {
        const newGuestId =
          Math.random().toString(36).substring(2) + Date.now();
        await AsyncStorage.setItem("ds_guest", newGuestId);
        setGuestId(newGuestId);
      }

      // 🔥 FIX STARTS HERE
      if (at && rawUser) {
        setAccessToken(at);
        setRefreshToken(rt);
        setUser(JSON.parse(rawUser));
      } else {
        setUser(null);          // 🔥 CRITICAL
        setAccessToken(null);   // 🔥 CRITICAL
        setRefreshToken(null);  // 🔥 CRITICAL
      }

    } catch (err) {
      console.error("Failed to load auth state:", err);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  /* ---------- PERSIST ---------- */

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

  /* ---------- AXIOS ---------- */

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

  /* ---------- MERGE (🔥 CORE FIX) ---------- */

  const mergeGuestData = async (gid: string) => {
    if (!accessToken || !gid || isMerged) return;

    try {
      console.log("🔥 MERGING ALL DATA");

      await baseApi.post("/api/orders/merge-orders", {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-guest-id": gid,
        },
      });

      await baseApi.post("/api/wishlist/sync", {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-guest-id": gid,
        },
      });

      console.log("✅ MERGE DONE");

      await AsyncStorage.removeItem("ds_guest");
      setGuestId(null);
      setIsMerged(true);

    } catch (err) {
      console.log("❌ Merge error", err);
    }
  };

  useEffect(() => {
    if (user && guestId) {
      mergeGuestData(guestId);
    }
  }, [user, guestId]);

  /* ---------- LOGOUT ---------- */

  const handleLogout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

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
    setIsMerged(false);

    Toast.show({ type: "success", text1: "Logged out" });
  };

  /* ---------- AUTH ---------- */

  const login = async (email: string, password: string) => {
    const { data } = await baseApi.post("/auth/login", { email, password });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

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
    const { data } = await baseApi.post("api/auth/google/mobile", {
      code,
      codeVerifier,
    });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

    return data;
  };

  /* ---------- GOOGLE ---------- */

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    responseType: "code",
    usePKCE: true,
    extraParams: { access_type: "offline" },
    shouldAutoExchangeCode: false,
  });

  const promptGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result?.type !== "success") return;

      const code = result.params?.code;
      const codeVerifier = request?.codeVerifier;

      if (!code || !codeVerifier) return;

      await loginWithGoogle(code, codeVerifier);

    } catch (err: any) {
      console.log("Google error:", err);
    }
  };


const [fbRequest, fbResponse, fbPromptAsync] = AuthSession.useAuthRequest(
  {
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ["public_profile", "email"],
    responseType: AuthSession.ResponseType.Token,
  },
  {
    authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
  }
);
const promptFacebookLogin = async () => {
  try {
    const result = await fbPromptAsync();
    if (result?.type !== "success") return;

    const accessToken = result.params?.access_token;
    if (!accessToken) return;

    // 🔥 SAME PATTERN AS GOOGLE
    const { data } = await baseApi.post("/api/auth/facebook", {
      access_token: accessToken,
    });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

  } catch (err) {
    console.log("Facebook error:", err);
  }
};

console.log("AuthContext rendered", { user, guestId, loading });
  /* ---------- PROVIDER ---------- */

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
        promptGoogleLogin,
         promptFacebookLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- HOOK ---------- */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}