import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fix cho web - đảm bảo sử dụng JSON adapter
if (typeof window !== 'undefined') {
  api.defaults.adapter = api.defaults.adapter || axios.getAdapter(['xhr', 'http']);
}

// Request interceptor để thêm token vào header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token không hợp lệ, xóa token và redirect về login
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;

