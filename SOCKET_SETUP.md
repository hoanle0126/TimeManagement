# Hướng dẫn Setup Socket.io cho TaskManagement

## Tổng quan

Hệ thống sử dụng Socket.io để kết nối real-time giữa Laravel backend và React Native frontend.

## Cấu trúc

```
backend/
  socket-server/          # Node.js Socket.io server
    server.js            # Server chính
    package.json         # Dependencies
    README.md            # Hướng dẫn chi tiết

  app/Http/Controllers/
    SocketController.php # Controller để Laravel gửi events

services/
  socket.js             # Socket service cho React Native
```

## Bước 1: Cài đặt Socket.io Server

1. Vào thư mục socket-server:
```bash
cd backend/socket-server
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy server:
```bash
# Development (với auto-reload)
npm run dev

# Production
npm start
```

Server sẽ chạy trên `http://localhost:3001`

## Bước 2: Cấu hình Laravel

1. Thêm vào file `.env` của Laravel:
```env
SOCKET_SERVER_URL=http://localhost:3001
```

2. Route đã được thêm vào `routes/api.php`:
```php
Route::post('/socket/broadcast', [SocketController::class, 'broadcast'])
    ->middleware('auth:sanctum');
```

## Bước 3: Cài đặt Socket.io Client cho React Native

1. Cài đặt package:
```bash
npm install socket.io-client
```

2. Import và sử dụng trong app:
```javascript
import socketService from './services/socket';
```

## Bước 4: Sử dụng trong React Native

### Kết nối Socket

```javascript
import socketService from '../services/socket';
import { useAppSelector } from '../store/hooks';

// Trong component hoặc khi user đăng nhập
const { user } = useAppSelector((state) => state.auth);

useEffect(() => {
  if (user) {
    socketService.connect(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return () => {
    socketService.disconnect();
  };
}, [user]);
```

### Lắng nghe Task Updates

```javascript
useEffect(() => {
  const taskId = 1; // Task ID cần lắng nghe
  
  socketService.onTaskUpdate(taskId, (data) => {
    console.log('Task updated:', data);
    // Cập nhật state hoặc refresh data
    dispatch(fetchTask(taskId));
  });

  return () => {
    socketService.offTaskUpdate(taskId);
  };
}, [taskId]);
```

### Lắng nghe Notifications

```javascript
useEffect(() => {
  socketService.onNotification((data) => {
    console.log('New notification:', data);
    // Hiển thị notification
    Alert.alert(data.title, data.message);
  });

  return () => {
    socketService.offNotification();
  };
}, []);
```

## Bước 5: Broadcast Events từ Laravel

### Trong TaskController

```php
use App\Http\Controllers\SocketController;

class TaskController extends Controller
{
    protected $socketController;

    public function __construct()
    {
        $this->socketController = new SocketController();
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->all());

        // Broadcast update đến clients
        $this->socketController->broadcastTaskUpdate($id, $task->toArray());

        return response()->json($task);
    }
}
```

## Testing

### Test Socket Server

1. Mở browser console và chạy:
```javascript
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected:', socket.id));
socket.emit('user:login', { userId: 1, userData: { name: 'Test' } });
socket.on('user:logged-in', (data) => console.log('Logged in:', data));
```

### Test từ Laravel

```php
$socketController = new SocketController();
$socketController->broadcast(new Request([
    'event' => 'test:event',
    'data' => ['message' => 'Hello from Laravel'],
]));
```

## Troubleshooting

### Socket không kết nối được

1. Kiểm tra Socket server đang chạy:
```bash
curl http://localhost:3001/socket/health
```

2. Kiểm tra CORS settings trong `server.js`

3. Kiểm tra firewall/port 3001 đã mở chưa

### Events không được nhận

1. Kiểm tra user đã đăng nhập vào socket chưa (`user:login`)
2. Kiểm tra đã join room chưa (`join:room`)
3. Kiểm tra event name có đúng không

## Production

1. Thay đổi `SOCKET_URL` trong `services/socket.js` thành production URL
2. Cấu hình CORS trong `server.js` để chỉ cho phép domain của bạn
3. Sử dụng HTTPS/WSS cho production
4. Cân nhắc sử dụng Redis adapter cho scaling

