import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[fetchTasks] Starting fetch with params:', params);
      const response = await api.get('/tasks', { params });
      console.log('[fetchTasks] Response received:', {
        status: response.status,
        data: response.data,
        tasks: response.data?.tasks,
        isArray: Array.isArray(response.data?.tasks),
      });
      const tasks = response.data?.tasks || response.data || [];
      console.log('[fetchTasks] Returning tasks:', tasks);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('[fetchTasks] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(error.response?.data || 'Failed to fetch tasks');
    }
  }
);

export const fetchTodayTasks = createAsyncThunk(
  'tasks/fetchTodayTasks',
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('[fetchTodayTasks] Starting fetch for date:', today);
      const response = await api.get('/tasks', {
        params: {
          due_date: today,
        },
      });
      console.log('[fetchTodayTasks] Response received:', {
        status: response.status,
        data: response.data,
        tasks: response.data?.tasks,
        isArray: Array.isArray(response.data?.tasks),
        tasksLength: response.data?.tasks?.length,
      });
      // Handle paginated response or direct array
      const tasks = response.data?.tasks || response.data || [];
      // Ensure it's an array
      const result = Array.isArray(tasks) ? tasks : [];
      console.log('[fetchTodayTasks] Returning tasks:', result);
      return result;
    } catch (error) {
      console.error('[fetchTodayTasks] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      return rejectWithValue(error.response?.data || 'Failed to fetch today tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data.task || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data.task || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete task');
    }
  }
);

// Initial state
const initialState = {
  tasks: [],
  todayTasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
};

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('[fetchTasks.fulfilled] Payload:', action.payload);
        // Handle both array response and object with tasks property
        const tasks = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.tasks || []);
        console.log('[fetchTasks.fulfilled] Setting tasks:', tasks);
        state.tasks = Array.isArray(tasks) ? tasks : [];
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        console.error('[fetchTasks.rejected] Error:', action.payload);
        state.error = action.payload;
      });

    // fetchTodayTasks
    builder
      .addCase(fetchTodayTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('[fetchTodayTasks.fulfilled] Payload:', action.payload);
        // Ensure payload is an array
        const tasks = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.tasks || []);
        console.log('[fetchTodayTasks.fulfilled] Setting todayTasks:', tasks);
        state.todayTasks = Array.isArray(tasks) ? tasks : [];
        state.error = null;
      })
      .addCase(fetchTodayTasks.rejected, (state, action) => {
        state.isLoading = false;
        console.error('[fetchTodayTasks.rejected] Error:', action.payload);
        state.error = action.payload;
      });

    // fetchTask
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        // Add to todayTasks if due_date is today
        const today = new Date().toISOString().split('T')[0];
        if (action.payload.due_date && action.payload.due_date.startsWith(today)) {
          state.todayTasks.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // updateTask
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload;
        // Update in tasks array
        const taskIndex = state.tasks.findIndex((t) => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
        // Update in todayTasks array
        const todayTaskIndex = state.todayTasks.findIndex((t) => t.id === updatedTask.id);
        if (todayTaskIndex !== -1) {
          state.todayTasks[todayTaskIndex] = updatedTask;
        }
        // Update currentTask if it's the same task
        if (state.currentTask && state.currentTask.id === updatedTask.id) {
          state.currentTask = updatedTask;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // deleteTask
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskId = action.payload;
        // Remove from tasks array
        state.tasks = state.tasks.filter((t) => t.id !== taskId);
        // Remove from todayTasks array
        state.todayTasks = state.todayTasks.filter((t) => t.id !== taskId);
        // Clear currentTask if it's the deleted task
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;


