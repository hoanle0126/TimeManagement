# Socket.io Server cho TaskManagement

Server Socket.io để kết nối Laravel backend với React Native frontend.

## Cài đặt

1. Cài đặt dependencies:
```bash
cd backend/socket-server
npm install
```

2. Tạo file `.env` trong thư mục `backend/socket-server` (hoặc sử dụng biến môi trường):
```env
SOCKET_PORT=3001
NODE_ENV=development
```

## Chạy Server

### Development (với nodemon - auto reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server sẽ chạy trên port 3001 (hoặc port được cấu hình trong `.env`).

## Cấu hình Laravel

Thêm vào file `.env` của Laravel:
```env
SOCKET_SERVER_URL=http://localhost:3001
```

## API Endpoints

### Health Check
```
GET /socket/health
```
Trả về trạng thái server và số lượng users đang kết nối.

### Broadcast Event (từ Laravel)
```
POST /socket/broadcast
Content-Type: application/json

{
  "event": "task:updated",
  "data": {
    "taskId": 1,
    "title": "Updated task",
    ...
  },
  "room": "task:1",  // optional
  "userId": 123      // optional
}
```

## Socket Events

### Client → Server

- `user:login` - User đăng nhập
  ```js
  socket.emit('user:login', { userId: 1, userData: {...} });
  ```

- `join:room` - Tham gia room
  ```js
  socket.emit('join:room', 'task:1');
  ```

- `leave:room` - Rời room
  ```js
  socket.emit('leave:room', 'task:1');
  ```

- `ping` - Kiểm tra kết nối

### Server → Client

- `user:logged-in` - Xác nhận đăng nhập thành công
- `room:joined` - Xác nhận đã tham gia room
- `room:left` - Xác nhận đã rời room
- `task:updated` - Task đã được cập nhật
- `notification:received` - Nhận notification
- `notification:broadcast` - Notification broadcast
- `pong` - Response cho ping

## Ví dụ sử dụng trong Laravel

```php
use App\Http\Controllers\SocketController;

$socketController = new SocketController();

// Broadcast task update
$socketController->broadcastTaskUpdate($taskId, $task->toArray());

// Send notification to user
$socketController->sendNotification($userId, [
    'title' => 'New notification',
    'message' => 'You have a new task',
]);
```

## Ví dụ sử dụng trong React Native

Xem file `services/socket.js` để biết cách sử dụng.

```javascript
import socketService from '../services/socket';

// Kết nối
await socketService.connect(userId, userData);

// Lắng nghe task updates
socketService.onTaskUpdate(taskId, (data) => {
  console.log('Task updated:', data);
});

// Lắng nghe notifications
socketService.onNotification((data) => {
  console.log('Notification:', data);
});
```

