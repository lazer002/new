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

WebBrowser.maybeCompleteAuthSession();
/* ================= TYPES ================= */

type User = any; // keep flexible – backend controls shape

type AuthContextType = {
  user: User | null;
  api: typeof baseApi;
  loading: boolean;
   guestId: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGoogle: (googleToken: string) => Promise<any>;
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

  const api = useMemo(() => {
    const instance = baseApi;

    // Request interceptor
    const reqId = instance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    // Response interceptor (refresh)
    const resId = instance.interceptors.response.use(
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

            return instance(originalReq);
          } catch {
            await handleLogout();
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on change
    return Object.assign(instance, {
      eject: () => {
        instance.interceptors.request.eject(reqId);
        instance.interceptors.response.eject(resId);
      },
    });
  }, [accessToken, refreshToken]);

  /* ---------- LOGOUT ---------- */

  const handleLogout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    await AsyncStorage.multiRemove([
      "ds_user",
      "ds_access",
      "ds_refresh",
    ]);
  };



const [request, response, promptAsync] = Google.useAuthRequest({
 androidClientId:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//  useProxy: true,
});

useEffect(() => {
  const handleGoogleResponse = async () => {
    if (response?.type === "success") {
      try {
        const token = response.authentication?.accessToken;

        if (!token) throw new Error("No Google token");

        const data = await loginWithGoogle(token);

        // ✅ redirect after login
        if (data?.user) {
          router.replace("/");
        }
      } catch (err) {
        console.log("Google login error", err);
      }
    }
  };

  handleGoogleResponse();
}, [response]);


  /* ---------- AUTH ACTIONS ---------- */

  const login = async (email: string, password: string) => {
    const { data } = await baseApi.post("/auth/login", { email, password });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
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

const loginWithGoogle = async (googleToken: string) => {
  try {
    const { data } = await baseApi.post("/auth/google", {
      token: googleToken,
    });

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    return data;
  } catch (err: any) {
    console.log("Google API login error", err);
    throw err;
  }
};



const promptGoogleLogin = async () => {
  try {
    if (!request) {
      throw new Error("Google request not ready");
    }
console.log("Prompting Google login...",request);
 await promptAsync();
  } catch (err) {
    console.log("Google prompt error", err);
    throw err;
  }
};

  /* ---------- PROVIDE ---------- */
  return (
    <AuthContext.Provider
      value={{
        guestId,
        user,
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
