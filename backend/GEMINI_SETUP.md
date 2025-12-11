# Gemini AI Setup Guide

## 1. Lấy API Key từ Google AI Studio

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google account
3. Click "Create API Key"
4. Copy API key

## 2. Thêm vào .env

Thêm dòng sau vào file `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

## 3. Kiểm tra

Chạy lệnh sau để test:

```bash
php artisan tinker
```

```php
$service = app(\App\Services\GeminiAIService::class);
$result = $service->parseTask("Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai, ưu tiên cao");
dd($result);
```

## 4. Model Names

**Lưu ý quan trọng:** Model names có thể thay đổi theo thời gian. Nếu gặp lỗi 404, thử các model sau:

- `gemini-1.5-flash` (recommended - nhanh và miễn phí)
- `gemini-1.5-pro` (mạnh hơn nhưng chậm hơn)
- `gemini-pro` (legacy, có thể không còn hỗ trợ)

**API Version:**
- `v1beta` - Recommended cho các model mới
- `v1` - Stable version

## 5. API Endpoints

### Parse Task
```
POST /api/ai/parse-task
Body: { "text": "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai" }
```

### Suggest Priority
```
POST /api/ai/suggest-priority
Body: {
  "title": "Hoàn thành báo cáo",
  "description": "Báo cáo cuối tháng",
  "deadline": "2024-01-20T17:00:00Z"
}
```

### Categorize & Tag
```
POST /api/ai/categorize-tag
Body: {
  "title": "Review code PR #123",
  "description": "Review authentication feature"
}
```

### Break Down Task
```
POST /api/ai/breakdown-task
Body: {
  "title": "Hoàn thành website e-commerce",
  "description": "Xây dựng website bán hàng online"
}
```

## Lưu ý

- API key cần được bảo mật, không commit vào git
- Free tier của Gemini có giới hạn requests
- Nếu API key không hoạt động, sẽ fallback về rule-based logic

