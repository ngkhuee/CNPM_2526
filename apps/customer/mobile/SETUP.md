# 📱 Mobile App - Setup & Deployment Guide

## ✅ Đã Fix

1. **Syntax Error** - `canCancelOrder` duplicate export
   - Renamed `canCancelOrder(status)` in `statusHelpers.js` → `canCancelOrderByStatus(status)`
   - Renamed `canReviewOrder(status)` in `statusHelpers.js` → `canReviewOrderByStatus(status)`
   - Updated `MyOrders.jsx` to use `canCancelOrder(order)` from `orderHelpers.js` (nhận object)

2. **Cấu trúc Thư Mục Mobile**
   - ✅ Tạo ngang hàng với `web` trong `apps/customer/`
   - ✅ KHÔNG nằm trong `web/` như trước

## 🚀 Cấu Trúc Mobile

```
apps/customer/
├── shared/              # Shared hooks, contexts, utils
├── web/                 # Web app (ReactJS)
└── mobile/              # Mobile app (React Native + Expo) ← NEW!
    ├── App.jsx                      # Root navigation setup
    ├── app.json                     # Expo configuration
    ├── package.json                 # Dependencies
    ├── babel.config.js              # Babel config
    ├── index.js                     # Entry point
    ├── README.md                    # Documentation
    ├── .gitignore
    └── src/
        └── screens/
            ├── HomeScreen.jsx           # Browse restaurants
            ├── RestaurantDetailsScreen.jsx # Menu & items
            ├── CartScreen.jsx           # Shopping cart
            ├── CheckoutScreen.jsx       # Order confirmation
            ├── MyOrdersScreen.jsx       # Track orders
            ├── TrackingScreen.jsx       # Real-time tracking
            ├── LoginScreen.jsx          # Authentication
            └── ProfileScreen.jsx        # User profile
```

## 📲 Chạy Trên Điện Thoại với Expo Go

### 1️⃣ Cài đặt Expo Go
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2️⃣ Cài đặt Dependencies

```bash
cd apps/customer/mobile
npm install
```

### 3️⃣ Chạy App

```bash
npm start
```

**Output sẽ hiện:**
```
Expo DevTools is running at http://localhost:19002
Opening http://localhost:19000...

 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 █ Scanner ready!              █
 █ Point camera at QR code.    █
 ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

### 4️⃣ Scan QR Code

1. Mở **Expo Go** trên điện thoại
2. Tap **Scan**
3. Scan QR code từ terminal
4. App sẽ load trên điện thoại! 🎉

## 🎮 Navigation Structure

```
App Root
├── Login Screen (unauthorized)
└── Tab Navigator (authorized)
    ├── Home Stack
    │   ├── Home (list restaurants)
    │   ├── Restaurant Details
    │   ├── Cart
    │   └── Checkout
    ├── Orders Stack
    │   ├── My Orders
    │   └── Tracking
    └── Profile Stack
        └── Profile (user info & settings)
```

## 🔄 Reusing Web Logic

Tất cả screens đều dùng **cùng hooks** từ `customer-shared`:

```javascript
// HomeScreen.jsx
import { 
  RestaurantContext,
  GeolocationContext 
} from 'customer-shared';

// MyOrdersScreen.jsx
import { 
  useOrderFiltering,
  useOrderActions,
  useReview,
  OrderContext 
} from 'customer-shared';

// CheckoutScreen.jsx
import { useCheckout } from 'customer-shared';
```

**Lợi ích:**
- ✅ Logic 100% giống với web
- ✅ Không cần sửa `customer-shared` cho mobile
- ✅ Cùng business logic, khác UI (React vs React Native)
- ✅ Dễ maintain & test

## 🧪 Demo Features

### HomeScreen
- 🍕 Danh sách nhà hàng
- 📍 Hiển thị vị trí hiện tại (từ GeolocationContext)
- 🛒 FAB (Floating Action Button) để vào Cart

### MyOrdersScreen
- 📋 Xem đơn hàng hiện tại & lịch sử
- 🔄 Tab để chuyển giữa Current/History
- ✓ Refresh list
- 🚪 Track order
- ❌ Cancel order (nếu có thể)

### TrackingScreen
- 🎯 Timeline tiến độ đơn hàng
- 🚁 Thông tin drone/delivery
- 🗺️ Map placeholder (có thể tích hợp maps sau)

### CartScreen
- 🛍️ Xem items trong cart
- ➖ Xóa items
- 💰 Tính tổng tiền
- ✓ Checkout

### CheckoutScreen
- 📍 Địa chỉ giao hàng
- 💳 Phương thức thanh toán
- 📊 Order summary
- ✓ Place order

### ProfileScreen
- 👤 Thông tin người dùng
- ✏️ Edit profile
- ⚙️ Settings (notifications, payment, addresses)
- 🚪 Logout

### LoginScreen
- 📧 Email login
- 🔑 Password
- 🎮 Demo login button
- 📝 Sign up link

## 🛠️ Customization

### Thay đổi Colors
File `App.jsx` line 16:
```javascript
tabBarActiveTintColor: '#ff6b35',  // Primary color
```

### Thêm New Screen
1. Tạo file `src/screens/NewScreen.jsx`
2. Add route trong `App.jsx`
3. Import & use shared hooks

### Styling Tips
- Dùng `StyleSheet.create()` cho performance
- Reuse colors: `#ff6b35` (primary), `#333` (text), `#f5f5f5` (bg)
- Responsive: Dùng `Dimensions` hoặc `flex`

## 🔐 Security

Tất cả API calls qua `shared-services`:
- ✅ Authentication tokens
- ✅ Error handling
- ✅ Request/response interceptors

## 📊 Performance

Tối ưu hóa:
- ✅ `useMemo` trong `useOrderFiltering`
- ✅ `useCallback` cho expensive functions
- ✅ Lazy loading screens
- ✅ Memoized contexts

## 🚀 Deployment

### Test Build Locally
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Production Build
```bash
# Dùng EAS Build (Expo)
eas build --platform android
eas build --platform ios
```

## 📚 Cấu Trúc Dependencies

```json
{
  "expo": "latest",
  "react": "18.2.0",
  "react-native": "0.72.11",
  "@react-navigation/native": "^6.1.10",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/stack": "^6.3.21",
  "customer-shared": "workspace:*",
  "shared-services": "workspace:*",
  "shared-utils": "workspace:*",
  "shared-constants": "workspace:*"
}
```

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Start expo**: `npm start`
3. **Scan QR code** trên Expo Go
4. **Explore app** trên điện thoại
5. **Test features** (browse, order, track, profile)
6. **Customize** theo nhu cầu

## 💬 Notes

- App sử dụng **mock data** cho demo
- Kết nối **backend** qua `mock-backend` (cần chạy ở port 3001)
- Tất cả **logic kinh doanh** nằm trong `customer-shared`
- **UI riêng biệt** cho web (JSX) vs mobile (React Native)
- **Cùng một codebase** có thể chạy trên 3 nền tảng: Web, Android, iOS

---

**Happy Mobile Development! 📱✨**
