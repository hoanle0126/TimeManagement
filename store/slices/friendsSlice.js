import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const searchUsers = createAsyncThunk(
  'friends/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/friends/search', {
        params: { query },
      });
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tìm kiếm users'
      );
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async (friendId, { rejectWithValue }) => {
    try {
      // Đảm bảo friendId là số nguyên
      const friendIdInt = typeof friendId === 'string' ? parseInt(friendId, 10) : friendId;
      
      if (isNaN(friendIdInt)) {
        return rejectWithValue('ID bạn bè không hợp lệ');
      }

      const response = await api.post('/friends/requests', {
        friend_id: friendIdInt,
      });
      return response.data;
    } catch (error) {
      // Xử lý lỗi validation từ backend
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        const errorMessage = errors?.friend_id?.[0] || error.response?.data?.message || 'Dữ liệu không hợp lệ';
        return rejectWithValue(errorMessage);
      }
      
      // Xử lý lỗi 400 (Bad Request)
      if (error.response?.status === 400) {
        return rejectWithValue(
          error.response?.data?.message || 'Không thể gửi lời mời kết bạn'
        );
      }

      return rejectWithValue(
        error.response?.data?.message || 'Không thể gửi lời mời kết bạn'
      );
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/friends/requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể chấp nhận lời mời'
      );
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/friends/requests/${requestId}/reject`);
      return { requestId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể từ chối lời mời'
      );
    }
  }
);

export const getFriends = createAsyncThunk(
  'friends/getFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/friends');
      return response.data.friends;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách bạn bè'
      );
    }
  }
);

export const getFriendRequests = createAsyncThunk(
  'friends/getFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/friends/requests');
      return response.data.requests;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách lời mời'
      );
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  'friends/cancelRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await api.delete(`/friends/requests/${requestId}`);
      return { requestId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể hủy lời mời'
      );
    }
  }
);

export const unfriend = createAsyncThunk(
  'friends/unfriend',
  async (friendId, { rejectWithValue }) => {
    try {
      await api.delete(`/friends/${friendId}`);
      return { friendId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể hủy kết bạn'
      );
    }
  }
);

// Initial state
const initialState = {
  friends: [],
  friendRequests: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null,
};

// Friends slice
const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    addFriendRequest: (state, action) => {
      // Thêm friend request mới (từ socket notification)
      const existing = state.friendRequests.find(
        req => req.id === action.payload.id
      );
      if (!existing) {
        state.friendRequests.unshift(action.payload);
      }
    },
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        req => req.id !== action.payload
      );
    },
    addFriend: (state, action) => {
      // Thêm bạn bè mới (từ socket notification khi accept)
      const existing = state.friends.find(f => f.id === action.payload.id);
      if (!existing) {
        state.friends.push(action.payload);
      }
    },
    refreshFriends: (state) => {
      // Flag để trigger refresh friends list
      // Component sẽ gọi getFriends() khi thấy flag này
    },
  },
  extraReducers: (builder) => {
    // searchUsers
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });

    // sendFriendRequest
    builder
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Xóa user khỏi search results vì đã gửi lời mời
        state.searchResults = state.searchResults.filter(
          user => user.id !== action.payload.friendship.friend_id
        );
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // acceptFriendRequest
    builder
      .addCase(acceptFriendRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Xóa khỏi friend requests và thêm vào friends
        const request = state.friendRequests.find(
          req => req.id === action.payload.friendship.id
        );
        if (request) {
          state.friendRequests = state.friendRequests.filter(
            req => req.id !== request.id
          );
          // Kiểm tra xem đã có trong friends chưa
          const existingFriend = state.friends.find(f => f.id === request.user.id);
          if (!existingFriend) {
            state.friends.push(request.user);
          }
        }
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // rejectFriendRequest
    builder
      .addCase(rejectFriendRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friendRequests = state.friendRequests.filter(
          req => req.id !== action.payload.requestId
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // getFriends
    builder
      .addCase(getFriends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friends = action.payload;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // getFriendRequests
    builder
      .addCase(getFriendRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFriendRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friendRequests = action.payload;
      })
      .addCase(getFriendRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // cancelFriendRequest
    builder
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.friendRequests = state.friendRequests.filter(
          req => req.id !== action.payload.requestId
        );
      });

    // unfriend
    builder
      .addCase(unfriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          friend => friend.id !== action.payload.friendId
        );
      });
  },
});

export const { clearSearchResults, clearError, addFriendRequest, removeFriendRequest, addFriend, refreshFriends } = friendsSlice.actions;
export default friendsSlice.reducer;

