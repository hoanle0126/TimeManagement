# Task Management Backend - Laravel Breeze API

Backend API cho ứng dụng Task Management sử dụng Laravel Breeze API với MySQL.

## Yêu cầu

- PHP >= 8.1
- Composer
- MySQL >= 5.7 hoặc MariaDB >= 10.3

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

### 4. Chạy migrations

```bash
php artisan migrate
```

**Lưu ý**: Database sẽ được tự động tạo nếu chưa tồn tại (đã được cấu hình sẵn).

### 5. Chạy server

```bash
php artisan serve
```

Server sẽ chạy tại: **http://localhost:8000**

## API Endpoints

### Authentication

#### Đăng ký
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Response:
```json
{
  "token": "1|xxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com"
  }
}
```

#### Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "1|xxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com"
  }
}
```

#### Đăng xuất
```
POST /api/auth/logout
Authorization: Bearer {token}
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

#### Lấy thông tin user
```
GET /api/auth/me
Authorization: Bearer {token}
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": null
  }
}
```

## Cấu trúc

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Auth/
│   │   │       ├── AuthenticatedSessionController.php
│   │   │       └── RegisteredUserController.php
│   │   └── Requests/
│   │       └── Auth/
│   │           └── LoginRequest.php
│   ├── Models/
│   │   └── User.php
│   └── Providers/
│       └── DatabaseServiceProvider.php
├── config/
│   ├── cors.php
│   └── sanctum.php
├── database/
│   └── migrations/
├── routes/
│   └── api.php
└── .env
```

## Công nghệ sử dụng

- **Laravel** 10.50 - PHP framework
- **Laravel Breeze** - Authentication scaffolding
- **Laravel Sanctum** - API token authentication
- **MySQL** - Database

## Tác giả

**Lê Văn Xuân Hoàn**
