# Thông tin đăng nhập Users được Seeder

## Test Users (Có thông tin cụ thể)

Các users này được tạo với email và password cụ thể để dễ test:

| Email | Password | Name |
|-------|----------|------|
| admin@example.com | password123 | Admin User |
| user1@example.com | password123 | Test User 1 |
| user2@example.com | password123 | Test User 2 |
| user3@example.com | password123 | Test User 3 |
| user4@example.com | password123 | Test User 4 |

## Random Users (45 users)

Các users còn lại được tạo ngẫu nhiên với:
- **Password mặc định**: `password`
- **Email**: Ngẫu nhiên (ví dụ: user123@example.com)
- **Name**: Ngẫu nhiên

## Lưu ý

- Tất cả passwords đã được hash bằng bcrypt
- Password mặc định cho random users là: **`password`**
- Password cho test users là: **`password123`**

## Cách xem danh sách users

Sau khi chạy seeder, thông tin users sẽ được in ra console. Hoặc bạn có thể:

1. **Xem trong database:**
```bash
php artisan tinker
>>> User::all(['id', 'name', 'email']);
```

2. **Export ra file:**
```bash
php artisan tinker
>>> User::all(['id', 'name', 'email'])->toJson(JSON_PRETTY_PRINT);
```

## Test Login

Bạn có thể test login với bất kỳ user nào:

**Test Users:**
- Email: `admin@example.com`
- Password: `password123`

**Random Users:**
- Email: (bất kỳ email nào từ database)
- Password: `password`

