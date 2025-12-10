# Gemini API Free Tier Models - Verified Information

## ✅ Free Tier Models (2024)

Dựa trên tài liệu chính thức của Google Gemini API, các model sau đây **MIỄN PHÍ** trong free tier:

### 1. **gemini-pro** ⭐ Recommended
- **Rate Limits:**
  - 60 requests per minute
  - 1,500 requests per day
- **Status:** Stable, widely available
- **Best for:** General tasks, reliable

### 2. **gemini-1.5-flash** ⭐ Fastest
- **Rate Limits:**
  - 15 requests per minute
  - 1,500 requests per day
- **Status:** Faster response time
- **Best for:** Quick responses, lower latency

## ❌ Premium Models (NOT FREE - Require Paid Plan)

- `gemini-2.5-pro` - Premium only
- `gemini-1.5-pro` - Premium only
- `gemini-ultra` - Premium only
- `gemini-pro-vision` - Premium only

## 📊 Free Tier Limits Summary

| Model | Requests/Min | Requests/Day | Input Tokens | Output Tokens |
|-------|-------------|--------------|--------------|---------------|
| gemini-pro | 60 | 1,500 | Limited | Limited |
| gemini-1.5-flash | 15 | 1,500 | Limited | Limited |

## 🔧 Current Implementation

Code đã được cấu hình để:
1. ✅ Chỉ sử dụng `gemini-pro` và `gemini-1.5-flash`
2. ✅ Tự động skip premium models
3. ✅ Fallback giữa các free tier models nếu một model fail
4. ✅ Xử lý quota exceeded (429) properly

## 📚 References

- Official Pricing: https://ai.google.dev/pricing
- Rate Limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Models Overview: https://ai.google.dev/gemini-api/docs/models
- Usage Dashboard: https://ai.dev/usage?tab=rate-limit

## ⚠️ Important Notes

1. **Quota Reset:** Free tier quotas reset daily/monthly depending on the metric
2. **Rate Limiting:** If you hit rate limits, wait a few minutes before retrying
3. **Model Selection:** Code automatically selects the best available free tier model
4. **Fallback:** If one model fails, automatically tries the other

## 🐛 Troubleshooting

### Error: "Quota exceeded"
- **Solution:** Wait for quota reset or check usage dashboard
- **Alternative:** Code will try other free tier models automatically

### Error: "Model not found"
- **Solution:** Code automatically detects and uses available models
- **Check:** Logs will show which model was selected

### Error: "429 Too Many Requests"
- **Solution:** Code automatically retries with different free tier model
- **Wait time:** Usually resets within minutes

---

**Last Updated:** 2024-01-15  
**Status:** ✅ Configured for free tier only


