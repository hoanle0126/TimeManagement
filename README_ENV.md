# Cấu hình Biến Môi Trường

## Tổng quan

Backend API URL đã được chuyển sang sử dụng biến môi trường để bảo mật và linh hoạt hơn.

## Cách cấu hình

### 1. Tạo file `.env`

Tạo file `.env` trong thư mục gốc của project (cùng cấp với `package.json`):

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Cấu hình API URL

Mở file `.env` và thay đổi URL backend của bạn:

```env
# Development
REACT_APP_API_URL=http://localhost:8000/api

# Production (thay đổi theo server của bạn)
REACT_APP_API_URL=https://your-api-domain.com/api
```

### 3. Khởi động lại ứng dụng

Sau khi thay đổi file `.env`, bạn cần khởi động lại ứng dụng:

```bash
npm start
```

## Lưu ý

- ✅ File `.env` đã được thêm vào `.gitignore` để không commit lên git
- ✅ File `.env.example` chứa template mẫu (có thể commit)
- ✅ Nếu không có file `.env`, ứng dụng sẽ sử dụng giá trị mặc định:
  - Development: `http://localhost:8000/api`
  - Production: `https://your-production-api.com/api`

## Kiểm tra cấu hình

Để kiểm tra API URL đang được sử dụng, bạn có thể:

1. Mở DevTools Console
2. Import và log config:
   ```javascript
   import { API_URL } from './config';
   console.log('API URL:', API_URL);
   ```

## Troubleshooting

### Biến môi trường không hoạt động

1. Đảm bảo file `.env` nằm ở thư mục gốc (cùng cấp với `package.json`)
2. Đảm bảo tên biến bắt đầu với `REACT_APP_`
3. Khởi động lại ứng dụng sau khi thay đổi `.env`
4. Xóa cache và khởi động lại:
   ```bash
   npm start -- --clear
   ```

