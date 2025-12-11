# 🤖 Hướng Dẫn Tích Hợp AI Features

## 📋 Tổng Quan

Đã tích hợp các tính năng AI sử dụng Google Gemini API vào ứng dụng FLOW Task Management.

## ✅ Các Tính Năng Đã Tích Hợp

### 1. Natural Language Task Creation ⭐⭐⭐⭐⭐
- **Mô tả**: Tạo task bằng cách nói hoặc nhập câu tự nhiên
- **Cách sử dụng**: 
  - Click button "🤖 Tạo bằng AI" trong CreateTaskScreen
  - Nhập hoặc nói mô tả task (ví dụ: "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai, ưu tiên cao")
  - AI sẽ tự động phân tích và điền các trường: title, description, priority, deadline, category, tags

### 2. Smart Task Prioritization ⭐⭐⭐⭐
- **Mô tả**: Tự động đề xuất mức độ ưu tiên
- **Cách hoạt động**: 
  - Khi nhập title > 10 ký tự, AI tự động phân tích và đề xuất priority
  - Hiển thị badge "AI: Cao/TB/Thấp" bên cạnh title field
  - Click vào badge để xem lý do và áp dụng

### 3. Auto-Categorization & Tagging ⭐⭐⭐⭐
- **Mô tả**: Tự động phân loại và đề xuất tags
- **Cách hoạt động**:
  - Khi nhập title > 10 ký tự, AI tự động đề xuất category và tags
  - Hiển thị badge "AI: [Category]" bên cạnh category field
  - Hiển thị badge "AI: X tags" bên cạnh tags field
  - Click vào badge để áp dụng

### 4. Smart Task Breakdown ⭐⭐⭐
- **Mô tả**: Tự động chia task lớn thành subtasks
- **Cách sử dụng**:
  - Trong detailed mode, nhập title và description
  - Click button "AI Chia nhỏ" trong phần Subtasks
  - AI sẽ tự động tạo danh sách subtasks

## 🛠️ Setup

### 1. Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google account
3. Click "Create API Key"
4. Copy API key

### 2. Cấu Hình Backend

Thêm vào file `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Kiểm Tra

Chạy backend và test API:

```bash
cd backend
php artisan serve
```

Test endpoint:
```bash
curl -X POST http://localhost:8000/api/ai/parse-task \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai, ưu tiên cao"}'
```

## 📁 Cấu Trúc Files

### Backend:
- `backend/app/Services/GeminiAIService.php` - Service class để gọi Gemini API
- `backend/app/Http/Controllers/AIController.php` - Controller xử lý AI requests
- `backend/config/services.php` - Config cho Gemini API key
- `backend/routes/api.php` - Routes cho AI endpoints

### Frontend:
- `store/slices/aiSlice.js` - Redux slice cho AI state
- `components/AIAssistant.js` - Component modal cho NL task creation
- `screens/CreateTaskScreen.js` - Tích hợp AI features vào form tạo task

## 🔌 API Endpoints

### Parse Task
```
POST /api/ai/parse-task
Body: { "text": "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai" }
Response: {
  "success": true,
  "data": {
    "title": "Gọi điện cho khách hàng ABC",
    "priority": "high",
    "deadline": "2024-01-15T15:00:00Z",
    "category": "Customer Service",
    "tags": ["customer", "call"]
  },
  "confidence": 0.9
}
```

### Suggest Priority
```
POST /api/ai/suggest-priority
Body: {
  "title": "Hoàn thành báo cáo",
  "description": "Báo cáo cuối tháng",
  "deadline": "2024-01-20T17:00:00Z"
}
Response: {
  "success": true,
  "data": {
    "priority": "high",
    "reason": "Deadline gần và task phức tạp",
    "confidence": 0.85
  }
}
```

### Categorize & Tag
```
POST /api/ai/categorize-tag
Body: {
  "title": "Review code PR #123",
  "description": "Review authentication feature"
}
Response: {
  "success": true,
  "data": {
    "category": "Công việc",
    "tags": ["code-review", "pr", "authentication"],
    "confidence": 0.9
  }
}
```

### Break Down Task
```
POST /api/ai/breakdown-task
Body: {
  "title": "Hoàn thành website e-commerce",
  "description": "Xây dựng website bán hàng online"
}
Response: {
  "success": true,
  "data": {
    "subtasks": [
      {
        "title": "Thiết kế UI/UX",
        "description": "Thiết kế giao diện",
        "estimated_hours": 24
      },
      ...
    ]
  }
}
```

## 🎨 UI Features

### CreateTaskScreen:
1. **AI Assistant Button**: Button "🤖 Tạo bằng AI" ở mode selector
2. **Priority Suggestion Badge**: Badge hiển thị đề xuất priority bên cạnh title
3. **Category Suggestion Badge**: Badge hiển thị đề xuất category
4. **Tags Suggestion Badge**: Badge hiển thị số lượng tags đề xuất
5. **AI Breakdown Button**: Button "AI Chia nhỏ" trong phần subtasks

## 🔄 Flow Hoạt Động

### Natural Language Task Creation:
1. User click "🤖 Tạo bằng AI"
2. Modal AIAssistant hiển thị
3. User nhập/nói mô tả task
4. Click "Phân tích"
5. AI parse và trả về structured data
6. Form tự động điền các trường
7. User có thể chỉnh sửa trước khi lưu

### Auto-Suggestions:
1. User nhập title > 10 ký tự
2. Sau 1 giây: AI suggest priority
3. Sau 1.5 giây: AI suggest category & tags
4. Badges hiển thị suggestions
5. User click để áp dụng hoặc bỏ qua

### Task Breakdown:
1. User nhập title và description trong detailed mode
2. Click "AI Chia nhỏ"
3. AI phân tích và tạo subtasks
4. Subtasks được thêm vào form
5. User có thể chỉnh sửa subtasks

## ⚠️ Lưu Ý

1. **API Key**: Cần có Gemini API key hợp lệ
2. **Fallback**: Nếu API fail, sẽ fallback về rule-based logic
3. **Rate Limiting**: Gemini có giới hạn requests, cần handle errors
4. **Cost**: Free tier có giới hạn, monitor usage
5. **Privacy**: Task data được gửi đến Gemini API, cần thông báo user

## 🐛 Troubleshooting

### API không hoạt động:
1. Kiểm tra GEMINI_API_KEY trong .env
2. Kiểm tra internet connection
3. Kiểm tra logs: `storage/logs/laravel.log`

### Suggestions không hiển thị:
1. Kiểm tra Redux state: `state.ai`
2. Kiểm tra console logs
3. Đảm bảo title > 10 ký tự

### Parse task không chính xác:
1. Thử lại với câu rõ ràng hơn
2. Kiểm tra response từ API
3. Có thể cần fine-tune prompts

## 📚 Tài Liệu Tham Khảo

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Gemini API Key Setup](https://makersuite.google.com/app/apikey)
- [AI_FEATURES_PROPOSAL.md](./AI_FEATURES_PROPOSAL.md) - Chi tiết đề xuất tính năng

## 🚀 Next Steps

1. ✅ Natural Language Task Creation
2. ✅ Smart Task Prioritization
3. ✅ Auto-Categorization & Tagging
4. ✅ Smart Task Breakdown
5. ⏳ Intelligent Deadline Prediction (Phase 2)
6. ⏳ Intelligent Scheduling Assistant (Phase 2)
7. ⏳ Productivity Insights (Phase 2)
8. ⏳ Smart Search (Phase 3)

---

**Version**: 1.0  
**Last Updated**: 2024-01-15





