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

/* ================= TYPES ================= */

type User = any; // keep flexible – backend controls shape

type AuthContextType = {
  user: User | null;
  api: typeof baseApi;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGoogle: (googleToken: string) => Promise<any>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD STORED AUTH ---------- */

  useEffect(() => {
    (async () => {
      try {
        const rawUser = await AsyncStorage.getItem("ds_user");
        const at = await AsyncStorage.getItem("ds_access");
        const rt = await AsyncStorage.getItem("ds_refresh");

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
    const { data } = await baseApi.post("/auth/google", {
      token: googleToken,
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  /* ---------- PROVIDE ---------- */

  return (
    <AuthContext.Provider
      value={{
        user,
        api,
        loading,
        login,
        register,
        loginWithGoogle,
        logout: handleLogout,
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
