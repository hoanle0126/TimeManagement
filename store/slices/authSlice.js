import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

// Async thunks
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return { token: null, user: null };
      }

      const response = await api.get('/auth/me');
      return {
        token,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, passwordConfirmation }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);

      return { token, user };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Đăng ký thất bại',
        errors: error.response?.data?.errors || {},
      });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Đăng nhập thất bại'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Calling logout API...');
      await api.post('/logout');
      console.log('Logout API called successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn tiếp tục logout ngay cả khi API có lỗi
    } finally {
      await AsyncStorage.removeItem('token');
      console.log('Token removed from storage');
    }
  }
);

// Initial state
const initialState = {
  token: null,
  user: null,
  isLoading: true,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loadUser
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

