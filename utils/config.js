// utils/config.js
import axios from 'axios';
const BASE_URL = 'http://192.168.1.13:4000'; // real device

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
