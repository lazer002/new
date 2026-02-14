// utils/config.js
import axios from 'axios';
const BASE_URL = 'http://192.168.1.4:4000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
