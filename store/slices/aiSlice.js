import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const parseTask = createAsyncThunk(
  'ai/parseTask',
  async (text, { rejectWithValue }) => {
    console.log('[AI] parseTask called', { text, textLength: text?.length });
    try {
      console.log('[AI] Sending request to /ai/parse-task');
      const response = await api.post('/ai/parse-task', { text });
      console.log('[AI] Response received', {
        status: response.status,
        data: response.data,
        success: response.data?.success
      });
      const data = response.data;
      // Include method and warning in parsed task
      if (data.success && data.data) {
        return {
          ...data,
          data: {
            ...data.data,
            method: data.method, // 'ai' or 'rule-based'
            warning: data.warning, // Warning message if any
          }
        };
      }
      return data;
    } catch (error) {
      console.error('[AI] parseTask error', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullError: error
      });
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to parse task'
      );
    }
  }
);

export const suggestPriority = createAsyncThunk(
  'ai/suggestPriority',
  async ({ title, description, deadline }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/suggest-priority', {
        title,
        description,
        deadline,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to suggest priority'
      );
    }
  }
);

export const categorizeAndTag = createAsyncThunk(
  'ai/categorizeAndTag',
  async ({ title, description }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/categorize-tag', {
        title,
        description,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to categorize task'
      );
    }
  }
);

export const breakDownTask = createAsyncThunk(
  'ai/breakDownTask',
  async ({ title, description }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/breakdown-task', {
        title,
        description,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to break down task'
      );
    }
  }
);

const initialState = {
  parsedTask: null,
  prioritySuggestion: null,
  categorySuggestion: null,
  breakdownResult: null,
  isLoading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearParsedTask: (state) => {
      state.parsedTask = null;
    },
    clearPrioritySuggestion: (state) => {
      state.prioritySuggestion = null;
    },
    clearCategorySuggestion: (state) => {
      state.categorySuggestion = null;
    },
    clearBreakdownResult: (state) => {
      state.breakdownResult = null;
    },
    clearAll: (state) => {
      state.parsedTask = null;
      state.prioritySuggestion = null;
      state.categorySuggestion = null;
      state.breakdownResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Parse Task
    builder
      .addCase(parseTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(parseTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parsedTask = action.payload.data;
      })
      .addCase(parseTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Suggest Priority
    builder
      .addCase(suggestPriority.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(suggestPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prioritySuggestion = action.payload.data;
      })
      .addCase(suggestPriority.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Categorize and Tag
    builder
      .addCase(categorizeAndTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(categorizeAndTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categorySuggestion = action.payload.data;
      })
      .addCase(categorizeAndTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Break Down Task
    builder
      .addCase(breakDownTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(breakDownTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.breakdownResult = action.payload.data;
      })
      .addCase(breakDownTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearParsedTask,
  clearPrioritySuggestion,
  clearCategorySuggestion,
  clearBreakdownResult,
  clearAll,
} = aiSlice.actions;

export default aiSlice.reducer;

