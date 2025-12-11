# Hướng dẫn Test Socket.io cho TaskManagement

## Bước 1: Khởi động Socket Server

### Terminal 1 - Chạy Socket Server
```bash
cd backend/socket-server
npm install  # Nếu chưa cài
npm run dev  # hoặc npm start
```

Bạn sẽ thấy:
```
Socket.io server running on port 3001
```

### Kiểm tra Server đang chạy
Mở browser và truy cập: `http://localhost:3001/socket/health`

Hoặc dùng curl:
```bash
curl http://localhost:3001/socket/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "connectedUsers": 0,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Bước 2: Test Socket Server với Browser Console

### Mở Browser Console (Chrome/Firefox DevTools)

1. Mở trang web bất kỳ (ví dụ: `http://localhost:19006` - Expo web)
2. Nhấn F12 để mở DevTools
3. Vào tab Console
4. Chạy các lệnh sau:

```javascript
// Kết nối đến Socket server
const socket = io('http://localhost:3001');

// Lắng nghe sự kiện connect
socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
});

// Đăng nhập user
socket.emit('user:login', {
  userId: 1,
  userData: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  }
});

// Lắng nghe xác nhận đăng nhập
socket.on('user:logged-in', (data) => {
  console.log('✅ User logged in:', data);
});

// Tham gia room
socket.emit('join:room', 'task:1');
socket.on('room:joined', (data) => {
  console.log('✅ Joined room:', data);
});

// Lắng nghe task updates
socket.on('task:updated', (data) => {
  console.log('📢 Task updated:', data);
});

// Lắng nghe notifications
socket.on('notification:received', (data) => {
  console.log('🔔 Notification:', data);
});

// Test ping/pong
socket.emit('ping');
socket.on('pong', () => {
  console.log('🏓 Pong received');
});
```

---

## Bước 3: Test Broadcast từ Laravel

### Terminal 2 - Chạy Laravel Server
```bash
cd backend
php artisan serve
```

### Test bằng cURL

#### Test 1: Broadcast đến tất cả clients
```bash
curl -X POST http://localhost:3001/socket/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test:event",
    "data": {
      "message": "Hello from Laravel!",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }'
```

Trong Browser Console, bạn sẽ thấy event `test:event` được nhận.

#### Test 2: Broadcast đến room cụ thể
```bash
curl -X POST http://localhost:3001/socket/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "event": "task:updated",
    "data": {
      "taskId": 1,
      "title": "Updated Task",
      "progress": 75
    },
    "room": "task:1"
  }'
```

Trong Browser Console (sau khi đã join room `task:1`), bạn sẽ thấy event `task:updated`.

#### Test 3: Gửi notification đến user cụ thể
```bash
curl -X POST http://localhost:3001/socket/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "event": "notification:received",
    "data": {
      "title": "New Task",
      "message": "You have a new task assigned",
      "type": "info"
    },
    "userId": 1
  }'
```

---

## Bước 4: Test trong React Native App

### 4.1. Cài đặt dependencies
```bash
npm install socket.io-client
```

### 4.2. Tạo Test Component

Tạo file `screens/SocketTestScreen.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import socketService from '../services/socket';
import { useAppSelector } from '../store/hooks';

export default function SocketTestScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    if (user) {
      // Kết nối socket
      socketService.connect(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
      }).then(() => {
        addLog('Connecting to socket server...', 'info');
      }).catch((error) => {
        addLog(`Connection error: ${error.message}`, 'error');
      });

      // Lắng nghe connection status
      const checkConnection = setInterval(() => {
        const status = socketService.getConnectionStatus();
        setIsConnected(status.connected);
        if (status.connected) {
          addLog(`Connected! Socket ID: ${status.socketId}`, 'success');
        }
      }, 1000);

      // Lắng nghe events
      socketService.on('user:logged-in', (data) => {
        addLog(`User logged in: ${JSON.stringify(data)}`, 'success');
      });

      socketService.on('task:updated', (data) => {
        addLog(`Task updated: ${JSON.stringify(data)}`, 'info');
        Alert.alert('Task Updated', `Task ${data.taskId || data.id} has been updated`);
      });

      socketService.on('notification:received', (data) => {
        addLog(`Notification: ${JSON.stringify(data)}`, 'info');
        Alert.alert(data.title || 'Notification', data.message || JSON.stringify(data));
      });

      socketService.on('notification:broadcast', (data) => {
        addLog(`Broadcast notification: ${JSON.stringify(data)}`, 'info');
      });

      return () => {
        clearInterval(checkConnection);
        socketService.disconnect();
      };
    }
  }, [user]);

  const handleJoinRoom = () => {
    socketService.joinRoom('task:1');
    addLog('Joining room: task:1', 'info');
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom('task:1');
    addLog('Leaving room: task:1', 'info');
  };

  const handleTestEmit = () => {
    socketService.emit('test:event', { message: 'Test from React Native' });
    addLog('Emitted test:event', 'info');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          Socket.io Test
        </Text>

        {/* Connection Status */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isConnected ? '#4CAF50' : '#F44336',
              }} />
              <Text>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Test Buttons */}
        <View style={{ gap: 12, marginBottom: 16 }}>
          <Button
            mode="contained"
            onPress={handleJoinRoom}
            disabled={!isConnected}
          >
            Join Room (task:1)
          </Button>
          <Button
            mode="outlined"
            onPress={handleLeaveRoom}
            disabled={!isConnected}
          >
            Leave Room (task:1)
          </Button>
          <Button
            mode="outlined"
            onPress={handleTestEmit}
            disabled={!isConnected}
          >
            Test Emit Event
          </Button>
        </View>

        {/* Logs */}
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Logs
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {logs.map((log, index) => (
                <View
                  key={index}
                  style={{
                    padding: 8,
                    marginBottom: 4,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>
                    [{log.timestamp}]
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: log.type === 'error' ? '#F44336' :
                             log.type === 'success' ? '#4CAF50' :
                             theme.colors.onSurface,
                    }}
                  >
                    {log.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}
```

### 4.3. Thêm Route cho Test Screen

Trong file navigation (ví dụ `App.js` hoặc navigation config):

```javascript
import SocketTestScreen from './screens/SocketTestScreen';

// Thêm vào Stack Navigator
<Stack.Screen name="SocketTest" component={SocketTestScreen} />
```

### 4.4. Test trong App

1. Chạy app: `npm start`
2. Đăng nhập vào app
3. Navigate đến SocketTest screen
4. Quan sát logs và connection status
5. Thử các buttons để test

---

## Bước 5: Test Tích hợp với Laravel

### 5.1. Tạo Test Route trong Laravel

Thêm vào `backend/routes/api.php`:

```php
// Test route (chỉ dùng trong development)
if (app()->environment('local')) {
    Route::post('/test/socket-broadcast', function (Request $request) {
        $socketController = new \App\Http\Controllers\SocketController();
        return $socketController->broadcast($request);
    })->middleware('auth:sanctum');
}
```

### 5.2. Test từ Postman hoặc cURL

#### Test với Authentication Token

1. Đăng nhập và lấy token:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

2. Sử dụng token để broadcast:
```bash
curl -X POST http://localhost:8000/api/test/socket-broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "event": "task:updated",
    "data": {
      "taskId": 1,
      "title": "Test Task",
      "progress": 50
    },
    "room": "task:1"
  }'
```

### 5.3. Test trong TaskController

Thêm vào `TaskController::update()`:

```php
public function update(Request $request, $id)
{
    $task = Task::findOrFail($id);
    $task->update($request->all());

    // Broadcast update
    try {
        $this->broadcastTaskUpdate($id, $task->toArray());
    } catch (\Exception $e) {
        \Log::error('Socket broadcast failed: ' . $e->getMessage());
    }

    return response()->json($task);
}
```

Sau đó test bằng cách update một task và xem có nhận được event không.

---

## Bước 6: Test Scenarios

### Scenario 1: Real-time Task Update
1. Mở 2 clients (browser console + React Native app)
2. Cả 2 đều join room `task:1`
3. Từ Laravel, broadcast task update
4. Cả 2 clients đều nhận được event

### Scenario 2: Notification
1. User A đăng nhập vào socket
2. Từ Laravel, gửi notification đến User A
3. User A nhận được notification

### Scenario 3: Reconnection
1. Kết nối socket
2. Tắt socket server
3. Bật lại socket server
4. Socket tự động reconnect

---

## Troubleshooting

### Socket không kết nối được

1. **Kiểm tra Socket Server đang chạy:**
```bash
curl http://localhost:3001/socket/health
```

2. **Kiểm tra CORS:**
   - Mở `backend/socket-server/server.js`
   - Đảm bảo CORS cho phép origin của bạn

3. **Kiểm tra Firewall:**
   - Port 3001 phải được mở

4. **Kiểm tra URL:**
   - Trong `services/socket.js`, đảm bảo `SOCKET_URL` đúng

### Events không được nhận

1. **Kiểm tra đã join room chưa:**
```javascript
socketService.joinRoom('task:1');
```

2. **Kiểm tra event name:**
   - Event name phải khớp giữa emit và on

3. **Kiểm tra console logs:**
   - Xem có lỗi gì không

### Laravel không broadcast được

1. **Kiểm tra SOCKET_SERVER_URL trong .env:**
```env
SOCKET_SERVER_URL=http://localhost:3001
```

2. **Kiểm tra Socket Server đang chạy**

3. **Kiểm tra logs:**
```bash
tail -f backend/storage/logs/laravel.log
```

---

## Checklist Test

- [ ] Socket server khởi động thành công
- [ ] Health check endpoint hoạt động
- [ ] Browser console có thể kết nối
- [ ] User login event hoạt động
- [ ] Join/leave room hoạt động
- [ ] Broadcast từ cURL hoạt động
- [ ] React Native app kết nối được
- [ ] Task update events được nhận
- [ ] Notification events được nhận
- [ ] Reconnection hoạt động
- [ ] Laravel có thể broadcast events

---

## Tips

1. **Sử dụng Browser Console để debug:**
   - Dễ dàng test và xem logs
   - Không cần build app

2. **Sử dụng Network tab:**
   - Xem WebSocket connection
   - Xem messages được gửi/nhận

3. **Enable verbose logging:**
   - Thêm `console.log` vào `server.js` để debug

4. **Test từng phần:**
   - Test connection trước
   - Sau đó test events
   - Cuối cùng test tích hợp

