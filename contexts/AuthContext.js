import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext({});

// Cấu hình axios
axios.defaults.baseURL = API_URL;

// Fix cho web - đảm bảo sử dụng JSON adapter
if (typeof window !== 'undefined') {
  // Trên web, đảm bảo axios sử dụng XHR adapter thay vì Node adapter
  axios.defaults.adapter = axios.defaults.adapter || axios.getAdapter(['xhr', 'http']);
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/auth/me');
        setAuthState({
          token,
          user: response.data.user,
          isLoading: false,
        });
      } else {
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('token');
      setAuthState({
        token: null,
        user: null,
        isLoading: false,
      });
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      const response = await axios.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthState({
        token,
        user,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
        errors: error.response?.data?.errors || {},
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthState({
        token,
        user,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  };

  const logout = async () => {
    try {
      // Gọi API logout từ backend để xóa token trên server
      console.log('Calling logout API...');
      console.log('API URL:', API_URL);
      console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
      
      // Gọi API logout - có thể dùng /logout hoặc /auth/logout
      const response = await axios.post('/logout');
      console.log('Logout API response:', response.data);
    } catch (error) {
      // Nếu có lỗi (ví dụ: token đã hết hạn), vẫn tiếp tục xóa token ở client
      console.error('Logout error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      // Luôn xóa token ở client và reset state
      console.log('Clearing token from storage...');
      await AsyncStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setAuthState({
        token: null,
        user: null,
        isLoading: false,
      });
      console.log('Logout completed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        register,
        login,
        logout,
        isLoading: authState.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


