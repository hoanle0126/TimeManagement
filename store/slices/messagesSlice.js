import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data.conversations || response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách cuộc trò chuyện'
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      return {
        conversationId,
        messages: response.data.messages || response.data || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy tin nhắn'
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, message, recipientId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', {
        conversation_id: conversationId,
        recipient_id: recipientId,
        message: message,
      });
      return response.data.message || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể gửi tin nhắn'
      );
    }
  }
);

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages/conversations', {
        recipient_id: recipientId,
      });
      return response.data.conversation || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tạo cuộc trò chuyện'
      );
    }
  }
);

// Initial state
const initialState = {
  conversations: [],
  messages: {}, // { conversationId: [messages] }
  currentConversation: null,
  isLoading: false,
  isSending: false,
  error: null,
};

// Messages slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Kiểm tra xem message đã tồn tại chưa (tránh duplicate)
      const exists = state.messages[conversationId].find(m => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    updateConversation: (state, action) => {
      const updatedConv = action.payload;
      const index = state.conversations.findIndex(c => c.id === updatedConv.id);
      if (index !== -1) {
        state.conversations[index] = updatedConv;
      } else {
        state.conversations.unshift(updatedConv);
      }
    },
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.unread = false;
        conv.unread_count = 0;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchConversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // fetchMessages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // sendMessage
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const message = action.payload;
        const conversationId = message.conversation_id || state.currentConversation;
        
        // Thêm message vào danh sách
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        const exists = state.messages[conversationId].find(m => m.id === message.id);
        if (!exists) {
          state.messages[conversationId].push(message);
        }
        
        // Cập nhật conversation với last message
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          conv.last_message = message.message || message.text;
          conv.last_message_at = message.created_at;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      });

    // createConversation
    builder
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.find(c => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  addMessage,
  updateConversation,
  markConversationAsRead,
} = messagesSlice.actions;
export default messagesSlice.reducer;

