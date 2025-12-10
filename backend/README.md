# Task Management Backend - Laravel

Backend API cho ứng dụng Task Management sử dụng Laravel + MySQL.

## Yêu cầu

- PHP >= 8.1
- Composer
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- Node.js & NPM (cho frontend assets)

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
composer install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Cấu hình database trong `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmanagement
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Tạo database

```sql
CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Chạy migrations

```bash
php artisan migrate
```

### 6. Chạy server

```bash
php artisan serve
```

Server sẽ chạy tại: http://localhost:8000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới
  - Body: `{ name, email, password, password_confirmation }`
  - Response: `{ success: true, token, user }`

- `POST /api/auth/login` - Đăng nhập
  - Body: `{ email, password }`
  - Response: `{ success: true, token, user }`

- `POST /api/auth/logout` - Đăng xuất (cần token)
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success: true, message }`

- `GET /api/auth/me` - Lấy thông tin user hiện tại (cần token)
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success: true, user }`

## Cấu trúc

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── AuthController.php
│   │   └── Middleware/
│   ├── Models/
│   │   └── User.php
│   └── Providers/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── .env
```

## CORS Configuration

API đã được cấu hình CORS để cho phép requests từ frontend React Native.

## Lưu ý

- Token được tạo bằng Laravel Sanctum
- Password được hash bằng bcrypt
- File `.env` không được commit lên git


