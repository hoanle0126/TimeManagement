# TaskMaster - Ứng dụng Quản lý Công việc & Giao tiếp

<div align="center">

![TaskMaster](assets/favicon.png)

**TaskMaster - Ứng dụng quản lý công việc và giao tiếp đa nền tảng**

[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0.0-000020?logo=expo)](https://expo.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-10.50-FF2D20?logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql)](https://www.mysql.com/)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Cấu trúc project](#-cấu-trúc-project)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Giới thiệu

TaskMaster là ứng dụng quản lý công việc và giao tiếp đa nền tảng, được xây dựng với React Native (Expo) cho frontend và Laravel cho backend. Ứng dụng cho phép người dùng quản lý công việc, theo dõi tiến độ, giao tiếp với bạn bè, và tổ chức công việc một cách hiệu quả.

### Đặc điểm nổi bật

- ✅ **Đa nền tảng**: Chạy trên iOS, Android và Web
- ✅ **Material Design**: Giao diện Material Design 3 với React Native Paper
- ✅ **Real-time**: Socket.IO cho tin nhắn và thông báo real-time
- ✅ **Quản lý công việc**: Tạo, chỉnh sửa, xóa tasks với nhiều tính năng
- ✅ **Giao tiếp**: Nhắn tin real-time giữa bạn bè
- ✅ **Lịch**: Xem và quản lý công việc theo lịch
- ✅ **Responsive**: Tự động điều chỉnh cho mobile, tablet, desktop

---

## ✨ Tính năng

### 📝 Quản lý Công việc

- **Tạo Task**: 
  - Task nhanh (Quick Task) với deadline và tags
  - Task chi tiết (Detailed Task) với subtasks, progress, category
  - Hỗ trợ AI để phân tích và đề xuất priority, category
- **Quản lý Task**:
  - Xem danh sách tasks với filter (tất cả, chờ xử lý, đang làm, hoàn thành)
  - Tìm kiếm tasks
  - Chỉnh sửa và xóa tasks
  - Gán tasks cho người dùng khác
- **Theo dõi tiến độ**:
  - Progress bar cho detailed tasks
  - Widget hiển thị tiến độ hoàn thành theo tuần
  - Timeline widget hiển thị tasks theo thời gian

### 💬 Giao tiếp

- **Tin nhắn Real-time**:
  - Nhắn tin với bạn bè
  - Socket.IO cho real-time messaging
  - Hiển thị trạng thái online/offline
  - Đếm tin nhắn chưa đọc
- **Quản lý bạn bè**:
  - Tìm kiếm và kết bạn
  - Gửi/nhận lời mời kết bạn
  - Xem danh sách bạn bè

### 📅 Lịch

- **Calendar Widget**:
  - Hiển thị lịch với react-native-calendars
  - Đánh dấu ngày có tasks
  - Chọn ngày để xem tasks
- **Calendar Screen**:
  - Lịch đầy đủ với sidebar
  - Mini calendar để điều hướng
  - Hiển thị events/tasks trên lịch

### 🎨 Giao diện

- **Material Design 3**: Giao diện hiện đại với React Native Paper
- **Responsive**: Tự động điều chỉnh cho mobile, tablet, desktop
- **Theme System**: Hỗ trợ Light/Dark theme
- **Widgets**: Dashboard với nhiều widget hữu ích

---

## 🛠️ Công nghệ sử dụng

### Frontend

- **React Native** 0.72.6 - Framework đa nền tảng
- **Expo** ~49.0.0 - Development platform
- **React Native Paper** 5.14.5 - Material Design component library
- **React Navigation** - Điều hướng trong app
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Native Calendars** - Calendar component
- **AsyncStorage** - Local storage

### Backend

- **Laravel** 10.50 - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **Socket.IO Server** - Real-time server (Node.js)
- **PHP** >= 8.1

---

## 💻 Yêu cầu hệ thống

### Frontend

- Node.js >= 16.x
- npm hoặc yarn
- Expo CLI

### Backend

- PHP >= 8.1
- Composer
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- Node.js (cho Socket.IO server)

---

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd TaskManagement
```

### 2. Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install
```

### 3. Cài đặt Backend

```bash
cd backend

# Cài đặt PHP dependencies
composer install

# Tạo file .env
cp .env.example .env

# Tạo APP_KEY
php artisan key:generate
```

### 4. Cài đặt Socket.IO Server

```bash
cd backend/socket-server

# Cài đặt dependencies
npm install
```

---

## ⚙️ Cấu hình

### Frontend

1. **Tạo file `.env`** trong thư mục gốc:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Backend

1. **Cấu hình database** trong `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmanagement
DB_USERNAME=root
DB_PASSWORD=your_password
```

2. **Cấu hình Socket.IO** trong `backend/.env`:

```env
SOCKET_SERVER_URL=http://localhost:3001
```

3. **Chạy migrations**:

```bash
cd backend
php artisan migrate
```

---

## 🚀 Chạy ứng dụng

### Frontend

**Chạy với Expo Go trên điện thoại thật (KHÔNG CẦN Android SDK):**

```bash
# Khởi động Expo development server
npm start

# Sau khi chạy, bạn sẽ thấy menu với các tùy chọn:
# - Quét QR code bằng Expo Go app trên điện thoại (KHÔNG CẦN Android SDK)
# - Nhấn 'w' để mở trên web browser
# - KHÔNG nhấn 'a' (sẽ cố kết nối Android emulator và cần Android SDK)
```

**Hoặc chạy trực tiếp trên platform cụ thể:**

```bash
npm run web        # Web browser
npm run start:tunnel  # Expo với tunnel mode (tốt cho Expo Go)
npm run android    # Android emulator (CẦN Android SDK - không dùng nếu chỉ dùng Expo Go)
npm run ios        # iOS simulator (chỉ macOS)
```

**Lưu ý quan trọng**: 
- **Với Expo Go (WiFi/QR code)**: Chỉ cần `npm start` và quét QR code → **KHÔNG CẦN Android SDK**
- **Với Android qua USB**: Cần Android SDK Platform Tools (nhẹ, không cần Android Studio) → Xem hướng dẫn ở phần Troubleshooting
- **Với Android emulator**: Cần Android Studio và cấu hình ANDROID_HOME
- **Với iOS simulator**: Cần macOS và Xcode
- **Web**: Cách nhanh nhất để test mà không cần cài đặt thêm

### Backend

```bash
cd backend

# Chạy Laravel development server
php artisan serve
```

Server sẽ chạy tại: **http://localhost:8000**

### Socket.IO Server

```bash
cd backend/socket-server

# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại: **http://localhost:3001**

---

## 📁 Cấu trúc project

```
TaskManagement/
├── assets/                 # Hình ảnh, icons
├── components/             # React components
│   ├── CalendarWidget.js
│   ├── CalendarSidebar.js
│   ├── DateTimePickerModal.js
│   ├── Header.js
│   ├── NotificationPopup.js
│   ├── TaskProgressWidget.js
│   ├── TodayTasksWidget.js
│   └── ...
├── contexts/              # React Context
│   ├── AuthContext.js
│   └── ThemeContext.js
├── screens/                # Các màn hình
│   ├── DashboardScreen.js
│   ├── CreateTaskScreen.js
│   ├── MyTasksScreen.js
│   ├── CalendarScreen.js
│   ├── MessagesScreen.js
│   ├── FriendsScreen.js
│   └── ...
├── store/                  # Redux store
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── tasksSlice.js
│   │   ├── messagesSlice.js
│   │   ├── friendsSlice.js
│   │   └── ...
│   └── store.js
├── services/               # Services
│   ├── api.js
│   └── socket.js
├── backend/                # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── socket-server/      # Socket.IO server
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

### Tasks

- `GET /api/tasks` - Lấy danh sách tasks (có filter, search, pagination)
- `POST /api/tasks` - Tạo task mới
- `GET /api/tasks/{id}` - Lấy chi tiết task
- `PUT /api/tasks/{id}` - Cập nhật task
- `DELETE /api/tasks/{id}` - Xóa task

### Friends

- `GET /api/friends` - Lấy danh sách bạn bè
- `GET /api/friends/search` - Tìm kiếm users
- `POST /api/friends/requests` - Gửi lời mời kết bạn
- `GET /api/friends/requests` - Lấy danh sách lời mời
- `POST /api/friends/requests/{id}/accept` - Chấp nhận lời mời
- `POST /api/friends/requests/{id}/reject` - Từ chối lời mời
- `DELETE /api/friends/{id}` - Hủy kết bạn

### Messages

- `GET /api/messages/conversations` - Lấy danh sách conversations
- `POST /api/messages/conversations` - Tạo conversation mới
- `GET /api/messages/conversations/{id}/messages` - Lấy messages
- `POST /api/messages` - Gửi tin nhắn

### Notifications

- `GET /api/notifications` - Lấy danh sách notifications
- `GET /api/notifications/unread-count` - Đếm notifications chưa đọc
- `POST /api/notifications/{id}/read` - Đánh dấu đã đọc
- `POST /api/notifications/mark-all-read` - Đánh dấu tất cả đã đọc
- `DELETE /api/notifications/{id}` - Xóa notification

### AI (Optional)

- `POST /api/ai/parse-task` - Phân tích task từ text
- `POST /api/ai/suggest-priority` - Đề xuất priority
- `POST /api/ai/categorize-tag` - Phân loại và gợi ý tags
- `POST /api/ai/breakdown-task` - Chia nhỏ task thành subtasks

---

## 🐛 Troubleshooting

### Lỗi Android SDK

Nếu gặp lỗi "Failed to resolve the Android SDK path" hoặc "'adb' is not recognized":

**⚠️ QUAN TRỌNG: Với Expo Go (WiFi/QR code), bạn KHÔNG CẦN Android SDK!**

**Nhưng nếu muốn kết nối qua USB, bạn CẦN Android SDK Platform Tools (nhẹ, không cần Android Studio).**

**Giải pháp đúng cho Expo Go:**

1. **Chạy đúng cách:**
   ```bash
   npm start
   # HOẶC
   npm run start:tunnel
   ```

2. **KHÔNG chạy:**
   ```bash
   npm run android  # ❌ Sẽ cố kết nối emulator và cần Android SDK
   ```

3. **Trong menu Expo, KHÔNG nhấn phím 'a'** (sẽ cố kết nối emulator)

4. **Chỉ quét QR code** bằng Expo Go app trên điện thoại

**Kết nối Android qua USB (thiết bị thật, không cần emulator):**

**Cách 1: Cài đặt chỉ Android SDK Platform Tools (Nhẹ, không cần Android Studio)**

1. **Tải Android SDK Platform Tools:**
   - Tải từ: https://developer.android.com/tools/releases/platform-tools
   - Giải nén vào thư mục, ví dụ: `C:\platform-tools`

2. **Cấu hình Environment Variables:**
   - Mở **System Properties** → **Environment Variables**
   - Thêm biến mới:
     - **Variable name**: `ANDROID_HOME`
     - **Variable value**: `C:\platform-tools` (hoặc đường dẫn bạn đã giải nén)
   - Thêm vào **PATH**: `%ANDROID_HOME%`
   - **Khởi động lại terminal/CMD**

3. **Bật USB Debugging trên điện thoại:**
   - Vào **Settings** → **About phone**
   - Nhấn 7 lần vào **Build number** để bật Developer options
   - Vào **Settings** → **Developer options**
   - Bật **USB debugging**
   - Kết nối điện thoại với máy tính qua USB
   - Chấp nhận "Allow USB debugging" trên điện thoại

4. **Kiểm tra kết nối:**
   ```bash
   adb devices
   ```
   Nếu thấy thiết bị hiển thị, bạn đã kết nối thành công!

5. **Chạy app:**
   ```bash
   npm run android
   ```
   Hoặc:
   ```bash
   expo start --android
   ```

**Cách 2: Cài đặt Android Studio (Nếu muốn dùng emulator)**

1. Tải và cài đặt [Android Studio](https://developer.android.com/studio)
2. Mở Android Studio → More Actions → SDK Manager
3. Cài đặt Android SDK (API level 33+)
4. Set environment variables:
   - `ANDROID_HOME`: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - Thêm vào PATH: `%ANDROID_HOME%\platform-tools` và `%ANDROID_HOME%\tools`

**Cách 2: Chạy trên Web thay vì Android**

```bash
# Chạy trên web browser thay vì Android
npm run web
```

**Cách 3: Sử dụng Expo Go trên thiết bị thật (KHÔNG CẦN Android SDK)**

1. Cài đặt Expo Go app trên điện thoại Android (từ Google Play Store)
2. Chạy `npm start` (KHÔNG chạy `npm run android`)
3. Quét QR code từ terminal bằng Expo Go app
4. **Lưu ý**: KHÔNG nhấn phím 'a' trong menu Expo (sẽ cố kết nối emulator và cần Android SDK)

**Lưu ý quan trọng khi dùng Expo Go:**

- Đảm bảo điện thoại và máy tính **cùng mạng WiFi**
- Nếu gặp lỗi "Failed to download remote update", thử các cách sau:

  **a) Dùng Tunnel Mode (Khuyến nghị - dễ nhất):**
  ```bash
  npm start
  # Sau đó nhấn 's' để switch connection type, chọn 'tunnel'
  # Hoặc chạy trực tiếp:
  npx expo start --tunnel
  ```

  **b) Dùng LAN Mode với IP thủ công:**
  ```bash
  # 1. Tìm IP của máy tính:
  # Windows: ipconfig (tìm IPv4 Address)
  # Mac/Linux: ifconfig hoặc ip addr
  
  # 2. Tạo file .env và thêm:
  REACT_APP_API_URL=http://YOUR_IP:8000/api
  # Ví dụ: REACT_APP_API_URL=http://192.168.1.100:8000/api
  
  # 3. Chạy lại:
  npm start -- --clear
  ```

  **c) Kiểm tra Firewall:**
  - Cho phép Node.js và Expo qua Windows Firewall
  - Đảm bảo port 8081 (Metro), 8000 (Laravel), 3001 (Socket.IO) không bị chặn

### Lỗi kết nối API

1. Kiểm tra backend server đang chạy (`php artisan serve`)
2. Kiểm tra `REACT_APP_API_URL` trong `.env`
3. Kiểm tra CORS configuration trong `backend/config/cors.php`

### Lỗi Socket.IO

1. Kiểm tra Socket.IO server đang chạy
2. Kiểm tra `SOCKET_SERVER_URL` trong `backend/.env`
3. Kiểm tra firewall/port 3001

### Lỗi database

1. Kiểm tra MySQL đang chạy
2. Kiểm tra thông tin database trong `backend/.env`
3. Chạy lại migrations: `php artisan migrate:fresh`

### Lỗi Metro bundler

```bash
# Xóa cache và khởi động lại
npm start -- --clear
```

### Lỗi "Failed to download remote update" trên Expo Go

**Nguyên nhân:** Expo Go không thể tải bundle từ Metro bundler

**Giải pháp:**

1. **Dùng Tunnel Mode (Dễ nhất):**
   ```bash
   npx expo start --tunnel
   ```
   Tunnel mode sẽ tạo kết nối qua internet, không cần cùng mạng WiFi.

2. **Kiểm tra kết nối mạng:**
   - Đảm bảo điện thoại và máy tính cùng mạng WiFi
   - Tắt VPN nếu đang bật
   - Kiểm tra firewall không chặn port 8081

3. **Xóa cache và thử lại:**
   ```bash
   npm start -- --clear
   ```

4. **Cập nhật Expo Go app:**
   - Đảm bảo Expo Go app đã được cập nhật lên phiên bản mới nhất

5. **Kiểm tra IP và cấu hình:**
   - Nếu dùng LAN mode, cần cấu hình IP trong file `.env`
   - Xem hướng dẫn ở phần "Cách 3: Sử dụng Expo Go" ở trên

### Kiểm tra cấu hình Android USB

Sau khi cài đặt Android SDK Platform Tools, kiểm tra cấu hình:

```bash
npm run check-android
```

Script này sẽ:
- Kiểm tra xem `adb` đã được cài đặt chưa
- Kiểm tra thiết bị Android đã kết nối qua USB chưa
- Hướng dẫn cài đặt nếu chưa có

---

## 📚 Tài liệu tham khảo

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Laravel Documentation](https://laravel.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Made with ❤️**

⭐ Star this repo if you find it useful!

</div>
