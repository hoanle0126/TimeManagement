const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*', // Trong production nên giới hạn origin
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Lưu trữ các kết nối user
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User đăng nhập và lưu thông tin
  socket.on('user:login', (data) => {
    const { userId, userData } = data;
    connectedUsers.set(socket.id, { userId, userData, socketId: socket.id });
    socket.userId = userId;
    console.log(`User ${userId} logged in with socket ${socket.id}`);
    
    // Gửi xác nhận
    socket.emit('user:logged-in', { success: true, socketId: socket.id });
  });

  // User tham gia room (ví dụ: task updates, notifications)
  socket.on('join:room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
    socket.emit('room:joined', { room });
  });

  // User rời room
  socket.on('leave:room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
    socket.emit('room:left', { room });
  });

  // Lắng nghe task updates từ Laravel (sẽ được gửi qua HTTP API)
  socket.on('task:update', (data) => {
    console.log('Task update received:', data);
    // Broadcast đến tất cả clients trong room của task
    if (data.taskId) {
      io.to(`task:${data.taskId}`).emit('task:updated', data);
    }
  });

  // Lắng nghe notification
  socket.on('notification:send', (data) => {
    console.log('Notification received:', data);
    // Gửi đến user cụ thể hoặc broadcast
    if (data.userId) {
      const userSocket = Array.from(connectedUsers.values())
        .find(u => u.userId === data.userId);
      if (userSocket) {
        io.to(userSocket.socketId).emit('notification:received', data);
      }
    } else {
      io.emit('notification:broadcast', data);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.id);
      console.log(`User ${socket.userId} disconnected`);
    }
  });

  // Ping/Pong để kiểm tra kết nối
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// API endpoint để Laravel gửi events đến Socket.io
app.use(express.json());
app.post('/socket/broadcast', (req, res) => {
  const { event, data, room, userId } = req.body;
  
  if (room) {
    // Broadcast đến room cụ thể
    io.to(room).emit(event, data);
  } else if (userId) {
    // Gửi đến user cụ thể
    const userSocket = Array.from(connectedUsers.values())
      .find(u => u.userId === userId);
    if (userSocket) {
      io.to(userSocket.socketId).emit(event, data);
    }
  } else {
    // Broadcast đến tất cả
    io.emit(event, data);
  }
  
  res.json({ success: true, message: 'Event broadcasted' });
});

// Health check
app.get('/socket/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

