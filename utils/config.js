// utils/config.js
import axios from 'axios';
const BASE_URL = 'http://172.31.98.31:4000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
