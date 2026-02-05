// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api as baseApi } from "../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Named export so other files can `import { AuthContext } ...`
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 used by RootNavigator

  // 🔄 Load auth state once at startup
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
        setLoading(false); // ✅ done checking storage
      }
    })();
  }, []);

  // 🧠 Persist to AsyncStorage when changes
  useEffect(() => {
    if (user) AsyncStorage.setItem("ds_user", JSON.stringify(user));
    else AsyncStorage.removeItem("ds_user");
  }, [user]);

  useEffect(() => {
    if (accessToken) AsyncStorage.setItem("ds_access", accessToken);
    else AsyncStorage.removeItem("ds_access");
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) AsyncStorage.setItem("ds_refresh", refreshToken);
    else AsyncStorage.removeItem("ds_refresh");
  }, [refreshToken]);

  // 🧩 Memoized Axios instance with token & refresh logic
  const api = useMemo(() => {
    const instance = baseApi;

    // Clear old interceptors to avoid stacking
    instance.interceptors.request.handlers = [];
    instance.interceptors.response.handlers = [];

    instance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
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

            const { data } = await baseApi.post(`/auth/refresh`, {
              refreshToken,
            });

            setAccessToken(data.accessToken);
            originalReq.headers.Authorization = `Bearer ${data.accessToken}`;

            return instance(originalReq); // retry
          } catch (err) {
            console.warn("Token refresh failed, logging out...");
            handleLogout();
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [accessToken, refreshToken]);

  // 🚪 Logout
  const handleLogout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    await AsyncStorage.removeItem("ds_user");
    await AsyncStorage.removeItem("ds_access");
    await AsyncStorage.removeItem("ds_refresh");
    // ❌ no window.location in RN, navigation is handled in RootNavigator
  };

  // 🔐 Login
  const login = async (email, password) => {
    const { data } = await baseApi.post(`/auth/login`, { email, password });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  // 🆕 Register
  const register = async (name, email, password) => {
    const { data } = await baseApi.post(`/auth/register`, {
      name,
      email,
      password,
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  // 🔐 Google Login
  const loginWithGoogle = async (googleToken) => {
    const { data } = await baseApi.post(
      `/auth/google`,
      { token: googleToken },
      { withCredentials: true }
    );
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  const logout = handleLogout;

  const value = {
    user,
    api,
    login,
    register,
    loginWithGoogle,
    logout,
    loading, // 👈 used in RootNavigator
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// Optional helper hook
export function useAuth() {
  return useContext(AuthContext);
}
