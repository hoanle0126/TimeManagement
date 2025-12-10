import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách thông báo'
      );
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy số lượng thông báo chưa đọc'
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu đã đọc'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/mark-all-read');
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa thông báo'
      );
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Thêm notification mới (từ socket)
      const existing = state.notifications.find(
        n => n.id === action.payload.id
      );
      if (!existing) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // getNotifications
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // getUnreadCount
    builder
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // markAsRead
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          n => n.id === action.payload.id
        );
        if (notification && !notification.read) {
          notification.read = true;
          notification.read_at = action.payload.read_at;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // markAllAsRead
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.read = true;
          n.read_at = new Date().toISOString();
        });
        state.unreadCount = 0;
      });

    // deleteNotification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          n => n.id === action.payload
        );
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          n => n.id !== action.payload
        );
      });
  },
});

export const { addNotification, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;

