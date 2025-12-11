# 🔍 AI Debug Guide - Troubleshooting 500 Error

## Nguyên nhân phổ biến của lỗi 500:

### 1. **GEMINI_API_KEY chưa được cấu hình**

**Kiểm tra:**
```bash
# Kiểm tra trong .env
cat backend/.env | grep GEMINI_API_KEY
```

**Sửa:**
1. Lấy API key từ: https://makersuite.google.com/app/apikey
2. Thêm vào `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

3. Clear config cache:
```bash
cd backend
php artisan config:clear
```

### 2. **API Key không hợp lệ**

**Kiểm tra:**
- API key phải bắt đầu với `AIza...`
- Không có khoảng trắng hoặc ký tự đặc biệt
- API key chưa bị revoke

**Test API key:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'
```

### 3. **Xem chi tiết lỗi trong logs**

```bash
# Xem logs mới nhất
tail -f backend/storage/logs/laravel.log

# Hoặc trên Windows PowerShell
Get-Content backend\storage\logs\laravel.log -Tail 50 -Wait
```

### 4. **Test API endpoint trực tiếp**

```bash
# Test với curl (thay YOUR_TOKEN bằng token thực)
curl -X POST http://localhost:8000/api/ai/parse-task \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai"}'
```

### 5. **Kiểm tra network/firewall**

- Đảm bảo server có thể kết nối internet
- Không bị firewall chặn
- Có thể ping được `generativelanguage.googleapis.com`

### 6. **Enable Debug Mode**

Trong `backend/.env`:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Sau đó xem response chi tiết trong browser console hoặc logs.

## Các lỗi thường gặp:

### Error: "Gemini API key is not configured"
**Giải pháp:** Thêm `GEMINI_API_KEY` vào `.env` và chạy `php artisan config:clear`

### Error: "HTTP 400: Bad Request"
**Nguyên nhân:** API key không hợp lệ hoặc request format sai
**Giải pháp:** Kiểm tra API key và format request

### Error: "HTTP 403: Forbidden"
**Nguyên nhân:** API key không có quyền hoặc bị giới hạn
**Giải pháp:** Kiểm tra API key permissions trong Google Cloud Console

### Error: "Connection error"
**Nguyên nhân:** Không thể kết nối đến Gemini API
**Giải pháp:** Kiểm tra internet connection và firewall

### Error: "Empty response from Gemini API"
**Nguyên nhân:** API trả về response nhưng không có content
**Giải pháp:** Kiểm tra logs để xem response chi tiết

## Quick Fix Checklist:

- [ ] `GEMINI_API_KEY` đã được thêm vào `.env`
- [ ] Đã chạy `php artisan config:clear`
- [ ] API key hợp lệ (test với curl)
- [ ] Server có internet connection
- [ ] Đã check logs để xem lỗi chi tiết
- [ ] `APP_DEBUG=true` để xem error details

## Test Script:

Tạo file `backend/test-gemini.php`:

```php
<?php

require __DIR__ . '/vendor/autoload.php';

$apiKey = getenv('GEMINI_API_KEY') ?: 'YOUR_API_KEY_HERE';

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}";

$response = file_get_contents($url, false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode([
            'contents' => [
                [
                    'parts' => [
                        ['text' => 'Hello, test']
                    ]
                ]
            ]
        ])
    ]
]));

echo "Response: " . $response . "\n";
```

Chạy:
```bash
cd backend
php test-gemini.php
```

---

**Nếu vẫn gặp lỗi, hãy:**
1. Copy toàn bộ error message từ logs
2. Copy response từ API test
3. Kiểm tra version của Laravel và PHP
4. Đảm bảo đã cài đặt đầy đủ dependencies





