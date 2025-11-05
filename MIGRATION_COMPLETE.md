# 🎉 Migration to JSON Server - Complete!

## ✅ Các thay đổi đã thực hiện

### 1. **Backend (mock-backend/db.json)**

- ✅ Thêm endpoint `/drones` với 3 drones mẫu (available, delivering, charging)
- ✅ Thêm endpoint `/settings` với delivery_fee, admin_url và các settings khác
- ✅ Promotions đã có sẵn trong db.json

### 2. **Shared Services (packages/shared-services)**

- ✅ Thêm `droneService.js` với các methods: getAllDrones, getAvailableDrones, getDronesByStatus, updateDroneLocation, assignDroneToOrder
- ✅ Thêm `settingsService.js` với các methods: getAllSettings, getSettingByKey, getDeliveryFee, updateSetting
- ✅ Cập nhật `endpoints.js` với DRONES và SETTINGS endpoints
- ✅ Export droneService và settingsService trong index.js

### 3. **Restaurant Web (apps/restaurant-web)**

- ✅ Cập nhật `Delivery.jsx` để fetch drones và orders từ API
- ✅ Xóa hardcoded URL trong `assets.js`
- ✅ Thêm auto-refresh mỗi 30 giây cho realtime monitoring

### 4. **Admin Web (apps/admin-web)**

- ✅ Cập nhật `Delivery.jsx` để fetch tất cả drones và orders (admin view)
- ✅ Thêm auto-refresh mỗi 30 giây

### 5. **Customer Web (apps/customer/web)**

- ✅ Xóa file `promotionsData.js` (đã chuyển sang API)
- ✅ Xóa hardcoded `menu_list` trong `assets.js` (đã fetch từ API)
- ✅ Cập nhật `Cart.jsx` để fetch delivery fee từ settings API
- ✅ Cập nhật `LoginPopup.jsx` để dùng env variable cho admin URL

### 6. **Customer Shared (apps/customer/shared)**

- ✅ Cập nhật `cartHelpers.js` để accept delivery fee parameter thay vì hardcode

### 7. **Environment Variables**

- ✅ Tạo `.env.example` cho admin-web, restaurant-web, customer-web
- ✅ Cập nhật `.gitignore` để ignore .env files

---

## 🚀 Hướng dẫn Setup

### Bước 1: Copy file .env.example

```bash
# Customer Web
cp apps/customer/web/.env.example apps/customer/web/.env

# Admin Web
cp apps/admin-web/.env.example apps/admin-web/.env

# Restaurant Web
cp apps/restaurant-web/.env.example apps/restaurant-web/.env
```

### Bước 2: Cập nhật các giá trị trong .env (nếu cần)

```env
# Customer Web (.env)
VITE_API_BASE_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:3001/admin
VITE_RESTAURANT_URL=http://localhost:3002/restaurant

# Admin Web (.env)
VITE_API_BASE_URL=http://localhost:4000

# Restaurant Web (.env)
VITE_API_BASE_URL=http://localhost:4000
```

### Bước 3: Chạy dự án

```bash
# Chạy mock backend
npm run dev:mock

# Chạy các apps (terminal khác)
npm run dev:customer
npm run dev:admin
npm run dev:restaurant
```

---

## 📋 API Endpoints mới

### Drones

- `GET /drones` - Lấy tất cả drones
- `GET /drones?status=available` - Lấy drones available
- `GET /drones/:id` - Lấy drone theo ID
- `PATCH /drones/:id` - Cập nhật drone (location, status, assigned_order_id)

### Settings

- `GET /settings` - Lấy tất cả settings
- `GET /settings?key=delivery_fee` - Lấy delivery fee setting
- `GET /settings?category=delivery` - Lấy settings theo category
- `PATCH /settings/:id` - Cập nhật setting value

---

## 🎯 Các dữ liệu không còn hardcoded

| Dữ liệu cũ                      | Giải pháp mới                            |
| ------------------------------- | ---------------------------------------- |
| `promotionsData.js`             | ✅ Fetch từ `/promotions`                |
| `menu_list` trong assets.js     | ✅ Fetch từ `/restaurants`               |
| Drones data trong Delivery page | ✅ Fetch từ `/drones`                    |
| Orders data trong Delivery page | ✅ Fetch từ `/orders`                    |
| `DELIVERY_FEE` constant         | ✅ Fetch từ `/settings?key=delivery_fee` |
| Hardcoded backend URL           | ✅ Dùng env variable `VITE_API_BASE_URL` |
| Hardcoded admin URL             | ✅ Dùng env variable `VITE_ADMIN_URL`    |

---

## 📝 Notes

1. **Auto-refresh**: Delivery pages tự động refresh mỗi 30 giây để có realtime data
2. **Fallback data**: Nếu API lỗi, sẽ fallback về demo data để tránh crash
3. **Loading states**: Đã thêm loading states cho các API calls
4. **Error handling**: Đã có error handling với console.error để debug

---

## 🐛 Troubleshooting

### Lỗi: "Cannot fetch drones"

- ✅ Kiểm tra mock backend đang chạy: `npm run dev:mock`
- ✅ Kiểm tra port 4000 không bị conflicts
- ✅ Kiểm tra file db.json có drones array

### Lỗi: "Delivery fee is 0"

- ✅ Kiểm tra settings trong db.json có key="delivery_fee"
- ✅ Check console log để xem API response

### Lỗi: ".env not found"

- ✅ Copy .env.example thành .env trong mỗi app folder

---

## ✨ Cải thiện trong tương lai

- [ ] Add caching cho settings API (không cần fetch mỗi lần)
- [ ] WebSocket cho realtime drone updates (thay vì polling)
- [ ] Add pagination cho drones và orders list
- [ ] Add filtering/sorting cho drones table

---

**🎊 Hoàn thành migration! Tất cả data đã chuyển sang JSON Server.**
