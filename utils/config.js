// utils/config.js

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.5:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {},
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("ds_access");
      const guestId = await AsyncStorage.getItem("ds_guest");

      console.log("TOKEN:", token);
      console.log("GUEST:", guestId);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (guestId) {
        config.headers["x-guest-id"] = guestId;
      }

      // FormData fix
      if (
        config.data &&
        typeof config.data === "object" &&
        config.data._parts
      ) {
        config.headers["Content-Type"] = "multipart/form-data";
      }

      return config;
    } catch (err) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

export default api;