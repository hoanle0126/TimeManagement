# Hướng dẫn Setup Backend Laravel

## Yêu cầu

- PHP >= 8.1
- Composer
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- Node.js & NPM (cho frontend assets - tùy chọn)

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

Mở file `.env` và cập nhật thông tin database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmanagement
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Tạo database

Đăng nhập vào MySQL và tạo database:

```sql
CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Hoặc sử dụng command line:

```bash
mysql -u root -p -e "CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Chạy migrations

```bash
php artisan migrate
```

Lệnh này sẽ tạo các bảng:
- `users` - Bảng người dùng
- `personal_access_tokens` - Bảng lưu token cho Laravel Sanctum

### 6. Chạy server

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
  "success": true,
  "message": "User registered successfully",
  "token": "1|xxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": null
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
  "success": true,
  "message": "Login successful",
  "token": "1|xxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": null
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
  "success": true,
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
  "success": true,
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": null
  }
}
```

## Cấu hình CORS

API đã được cấu hình CORS để cho phép requests từ frontend React Native. Cấu hình trong `config/cors.php`.

## Troubleshooting

### Lỗi: "SQLSTATE[HY000] [2002] Connection refused"

- Kiểm tra MySQL đang chạy
- Kiểm tra `DB_HOST` và `DB_PORT` trong `.env`
- Kiểm tra username và password

### Lỗi: "SQLSTATE[42000] [1049] Unknown database"

- Tạo database trước khi chạy migrations
- Kiểm tra tên database trong `.env`

### Lỗi: "Class 'Laravel\Sanctum\Sanctum' not found"

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Lỗi CORS khi gọi API từ frontend

- Kiểm tra `config/cors.php`
- Đảm bảo frontend đang gọi đúng URL (http://localhost:8000/api)

## Lưu ý

- Token được tạo bằng Laravel Sanctum
- Password được hash bằng bcrypt
- File `.env` không được commit lên git
- Trong production, nên sử dụng HTTPS và cấu hình CORS phù hợp


