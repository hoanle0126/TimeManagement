# FLOW - Ứng dụng Quản lý Công việc

<div align="center">

![FLOW - Master Your Moments](assets/favicon.png)

**FLOW - Ứng dụng quản lý công việc đa nền tảng với React Native Paper và Laravel**

[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0.0-000020?logo=expo)](https://expo.dev/)
[![React Native Paper](https://img.shields.io/badge/React%20Native%20Paper-5.x-6200EE?logo=material-design)](https://callstack.github.io/react-native-paper/)
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
- [Theme System](#-theme-system)
- [Cấu trúc project](#-cấu-trúc-project)
- [API Endpoints](#-api-endpoints)
- [Tác giả](#-tác-giả)
- [License](#-license)

---

## 🎯 Giới thiệu

FLOW là ứng dụng quản lý công việc đa nền tảng được xây dựng với React Native (Expo) và React Native Paper cho frontend, Laravel cho backend. Ứng dụng cho phép người dùng quản lý công việc, theo dõi tiến độ, và tổ chức công việc một cách hiệu quả với giao diện Material Design hiện đại.

### Đặc điểm nổi bật

- ✅ **Đa nền tảng**: Chạy trên iOS, Android và Web
- ✅ **Material Design**: Sử dụng React Native Paper với Material Design 3
- ✅ **Theme System**: Hỗ trợ Light/Dark theme với khả năng tùy biến hoàn toàn
- ✅ **Responsive Design**: Tự động điều chỉnh giao diện theo kích thước màn hình
- ✅ **Xác thực người dùng**: Đăng ký, đăng nhập, đăng xuất với Laravel Sanctum
- ✅ **Quản lý công việc**: Tạo, chỉnh sửa, xóa và theo dõi công việc
- ✅ **Giao diện hiện đại**: UI/UX được thiết kế đẹp mắt và dễ sử dụng

---

## ✨ Tính năng

### Frontend (React Native)

- 🏠 **Dashboard**: Trang chủ với các widget hiển thị công việc, tiến độ
- 📝 **Tạo công việc**: Form tạo công việc với ngày bắt đầu, hết hạn, độ ưu tiên
- 📅 **Lịch**: Xem công việc theo lịch
- 👥 **Bạn bè**: Quản lý danh sách bạn bè
- 💬 **Tin nhắn**: Gửi và nhận tin nhắn
- 👤 **Quản lý người dùng**: Đăng ký, đăng nhập, đăng xuất
- 🎨 **Responsive**: Tự động điều chỉnh cho mobile, tablet, desktop
- 🌓 **Theme System**: Hỗ trợ Light/Dark theme với khả năng tùy biến
- 🎨 **Material Design**: Giao diện Material Design 3 với React Native Paper

### Backend (Laravel)

- 🔐 **Authentication API**: Đăng ký, đăng nhập, đăng xuất
- 🔑 **Laravel Sanctum**: Xác thực API với token
- 📊 **Database**: MySQL với migrations tự động
- 🛡️ **CORS**: Cấu hình CORS cho React Native
- 📝 **RESTful API**: API chuẩn REST

---

## 🛠️ Công nghệ sử dụng

### Frontend

- **React Native** 0.72.6 - Framework đa nền tảng
- **Expo** ~49.0.0 - Development platform
- **React Native Paper** 5.x - Material Design component library
- **React Navigation** - Điều hướng trong app
- **Axios** - HTTP client cho API calls
- **AsyncStorage** - Lưu trữ local (token, user data)
- **DateTimePicker** - Chọn ngày/giờ
- **React Native Vector Icons** - Icon library

### Backend

- **Laravel** 10.50 - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **PHP** >= 8.1

---

## 💻 Yêu cầu hệ thống

### Frontend

- Node.js >= 16.x
- npm hoặc yarn
- Expo CLI (tự động cài với npm install)

### Backend

- PHP >= 8.1
- Composer
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- Extension PHP: pdo_mysql, mbstring, openssl, json

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

# Hoặc sử dụng yarn
yarn install
```

### 3. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
composer install

# Tạo file .env
cp .env.example .env

# Tạo APP_KEY
php artisan key:generate
```

---

## ⚙️ Cấu hình

### Frontend

1. **Tạo file `.env`** trong thư mục gốc:

```bash
cp .env.example .env
```

2. **Cấu hình API URL** trong file `.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

**Lưu ý**: 
- Development: `http://localhost:8000/api`
- Production: Thay đổi theo server của bạn
- File `.env` đã được thêm vào `.gitignore` để bảo mật

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

2. **Tạo database và chạy migrations**:

```bash
cd backend

# Database sẽ được tự động tạo khi chạy migrate
php artisan migrate
```

**Lưu ý**: Laravel sẽ tự động tạo database nếu chưa tồn tại (đã được cấu hình sẵn).

---

## 🚀 Chạy ứng dụng

### Frontend

```bash
# Khởi động Expo development server
npm start

# Hoặc chạy trên platform cụ thể
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser
```

Sau khi chạy `npm start`, bạn có thể:
- Nhấn `w` để mở trên web
- Nhấn `a` để mở trên Android emulator
- Nhấn `i` để mở trên iOS simulator
- Quét QR code để mở trên thiết bị thật (Expo Go app)

### Backend

```bash
cd backend

# Chạy Laravel development server
php artisan serve
```

Server sẽ chạy tại: **http://localhost:8000**

---

## 🎨 Theme System

FLOW sử dụng React Native Paper với hệ thống theme tùy biến hoàn toàn. Tất cả components và screens đều sử dụng theme colors thay vì hardcode values.

### Cấu trúc Theme

Theme được định nghĩa trong `contexts/ThemeContext.js` với các tính năng:

- **Light Theme**: Theme sáng mặc định
- **Dark Theme**: Theme tối (tự động theo system preference)
- **Custom Colors**: Primary, Secondary, Success, Warning, Error, Info
- **Custom Fonts**: Typography system với Material Design 3
- **Roundness**: Border radius tùy biến

### Sử dụng Theme

```javascript
import { useTheme } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.primary }}>
      <Text style={{ color: theme.colors.onPrimary }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Tùy biến Theme

Để tùy biến theme, chỉnh sửa file `contexts/ThemeContext.js`:

```javascript
const lightColors = {
  primary: '#4CAF50',      // Màu chính
  secondary: '#FF9800',    // Màu phụ
  success: '#4CAF50',      // Màu thành công
  warning: '#FF9800',      // Màu cảnh báo
  error: '#FF3B30',        // Màu lỗi
  // ... các màu khác
};
```

### Toggle Theme

Theme tự động chuyển đổi giữa Light và Dark dựa trên system preference. Bạn có thể thêm nút toggle theme trong settings:

```javascript
import { useTheme } from '../contexts/ThemeContext';

function SettingsScreen() {
  const { toggleTheme, isDark } = useTheme();
  
  return (
    <Button onPress={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
}
```

### Components sử dụng Theme

Tất cả components đã được refactor để sử dụng theme:
- ✅ Header
- ✅ UserMenuPopup
- ✅ TodayTasksWidget
- ✅ TaskProgressWidget
- ✅ CalendarWidget
- ✅ TaskTimelineWidget
- ✅ DateTimePickerModal
- ✅ Tất cả Screens

---

## 📁 Cấu trúc project

```
TaskManagement/
├── assets/                 # Hình ảnh, icons, favicon
├── components/             # React Native Paper components
│   ├── CalendarWidget.js
│   ├── DateTimePickerModal.js
│   ├── Header.js
│   ├── TaskProgressWidget.js
│   ├── TaskTimelineWidget.js
│   ├── TodayTasksWidget.js
│   └── UserMenuPopup.js
├── contexts/               # React Context
│   ├── AuthContext.js     # Authentication context
│   └── ThemeContext.js     # Theme context với React Native Paper
├── screens/                # Các màn hình của app
│   ├── DashboardScreen.js
│   ├── CreateTaskScreen.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── CalendarScreen.js
│   ├── MessagesScreen.js
│   ├── FriendsScreen.js
│   ├── MyTasksScreen.js
│   └── TaskDetailScreen.js
├── backend/                # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── AuthController.php
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   │   └── User.php
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   └── ...
├── App.js                  # Entry point với ThemeProvider
├── config.js               # App configuration
├── metro.config.js         # Metro bundler config
├── babel.config.js         # Babel config
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

#### Đăng ký
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

#### Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "password"
}

Response:
{
  "token": "sanctum_token_here",
  "user": {
    "id": 1,
    "name": "Tên người dùng",
    "email": "email@example.com"
  }
}
```

#### Đăng xuất
```
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Lấy thông tin user hiện tại
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": 1,
    "name": "Tên người dùng",
    "email": "email@example.com",
    "avatar": null
  }
}
```

---

## 🐛 Troubleshooting

### Lỗi "Unable to resolve FormData"

Nếu gặp lỗi này khi chạy trên web:

```bash
# Xóa cache và khởi động lại
npm start -- --clear
```

### Lỗi kết nối database

1. Kiểm tra MySQL đang chạy
2. Kiểm tra thông tin database trong `backend/.env`
3. Đảm bảo user MySQL có quyền CREATE DATABASE

### Lỗi CORS

Backend đã được cấu hình CORS để cho phép requests từ frontend. Nếu vẫn gặp lỗi, kiểm tra file `backend/config/cors.php`.

### Lỗi Theme không hoạt động

1. Đảm bảo `ThemeProvider` đã được wrap trong `App.js`
2. Kiểm tra `PaperProvider` đã được import và sử dụng
3. Đảm bảo tất cả components sử dụng `useTheme()` hook

---

## 📚 Tài liệu tham khảo

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [Material Design 3](https://m3.material.io/)
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

---

## 👤 Tác giả

**Lê Văn Xuân Hoàn**

- Email: [your-email@example.com]
- GitHub: [@yourusername]

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Lời cảm ơn

Cảm ơn các thư viện và framework mã nguồn mở đã giúp xây dựng project này:
- React Native team
- Expo team
- React Native Paper team (Callstack)
- Material Design team
- Laravel team
- Tất cả các contributors của các packages được sử dụng

---

<div align="center">

**Made with ❤️ by Lê Văn Xuân Hoàn**

⭐ Star this repo nếu bạn thấy hữu ích!

</div>
