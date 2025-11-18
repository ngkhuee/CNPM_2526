# Mobile App Configuration Guide

## API Configuration Update

### Vấn đề đã fix:
✅ IP address hardcoded `192.168.0.127:4000` ở 8+ files → **Centralized config**
✅ Không có `.env` file → **Created `.env.example`**  
✅ `app.json` thiếu bundle ID → **Added `android.package` và `ios.bundleIdentifier`**

---

## Cách sử dụng

### 1. Development (Local Backend)

**File:** `src/config/api.config.js` (mặc định)

```javascript
// Default config (khi EXPO_PUBLIC_ENV = 'development')
const API_BASE_URL = 'http://192.168.0.127:4000';
```

**Để thay đổi IP** (nếu backend chạy trên máy khác):
- Edit `src/config/api.config.js` → dòng 14
- Thay `192.168.0.127` bằng IP máy backend của bạn

Hoặc dùng `.env`:
```env
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=http://YOUR_ACTUAL_IP:4000
```

### 2. Build cho Production

**app.json**: Đã config đủ
```json
{
  "android": {
    "package": "com.yummy.app"
  },
  "ios": {
    "bundleIdentifier": "com.yummy.app"
  },
  "owner": "ngkhuee"
}
```

---

## Files đã thay đổi

### Config & Environment
- ✅ Created: `src/config/api.config.js` - Centralized API config
- ✅ Created: `.env.example` - Environment template
- ✅ Updated: `app.json` - Added bundle IDs & owner

### Services Updated
- ✅ `src/services/apiClient.js` - Now uses centralized config
- ✅ `src/services/profileService.js` - Uses config
- ✅ `src/services/orderService.js` - Uses config
- ✅ `src/shared/imageHelper.js` - Uses config

### Screens Updated
- ✅ `src/screens/home/HomeScreen.jsx` - Uses config
- ✅ `src/screens/search/SearchResultsScreen.jsx` - Uses config
- ✅ `src/screens/restaurant/RestaurantDetail.jsx` - Uses imageHelper
- ✅ `src/screens/restaurant/FoodDetailScreen.jsx` - Uses imageHelper

### Components Updated
- ✅ `src/screens/home/components/RestaurantCard.jsx` - Uses imageHelper
- ✅ `src/screens/home/components/FoodCard.jsx` - Uses imageHelper
- ✅ `src/screens/home/components/NearbyRestaurantCard.jsx` - Uses imageHelper
- ✅ `src/screens/restaurant/components/RestaurantFoodCard.jsx` - Uses imageHelper

---

## Backend Config

**Backend URL**: `http://localhost:4000` (hoặc IP của máy backend)
**Database**: `mock-backend/db.json`
**Server**: `node mock-backend/server.js`

---

## Test Backend Connection

Trước khi build, test xem mobile có kết nối được backend không:

```bash
# Terminal 1: Start backend
cd mock-backend
npm start
# Server should be on http://localhost:4000

# Terminal 2: Start mobile app
cd apps/customer/mobile
npm start
# Press 'a' để test trên Android (emulator/physical device)
# Press 'i' để test trên iOS (simulator/physical device)
```

Check logs ở React Native debugger → nếu có request tới API thì ổn.

---

## Environment Variables

Bạn có thể custom URL cho từng environment:

```bash
# .env
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.0.127:4000

# Hoặc
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.yummy.com
```

---

## Build Instructions

### Android APK
```bash
cd apps/customer/mobile
eas build --platform android --local
```

### iOS IPA
```bash
cd apps/customer/mobile
eas build --platform ios --local
```

**Note**: Cần cài Xcode/Android SDK trước.

---

## Troubleshooting

### ❌ Error: Cannot connect to API
→ Check IP address ở `src/config/api.config.js`
→ Verify backend is running trên port 4000
→ Check firewall rules

### ❌ Error: Image not loading
→ Verify `getImageUrl()` được import đúng từ `shared/imageHelper.js`
→ Check backend `/images` route

### ❌ Error: Token invalid
→ Check auth interceptor ở `src/services/apiClient.js`
→ Verify JWT secret match giữa backend & frontend

---

**Last Updated**: Nov 18, 2025
**Version**: 1.0.0
