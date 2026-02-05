
import Constants from "expo-constants";
import axios from "axios";
export function getApiBaseUrl() {
  // Use Expo extra config if set, otherwise default to localhost
  // Change to your LAN IP for real device testing
  return Constants.expoConfig?.extra?.API_URL || "http://192.168.1.2:4000";
}

// Create a pre-configured axios instance
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api