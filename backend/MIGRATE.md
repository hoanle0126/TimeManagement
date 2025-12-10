# Hướng dẫn Migrate Database

## Tổng quan

Backend Laravel cần chạy migrations để tạo các bảng trong database MySQL. Có 2 migrations cần chạy:

1. **`users`** - Bảng lưu thông tin người dùng (đăng ký, đăng nhập)
2. **`personal_access_tokens`** - Bảng lưu token cho Laravel Sanctum (xác thực API)

## Các bước thực hiện

### Bước 1: Tạo database MySQL

Đăng nhập vào MySQL và tạo database:

```sql
CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Hoặc sử dụng command line:

```bash
# Windows (nếu MySQL đã được thêm vào PATH)
mysql -u root -p -e "CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Hoặc đăng nhập MySQL và chạy lệnh CREATE DATABASE
mysql -u root -p
```

### Bước 2: Cấu hình file .env

1. Tạo file `.env` từ template:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

2. Mở file `.env` và cập nhật thông tin database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmanagement
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

**Lưu ý:** Thay `your_password_here` bằng mật khẩu MySQL của bạn. Nếu không có mật khẩu, để trống: `DB_PASSWORD=`

3. Tạo APP_KEY (nếu chưa có):

```bash
php artisan key:generate
```

### Bước 3: Chạy migrations

```bash
php artisan migrate
```

Lệnh này sẽ:
- Tạo bảng `users` với các cột: id, name, email, password, avatar, timestamps
- Tạo bảng `personal_access_tokens` cho Laravel Sanctum
- Tạo bảng `migrations` để theo dõi các migrations đã chạy

### Bước 4: Kiểm tra kết quả

Sau khi migrate thành công, bạn có thể kiểm tra:

```bash
# Xem danh sách migrations đã chạy
php artisan migrate:status

# Hoặc đăng nhập MySQL và kiểm tra
mysql -u root -p taskmanagement
SHOW TABLES;
```

## Troubleshooting

### Lỗi: "Access denied for user"

- Kiểm tra lại `DB_USERNAME` và `DB_PASSWORD` trong file `.env`
- Đảm bảo MySQL đang chạy
- Kiểm tra quyền truy cập của user MySQL

### Lỗi: "Unknown database 'taskmanagement'"

- Đảm bảo đã tạo database trước khi chạy migrate
- Kiểm tra tên database trong file `.env` có đúng không

### Lỗi: "Table already exists"

- Nếu bảng đã tồn tại, bạn có thể:
  - Xóa database và tạo lại: `DROP DATABASE taskmanagement; CREATE DATABASE taskmanagement;`
  - Hoặc rollback và migrate lại: `php artisan migrate:rollback && php artisan migrate`

### Reset database (xóa tất cả và tạo lại)

```bash
php artisan migrate:fresh
```

**Cảnh báo:** Lệnh này sẽ xóa TẤT CẢ dữ liệu trong database!

## Sau khi migrate thành công

Bạn có thể chạy server:

```bash
php artisan serve
```

Server sẽ chạy tại: **http://localhost:8000**

API endpoints sẽ sẵn sàng:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

