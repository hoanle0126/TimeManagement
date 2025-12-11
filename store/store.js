import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import friendsReducer from './slices/friendsSlice';
import notificationsReducer from './slices/notificationsSlice';
import aiReducer from './slices/aiSlice';
import messagesReducer from './slices/messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    friends: friendsReducer,
    notifications: notificationsReducer,
    ai: aiReducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// TypeScript types (nếu sử dụng TypeScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

