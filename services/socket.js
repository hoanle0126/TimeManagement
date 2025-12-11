import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket server URL - có thể config trong .env
const SOCKET_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://your-socket-server.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Kết nối đến Socket.io server
   */
  async connect(userId, userData) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        auth: {
          token: token,
        },
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Đăng nhập user
        if (userId && userData) {
          this.socket.emit('user:login', { userId, userData });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });

      this.socket.on('user:logged-in', (data) => {
        console.log('User logged in to socket:', data);
      });

      // Ping/Pong để kiểm tra kết nối
      setInterval(() => {
        if (this.socket?.connected) {
          this.socket.emit('ping');
        }
      }, 30000); // Ping mỗi 30 giây

    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  /**
   * Ngắt kết nối
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Tham gia room
   */
  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('join:room', room);
    }
  }

  /**
   * Rời room
   */
  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('leave:room', room);
    }
  }

  /**
   * Lắng nghe event
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);
    
    // Lưu listener để có thể remove sau
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Bỏ lắng nghe event
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  /**
   * Gửi event
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  /**
   * Lắng nghe task updates
   */
  onTaskUpdate(taskId, callback) {
    // Tham gia room của task
    this.joinRoom(`task:${taskId}`);
    
    // Lắng nghe event
    this.on('task:updated', (data) => {
      if (data.taskId === taskId || data.id === taskId) {
        callback(data);
      }
    });
  }

  /**
   * Bỏ lắng nghe task updates
   */
  offTaskUpdate(taskId, callback) {
    this.leaveRoom(`task:${taskId}`);
    this.off('task:updated', callback);
  }

  /**
   * Lắng nghe notifications
   */
  onNotification(callback) {
    this.on('notification:received', callback);
    this.on('notification:broadcast', callback);
  }

  /**
   * Bỏ lắng nghe notifications
   */
  offNotification(callback) {
    this.off('notification:received', callback);
    this.off('notification:broadcast', callback);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

