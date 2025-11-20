# 📊 LƯỢC ĐỒ THÀNH PHẦN (COMPONENT DIAGRAM) - FOOD DELIVERY SYSTEM

## 🎯 Định Nghĩa

**Component** = Tập hợp các module/logic được tái sử dụng, có tính mở rộng, tương thích, được đóng gói để phục vụ một chức năng cụ thể trong hệ thống. Mỗi component có giao tiếp rõ ràng thông qua **Interface** (cung cấp/yêu cầu).

**Kí hiệu trong lược đồ:**
- 🔲 **Component** = hộp với biểu tượng component
- ⭕ **Provided Interface** (giao tiếp cung cấp) = hình bán nguyệt lồi (lollipop)
- ⬚ **Required Interface** (giao tiếp yêu cầu) = hình bán nguyệt lõm (socket)
- 🔌 **Port** = cửa khe cho giao tiếp
- 🔗 **Dependency** = mũi tên hoặc đường nối giữa components

---

## 🏗️ CẤU TRÚC HỆ THỐNG

Hệ thống được chia thành:
1. **3 Frontend Apps** (UI Layer)
2. **5 Shared Packages** (Infrastructure Layer)
3. **1 Mock Backend** (Data Layer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FOOD DELIVERY SYSTEM                             │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                      FRONTEND APPS (UI Layer)                      │ │
│ │                                                                    │ │
│ │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │ │
│ │  │ Customer Web App │  │Restaurant Web App│  │  Admin Web App  │ │ │
│ │  └──────────────────┘  └──────────────────┘  └─────────────────┘ │ │
│ │                                                                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                  ⬇                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │            SHARED PACKAGES (Infrastructure Layer)                   │ │
│ │                                                                    │ │
│ │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐      │ │
│ │  │   Services  │  │    Hooks     │  │   Constants/Utils   │      │ │
│ │  │  (Business  │  │  (Stateful)  │  │    (Static Data)    │      │ │
│ │  │   Logic)    │  │              │  │                     │      │ │
│ │  └─────────────┘  └──────────────┘  └─────────────────────┘      │ │
│ │                                                                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                  ⬇                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │               MOCK BACKEND (Data/API Layer)                         │ │
│ │  - json-server: Cung cấp REST APIs                                 │ │
│ │  - In-memory database simulation                                   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 CHI TIẾT CÁC COMPONENTS

### ==================== LAYER 1: FRONTEND APPS ====================

#### **📱 COMPONENT 1: CUSTOMER WEB APP**
**Mô tả:** Ứng dụng web cho khách hàng - tìm kiếm, duyệt menu, đặt hàng, thanh toán, theo dõi giao hàng, review.

**Kí hiệu:** 🔲 Component
**Trạng thái:** ACTIVE (Hoạt động)

**Cung cấp (Provided Interfaces - ⭕):**
- 🎨 `<UI_Pages>`: Danh sách các trang (Home, Menu, Cart, Checkout, Tracking, Profile, v.v.)
- 🧭 `<Navigation>`: Định tuyến (React Router)
- 📲 `<UserInterfaces>`: Form nhập, button action, modal, toast

**Yêu cầu (Required Interfaces - ⬚):**
```
┌─ [authService]      → Đăng ký, đăng nhập
├─ [restaurantService]→ Lấy danh sách nhà hàng
├─ [foodService]      → Lấy menu sản phẩm
├─ [cartService]      → Quản lý giỏ hàng
├─ [orderService]     → Tạo order, lấy danh sách orders
├─ [paymentService]   → Xử lý thanh toán (MoMo, Cash)
├─ [addressService]   → Quản lý địa chỉ
├─ [reviewService]    → Đánh giá sản phẩm & nhà hàng
├─ [orderTrackingService] → Tracking realtime
├─ [geolocation API]  → Lấy GPS khách
├─ [Maps API]         → Hiển thị bản đồ tracking
└─ [shared-hooks]     → Các hook logic
```

**Cấu trúc bên trong:**
```
apps/customer/web/
├── src/
│   ├── pages/
│   │   ├── Home/           (Danh sách nhà hàng)
│   │   ├── Menu/           (Menu chi tiết)
│   │   ├── Cart/           (Giỏ hàng)
│   │   ├── CheckOutInfo/   (Địa chỉ, khuyến mãi)
│   │   ├── PlaceOrder/     (Xác nhận đơn)
│   │   ├── PaymentMoMo/    (Thanh toán MoMo)
│   │   ├── Tracking/       (Theo dõi realtime)
│   │   ├── MyOrders/       (Lịch sử đơn)
│   │   ├── Profile/        (Tài khoản)
│   │   └── Verify/         (Xác thực thanh toán)
│   ├── components/
│   │   ├── Navbar/         (Header navigation)
│   │   ├── Footer/
│   │   ├── LoginPopup/
│   │   ├── FoodDisplay/    (Danh sách sản phẩm)
│   │   ├── RestaurantDisplay/
│   │   ├── ReviewSection/
│   │   ├── Tracking/       (Widget tracking)
│   │   └── ...
│   ├── App.jsx             (Root routing)
│   └── main.jsx
```

**Port (🔌):**
- Nhận input từ người dùng (Form, GPS, click)
- Gửi API requests qua services
- WebSocket subscribe order tracking

**Tái sử dụng:** ✅ Có thể reuse components với mobile app (qua `customer-shared` package)

**Mở rộng:** ✅ Có thể thêm features mới (reviews, wishlists, referral) mà không ảnh hưởng logic cũ

---

#### **🏪 COMPONENT 2: RESTAURANT WEB APP**
**Mô tả:** Ứng dụng web cho chủ nhà hàng - quản lý menu, orders, báo cáo, khuyến mãi.

**Kí hiệu:** 🔲 Component
**Trạng thái:** ACTIVE

**Cung cấp (Provided Interfaces - ⭕):**
- 🎨 `<RestaurantUI>`: Trang quản lý (Dashboard, Orders, Menu, Promotions)
- 📊 `<DataDisplay>`: Bảng, chart doanh thu
- 🔔 `<RealtimeNotification>`: Thông báo order mới

**Yêu cầu (Required Interfaces - ⬚):**
```
┌─ [authService]           → Đăng nhập chủ nhà hàng
├─ [restaurantService]     → Cập nhật thông tin nhà hàng
├─ [foodService]           → CRUD menu sản phẩm
├─ [orderService]          → Lấy orders, update status
├─ [promotionService]      → CRUD khuyến mãi
├─ [paymentService]        → Lấy chi tiết thanh toán
├─ [settingsService]       → Lấy cài đặt
├─ [websocketService]      → Subscribe order events
├─ [reviewService]         → Lấy reviews sản phẩm
├─ [shared-hooks]          → useOrderManagement, useFoodManagement, v.v.
└─ [Charts library]        → recharts hoặc tương tự
```

**Cấu trúc bên trong:**
```
apps/restaurant-web/
├── src/
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/      (KPI, doanh số hôm nay)
│   │   ├── Add/            (Thêm sản phẩm)
│   │   ├── List/           (Danh sách sản phẩm)
│   │   ├── Orders/         (Quản lý orders)
│   │   ├── Promotions/     (Khuyến mãi)
│   │   ├── Category/       (Danh mục)
│   │   ├── RestaurantProfile/ (Thông tin nhà hàng)
│   │   ├── Reviews/        (Reviews từ khách)
│   │   ├── Payment/        (Ghi nhận thanh toán)
│   │   └── ...
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   └── ...
│   ├── Context/
│   │   ├── AuthContext
│   │   ├── RestaurantContext
│   │   ├── FoodContext
│   │   ├── OrderContext
│   │   ├── PromotionContext
│   │   └── CategoryContext
│   ├── hooks/
│   │   ├── useOrderManagement
│   │   ├── useFoodManagement
│   │   ├── usePromotionManagement
│   │   ├── useDroneAssignment
│   │   └── ...
│   └── App.jsx
```

**Port (🔌):**
- WebSocket realtime order notifications
- REST API gửi nhận dữ liệu
- Context state management

**Tái sử dụng:** ⚠️ Khó tái sử dụng toàn bộ, nhưng có thể extract hooks, services riêng

**Mở rộng:** ✅ Có thể mở rộng thêm: inventory management, staff management, analytics nâng cao

---

#### **⚙️ COMPONENT 3: ADMIN WEB APP**
**Mô tả:** Ứng dụng web cho quản trị viên - duyệt nhà hàng, quản lý users, drones, báo cáo tổng hệ thống.

**Kí hiệu:** 🔲 Component
**Trạng thái:** ACTIVE

**Cung cấp (Provided Interfaces - ⭕):**
- 🎨 `<AdminUI>`: Trang quản lý (Dashboard, Partners, Users, Delivery, Orders, Payments)
- 📈 `<ReportsDisplay>`: Dashboard KPI, charts, analytics
- 🗺️ `<DeliveryTracking>`: Bản đồ realtime tất cả drones

**Yêu cầu (Required Interfaces - ⬚):**
```
┌─ [authService]           → Đăng nhập admin
├─ [restaurantService]     → Duyệt/block nhà hàng
├─ [authService (users)]   → Block/unblock khách
├─ [orderService]          → Xem tất cả orders
├─ [paymentService]        → Báo cáo thanh toán
├─ [droneService]          → CRUD drones, tracking
├─ [websocketService]      → Subscribe order & drone events
├─ [drones tracking]       → GPS realtime
├─ [Maps API]              → Bản đồ hiển thị drones
├─ [Charts library]        → recharts
└─ [shared-hooks]          → useSystemStats, useDroneTracking, v.v.
```

**Cấu trúc bên trong:**
```
apps/admin-web/
├── src/
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/      (System KPI)
│   │   ├── Partners/       (Duyệt nhà hàng mới)
│   │   ├── RestaurantDetail/
│   │   ├── Orders/         (Tất cả orders)
│   │   ├── Users/          (Block/unblock users)
│   │   ├── Delivery/       (Drones, tracking bản đồ)
│   │   ├── Alerts/
│   │   ├── Payments/       (Báo cáo thanh toán)
│   │   ├── Promotions/     (Quản lý promotions toàn hệ)
│   │   ├── Reports/        (Báo cáo doanh thu)
│   │   ├── List/
│   │   └── ...
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── Payments/
│   │   └── ...
│   ├── Context/
│   │   ├── AdminAuthContext
│   │   ├── OrderContext
│   │   └── SystemStatsContext
│   ├── hooks/
│   │   ├── useDroneManagement
│   │   ├── useDroneTracking
│   │   ├── useOrderManagement
│   │   ├── usePaymentManagement
│   │   ├── useSystemStats
│   │   └── ...
│   └── App.jsx
```

**Port (🔌):**
- WebSocket drone GPS streaming + order events
- REST API quản lý resources
- Maps API integration

**Tái sử dụng:** ⚠️ Khó, nhưng có thể reuse: drone tracking logic, order management logic, stats hooks

**Mở rộng:** ✅ Có thể mở rộng: financial reports, user analytics, fraud detection, custom dashboards

---

### ==================== LAYER 2: SHARED PACKAGES ====================

#### **🔌 COMPONENT 4: SHARED-SERVICES (Business Logic Component)**

**Mô tả:** Tập hợp tất cả business logic dưới dạng services - giao tiếp với backend API, xử lý data, caching.

**Kí hiệu:** 🔲 Component
**Loại:** Infrastructure Component
**Trạng thái:** CORE

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ authService:
   - login(email, password)
   - register(data)
   - logout()
   - getCurrentUser()
   → Được sử dụng bởi: Customer, Restaurant, Admin

⭕ restaurantService:
   - getRestaurants(filters, location)
   - getRestaurantById(id)
   - createRestaurant(data)
   - updateRestaurant(id, data)
   - blockRestaurant(id)
   → Được sử dụng bởi: Customer (browse), Restaurant (edit), Admin (approve/block)

⭕ foodService (tương tự menuService):
   - getMenus(restaurantId)
   - createMenu(data)
   - updateMenu(id, data)
   - deleteMenu(id)
   → Được sử dụng bởi: Customer (view), Restaurant (manage)

⭕ orderService:
   - createOrder(orderData)
   - getOrders(filters)
   - getOrderById(id)
   - updateOrderStatus(id, newStatus)
   → Được sử dụng bởi: Customer, Restaurant, Admin

⭕ paymentService:
   - processPayment(orderId, amount, method)
   - verifyPayment(transactionId)
   - getPaymentStatus(orderId)
   → Được sử dụng bởi: Customer (checkout), Admin (reports)

⭕ cartService:
   - addToCart(userId, itemId, qty)
   - removeFromCart(userId, itemId)
   - updateCart(userId, items)
   - getCart(userId)
   → Được sử dụng bởi: Customer

⭕ promotionService:
   - getPromotions(filters)
   - validatePromoCode(code, orderValue)
   - calculateDiscount(code, subtotal)
   → Được sử dụng bởi: Customer, Restaurant, Admin

⭕ reviewService:
   - createReview(data)
   - getReviews(filters)
   - getRating(foodId/restaurantId)
   → Được sử dụng bởi: Customer, Restaurant

⭕ addressService:
   - getAddresses(userId)
   - createAddress(userId, data)
   - updateAddress(id, data)
   - deleteAddress(id)
   → Được sử dụng bởi: Customer

⭕ droneService:
   - getDrones()
   - getDroneById(id)
   - createDrone(data)
   - updateDroneStatus(id, status)
   - assignDrone(droneId, orderId)
   → Được sử dụng bởi: Admin, Restaurant (assignment)

⭕ websocketService:
   - subscribe(channel, callback)
   - unsubscribe(channel)
   - publish(channel, data)
   → Được sử dụng bởi: Customer (order tracking), Restaurant (new orders), Admin (tracking)

⭕ orderTrackingService:
   - getTrackingData(orderId)
   - subscribeTracking(orderId)
   - getDroneLocation(droneId)
   → Được sử dụng bởi: Customer, Admin

⭕ geoService:
   - geocode(address)
   - reverseGeocode(lat, lng)
   - calculateDistance(lat1, lng1, lat2, lng2)
   → Được sử dụng bởi: Customer (tracking), Restaurant (location)
```

**Yêu cầu (Required Interfaces - ⬚):**
```
┌─ Backend REST API Endpoints
│  ├─ /auth/*
│  ├─ /restaurants/*
│  ├─ /menus/*
│  ├─ /orders/*
│  ├─ /payments/*
│  ├─ /carts/*
│  ├─ /promotions/*
│  ├─ /reviews/*
│  ├─ /addresses/*
│  ├─ /drones/*
│  ├─ /users/*
│  └─ /settings/*
├─ WebSocket Connection (order & drone tracking)
├─ Maps API (geolocation, geocoding)
├─ Storage API (localStorage, AsyncStorage)
└─ shared-constants (enum values)
```

**Cấu trúc bên trong:**
```
packages/shared-services/
├── src/
│   ├── services/
│   │   ├── authService.js
│   │   ├── restaurantService.js
│   │   ├── foodService.js
│   │   ├── orderService.js
│   │   ├── cartService.js
│   │   ├── paymentService.js
│   │   ├── addressService.js
│   │   ├── reviewService.js
│   │   ├── promotionService.js
│   │   ├── droneService.js
│   │   ├── orderTrackingService.js
│   │   ├── droneProgressService.js
│   │   ├── geoService.js
│   │   ├── orderValidationService.js
│   │   ├── websocketService.js
│   │   ├── categoryService.js
│   │   ├── settingsService.js
│   │   ├── uploadService.js
│   │   └── index.js (export all)
│   ├── config/
│   │   ├── endpoints.js (API routes)
│   │   └── settings.js
│   └── utils/
│       ├── storage.js (abstraction localStorage/AsyncStorage)
│       └── geolocation.js (abstraction geolocation API)
```

**Port (🔌):**
- REST API calls (fetch/axios)
- WebSocket events
- Local storage persistence
- Geolocation & Maps APIs

**Tái sử dụng:** ✅ **CÓ, LÀ MỤC ĐÍCH CHÍNH**
- Được import & dùng bởi cả 3 apps
- Mỗi service độc lập, có thể dùng riêng hoặc kết hợp
- Có thể reuse trong mobile app (customer-shared)

**Mở rộng:** ✅ Có thể thêm services mới (notifications, analytics, audit logs) mà không ảnh hưởng cũ

**Tương thích:** ✅ TƯƠNG THÍCH CAO - Tất cả apps yêu cầu các interfaces này

---

#### **🪝 COMPONENT 5: SHARED-HOOKS (Custom React Hooks Component)**

**Mô tả:** Tập hợp các custom hooks React - tái sử dụng logic stateful, form handling, data fetching.

**Kí hiệu:** 🔲 Component
**Loại:** Infrastructure Component (Logic Layer)
**Trạng thái:** CORE

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ useAuth():
   - currentUser, isAuthenticated, login, logout, register
   → Được sử dụng: Tất cả apps

⭕ useCart():
   - cart, addItem, removeItem, updateQty, clearCart
   → Được sử dụng: Customer

⭕ useDebounce(value, delay):
   - debouncedValue
   → Được sử dụng: Search, form inputs

⭕ useGeolocation():
   - location, error, loading, requestLocation
   → Được sử dụng: Customer (nearby restaurants)

⭕ useLocalStorage(key, initialValue):
   - value, setValue
   → Được sử dụng: Caching, persisting state

⭕ useProductRating(productId):
   - rating, reviews, loading
   → Được sử dụng: Customer (menu detail)

⭕ useRestaurantRating(restaurantId):
   - rating, reviews, loading
   → Được sử dụng: Customer (restaurant detail)
```

**Yêu cầu (Required Interfaces - ⬚):**
```
┌─ React (hooks API)
├─ shared-services (data fetching)
├─ localStorage/AsyncStorage API
└─ Geolocation API
```

**Cấu trúc bên trong:**
```
packages/shared-hooks/
├── src/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useDebounce.js
│   ├── useGeolocation.js
│   ├── useLocalStorage.js
│   ├── useProductRating.js
│   ├── useRestaurantRating.js
│   └── index.js (export all)
```

**Port (🔌):**
- React component integration
- Service method calls
- State persistence

**Tái sử dụng:** ✅ **CÓ, CAO**
- Mỗi hook độc lập, có thể dùng trong bất kỳ React component nào
- Dễ dàng thêm vào mobile app
- Có thể tổng hợp hook complex từ hooks đơn giản

**Mở rộng:** ✅ Có thể thêm hooks mới: usePagination, useInfiniteScroll, useOrderNotifications, v.v.

**Tương thích:** ✅ TƯƠNG THÍCH CỰC CAO - Hook là pattern chuẩn của React 16.8+

---

#### **📦 COMPONENT 6: SHARED-CONSTANTS (Static Data Component)**

**Mô tả:** Tập hợp các hằng số, enum, lookup tables dùng chung - order status, roles, payment methods, categories.

**Kí hiệu:** 🔲 Component
**Loại:** Data/Configuration Component
**Trạng thái:** CORE

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ ORDER_STATUS:
   export const ORDER_STATUSES = {
     PENDING: "pending",
     CONFIRMING: "confirming",
     PREPARING: "preparing",
     READY: "ready",
     SHIPPING: "shipping",
     COMPLETED: "completed",
     CANCELLED: "cancelled"
   }
   → Được sử dụng: Tất cả apps (filtering, display)

⭕ ROLES:
   export const USER_ROLES = {
     CUSTOMER: "customer",
     RESTAURANT_OWNER: "restaurant_owner",
     ADMIN: "admin",
     SHIPPER: "shipper"
   }
   → Được sử dụng: Auth, routing

⭕ PAYMENT_METHODS:
   export const PAYMENT_METHODS = {
     MOMO: "momo",
     CASH_ON_DELIVERY: "cod",
     CARD: "card",
     WALLET: "wallet"
   }
   → Được sử dụng: Payment selection, validation

⭕ CATEGORIES:
   export const FOOD_CATEGORIES = {
     PIZZA: "pizza",
     BURGER: "burger",
     NOODLES: "noodles",
     SUSHI: "sushi",
     ...
   }
   → Được sử dụng: Menu filtering, display

⭕ USER_STATUS:
   export const USER_STATUSES = {
     ACTIVE: "active",
     BLOCKED: "blocked",
     PENDING_APPROVAL: "pending"
   }

⭕ DRONE_STATUS:
   export const DRONE_STATUSES = {
     AVAILABLE: "available",
     BUSY: "busy",
     OFFLINE: "offline",
     MAINTENANCE: "maintenance"
   }
```

**Cấu trúc bên trong:**
```
packages/shared-constants/
├── src/
│   ├── orderStatus.js
│   ├── roles.js
│   ├── paymentMethods.js
│   ├── categories.js
│   └── index.js (export all)
```

**Port (🔌):**
- Direct import & usage
- No dependencies on runtime

**Tái sử dụng:** ✅ **CÓ, CỰC CAO**
- Single source of truth cho tất cả enums
- Prevents hardcoded strings & magic numbers
- Dễ maintain và test

**Mở rộng:** ✅ Có thể thêm constants mới khi features phát triển

**Tương thích:** ✅ **LÀM = 100% TƯƠNG THÍCH** - Chỉ là static data

---

#### **🛠️ COMPONENT 7: SHARED-UTILS (Utility Functions Component)**

**Mô tả:** Tập hợp các hàm utility, formatter, validators - không có state, pure functions.

**Kí hiệu:** 🔲 Component
**Loại:** Utility Component
**Trạng thái:** CORE

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ formatters:
   - formatCurrency(amount)
   - formatDate(date, format)
   - formatTime(time)
   - formatPhoneNumber(phone)
   - formatAddress(addressObj)
   → Được sử dụng: Display data in all apps

⭕ validators:
   - validateEmail(email)
   - validatePhone(phone)
   - validatePassword(password)
   - validateAddres(address)
   - validatePromoCode(code)
   → Được sử dụng: Form validation in all apps

⭕ imageHelper:
   - getImageUrl(path)
   - resizeImage(url, width, height)
   - compressImage(file)
   → Được sử dụng: Image display, upload

⭕ geocoding:
   - geocodeAddress(address)
   - reverseGeocode(lat, lng)
   → Được sử dụng: Address ↔ GPS conversion

⭕ hoursHelper:
   - isRestaurantOpen(hours, currentTime)
   - getNextOpenTime(hours)
   - formatOpeningHours(hours)
   → Được sử dụng: Restaurant status display

⭕ promotionHelper:
   - calculateDiscount(promotion, subtotal)
   - isPromotionValid(promotion)
   - formatPromotionDisplay(promotion)
   → Được sử dụng: Promotion calculation, display
```

**Cấu trúc bên trong:**
```
packages/shared-utils/
├── src/
│   ├── formatters.js
│   ├── validators.js
│   ├── imageHelper.js
│   ├── geocoding.js
│   ├── hoursHelper.js
│   ├── promotionHelper.js
│   └── index.js (export all)
```

**Port (🔌):**
- Pure function calls
- No side effects
- Minimal dependencies (only libraries like date-fns, validator)

**Tái sử dụng:** ✅ **CÓ, CỰC CAO**
- Mỗi function độc lập, không có coupling
- Có thể dùng trong bất kỳ context nào
- Unit test dễ

**Mở rộng:** ✅ Có thể thêm utils mới không ảnh hưởng cũ

**Tương thích:** ✅ **TƯƠNG THÍCH TUYỆT ĐỐI** - Pure functions, no dependencies

---

#### **🎨 COMPONENT 8: SHARED-UI (Reusable UI Components)**

**Mô tả:** Tập hợp các UI components tái sử dụng - Button, Modal, Card, Badge, v.v.

**Kí hiệu:** 🔲 Component
**Loại:** UI Component
**Trạng thái:** AVAILABLE (Khi implement)

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ Common Components:
   - <Button />
   - <Modal />
   - <Card />
   - <Badge />
   - <Loader />
   - <Toast />
   - <Input />
   - <Select />
   - <Rating />
   - <Pagination />
   → Được sử dụng: Tất cả apps
```

**Cấu trúc bên trong:**
```
packages/shared-ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Card/
│   │   ├── ...
│   └── index.js
```

**Port (🔌):**
- React props passing
- CSS-in-JS atau CSS modules

**Tái sử dụng:** ✅ **CÓ, CAO NẾU IMPLEMENT TỐTТ**

**Tương thích:** ✅ TƯƠNG THÍCH TUYỆT ĐỐI nếu design tokens thống nhất

---

#### **🎨 COMPONENT 9: SHARED-STYLES (Global Styles Component)**

**Mô tả:** Global CSS, design tokens, theme.

**Cung cấp:**
- Global CSS resets, typography, colors, spacing
- CSS variables (CSS custom properties)

**Tái sử dụng:** ✅ Import một lần, áp dụng toàn hệ thống

---

### ==================== LAYER 3: BACKEND ====================

#### **🗄️ COMPONENT 10: MOCK-BACKEND (Data & API Component)**

**Mô tả:** Mock REST API server dùng json-server - định nghĩa data schema, routes, middleware.

**Kí hiệu:** 🔲 Component
**Loại:** Backend/Data Service Component
**Trạng thái:** DEV (Development)

**Cung cấp (Provided Interfaces - ⭕):**
```
⭕ REST API Endpoints:
   GET/POST   /auth/login, /auth/register
   GET/POST   /restaurants
   GET/PATCH  /restaurants/:id
   GET/POST/PATCH /menus
   GET/POST/PATCH /orders
   GET/POST   /carts
   GET/POST/PATCH /payments
   GET/PATCH  /addresses
   GET/POST   /reviews
   GET        /promotions
   GET/POST   /drones
   ...

⭕ Data Models:
   - users (id, email, password, role, status)
   - restaurants (id, name, owner_id, address, rating)
   - menus (id, restaurant_id, name, price, category)
   - orders (id, user_id, restaurant_id, status, items, total)
   - payments (id, order_id, amount, method, status)
   - reviews (id, user_id, food_id, rating, comment)
   - addresses (id, user_id, lat, lng, address_text)
   - drones (id, identifier, status, lat, lng)
   - ...
```

**Yêu cầu (Required Interfaces - ⬚):**
- Node.js runtime
- json-server library
- db.json file (data source)

**Cấu trúc bên trong:**
```
mock-backend/
├── db.json              (Data source - "database")
├── routes.json          (Route mappings)
├── server.js            (Express server, middlewares)
├── middlewares.js       (Custom auth, logging, etc.)
├── package.json
├── Procfile             (Deployment config)
└── public/images/       (Static assets)
    ├── avatars/
    ├── foods/
    ├── restaurants/
    └── other/
```

**Port (🔌):**
- HTTP REST endpoints (http://localhost:3000)
- WebSocket (simulasi realtime - có thể mock)
- Static file serving

**Tái sử dụng:** ⚠️ Khó - Mock backend này chỉ cho DEV
- Khi production → thay bằng real backend (có thể dùng Express thực, database thực)
- APIs interface vẫn giữ nguyên (backward compatibility)

**Mở rộng:** ✅ Có thể:
- Thêm endpoints mới trong `routes.json`
- Thêm data models mới trong `db.json`
- Thêm custom middleware cho complex logic

---

## 🔗 MỐI QUAN HỆ GIỮA CÁC COMPONENTS

### **1. Dependency Flow (Từ trên xuống)**

```
┌─────────────────────────────┐
│  3 Frontend Apps            │
│  (Customer, Restaurant,     │
│   Admin)                    │
└──────────┬──────────────────┘
           │ (import & use)
           ▼
┌─────────────────────────────┐
│  5 Shared Packages          │
│  ┌──────────────────────┐   │
│  │ 1. shared-services   │   │ (Business Logic)
│  │ 2. shared-hooks      │   │ (React Logic)
│  │ 3. shared-constants  │   │ (Enums, Config)
│  │ 4. shared-utils      │   │ (Utility Functions)
│  │ 5. shared-styles     │   │ (UI Styling)
│  └──────────────────────┘   │
└──────────┬──────────────────┘
           │ (API calls via services)
           ▼
┌─────────────────────────────┐
│  Mock Backend               │
│  (db.json, REST API)        │
└─────────────────────────────┘
```

### **2. Component Interaction Matrix**

| From \ To | Customer | Restaurant | Admin | Shared-Svcs | Shared-Hooks | Shared-Utils | Constants | Mock-BE |
|-----------|----------|-----------|-------|------------|--------------|-------------|-----------|---------|
| **Customer** | ✅ (via Router) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ (via Svcs) |
| **Restaurant** | ❌ | ✅ (via Router) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ (via Svcs) |
| **Admin** | ❌ | ❌ | ✅ (via Router) | ✅ | ✅ | ✅ | ✅ | ✅ (via Svcs) |
| **Shared-Svcs** | ✅ (call) | ✅ (call) | ✅ (call) | - | ❌ | ✅ (call) | ✅ (use enums) | ✅ (call) |
| **Shared-Hooks** | ✅ (in component) | ✅ (in component) | ✅ (in component) | ✅ (call) | ❌ | ❌ | ✅ (use) | ❌ |
| **Shared-Utils** | ✅ (call) | ✅ (call) | ✅ (call) | ✅ (call) | ✅ (call) | ❌ | ❌ | ❌ |
| **Constants** | ✅ (use) | ✅ (use) | ✅ (use) | ✅ (use) | ✅ (use) | ✅ (use) | ❌ | ❌ |
| **Mock-BE** | ❌ | ❌ | ❌ | ✅ (call) | ❌ | ❌ | ❌ | - |

---

## 🔌 GIAO TIẾP CHI TIẾT

### **Interface 1: SERVICE INTERFACE** (Provided by shared-services)
```
┌─ Signature:
│  service.method(params): Promise<data>
│
├─ Example:
│  authService.login(email, password): Promise<{user, token}>
│  orderService.createOrder(orderData): Promise<{orderId, status}>
│  restaurantService.getRestaurants(filters): Promise<restaurants[]>
│
├─ Error Handling:
│  service.method(params).catch(error => {
│    if (error.status === 401) → unauthorized
│    if (error.status === 404) → not found
│    if (error.status === 500) → server error
│  })
│
└─ Caching Strategy:
   Some services may cache results (useLocalStorage)
   for performance & offline support
```

### **Interface 2: HOOK INTERFACE** (Provided by shared-hooks)
```
┌─ Signature:
│  const { data, loading, error, action } = useHook(params)
│
├─ Example:
│  const { user, login, logout } = useAuth()
│  const { cart, addItem, removeItem } = useCart()
│  const { location, error } = useGeolocation()
│
└─ Pattern:
   useState (local state)
   + useService (fetch/update data)
   = useHook (exported)
```

### **Interface 3: CONSTANT INTERFACE** (Provided by shared-constants)
```
┌─ Usage:
│  import { ORDER_STATUSES, USER_ROLES } from 'shared-constants'
│
├─ For validation:
│  if (orderStatus === ORDER_STATUSES.COMPLETED) { ... }
│
├─ For display (mapping):
│  const statusLabel = {
│    [ORDER_STATUSES.PENDING]: "Chờ xác nhận",
│    [ORDER_STATUSES.SHIPPING]: "Đang giao",
│    ...
│  }
│
└─ For form options:
   <select>
     {Object.values(USER_ROLES).map(role => <option>{role}</option>)}
   </select>
```

### **Interface 4: UTILITY INTERFACE** (Provided by shared-utils)
```
┌─ Signature:
│  const result = utilFunction(input): output
│
├─ Example:
│  formatCurrency(150000) → "150,000 VND"
│  validateEmail("test@gmail.com") → true
│  isRestaurantOpen(hours) → true/false
│
└─ Characteristics:
   - Pure functions (same input → same output)
   - No side effects
   - No async/Promise
```

### **Interface 5: API INTERFACE** (Provided by mock-backend)
```
┌─ Protocol: HTTP REST
│
├─ Base URL: http://localhost:3000/api/
│
├─ Auth:
│  POST /auth/login { email, password }
│  → { access_token, user: { id, email, role, ... } }
│
├─ CRUD Operations:
│  GET /orders → list all (with filters ?status=pending)
│  GET /orders/:id → single order
│  POST /orders → create new
│  PATCH /orders/:id → update (status, items, etc.)
│  DELETE /orders/:id → delete (soft delete)
│
├─ Errors:
│  4xx = Client error (bad request, not found, unauthorized)
│  5xx = Server error
│
└─ Response Format:
   {
     "status": "success" | "error",
     "data": { ... },
     "error": { code, message }
   }
```

---

## ✅ TÍNH TƯƠNG THÍCH & KHẢ NĂNG TÁI SỬ DỤNG

### **Tái sử dụng trong Mobile App (customer-shared)**

```
customers/mobile/shared/
├── src/
│   ├── hooks/           ← Import từ ../../packages/shared-hooks
│   ├── services/        ← Import từ ../../packages/shared-services
│   ├── utils/           ← Import từ ../../packages/shared-utils
│   ├── constants/       ← Import từ ../../packages/shared-constants
│   └── components/      ← React Native components (platform-specific)
```

**Tương thích (Compatible):**
- ✅ `shared-services` → 100% compatible (không phụ thuộc platform)
- ✅ `shared-hooks` → 80% compatible (có thể dùng React Native hooks)
- ✅ `shared-constants` → 100% compatible (chỉ là data)
- ✅ `shared-utils` → 100% compatible (pure functions)
- ⚠️ `shared-ui` → 0% compatible (React ≠ React Native) → cần tạo separate UI components

**Không tương thích (Incompatible):**
- ❌ Frontend apps (Customer-web, Restaurant-web, Admin-web) → DOM-based (web-only)
- ❌ Mock-backend có thể dùng nhưng chỉ như API layer

---

## 🛠️ KHẮC PHỤC VỀ "PORT" & "INTERFACE"

### **Port (Cổng)**
- **Không hiện rõ trong code hiện tại** vì:
  - 3 frontend apps không export public interfaces
  - Chỉ là UI layer, không dùng "port" pattern
  - Port thường dùng cho system components, embedded systems

- **Nếu implement Port → có thể:**
  ```javascript
  // Ví dụ: Customer-web cung cấp "User Interface Port"
  // để backend giao tiếp (tương tự plugin pattern)
  
  // Port interface
  interface CustomerUIPort {
    displayNotification(message)
    updateCart(items)
    showOrderTracking(orderId)
  }
  
  // Backend gọi port để notify frontend
  customerUIPort.showOrderTracking(orderId)
  ```

### **Required Interface (Giao tiếp bắt buộc)**
Mỗi component yêu cầu:

**Customer Web App yêu cầu:**
```
┌─ authService.login(), .register()
├─ restaurantService.getRestaurants(), getById()
├─ foodService.getMenus()
├─ orderService.createOrder(), getOrders()
├─ paymentService.processPayment()
├─ cartService.*
├─ Geolocation API
├─ Maps API
└─ WebSocket for tracking
```

**Restaurant Web App yêu cầu:**
```
┌─ authService.login()
├─ restaurantService.getById(), update()
├─ foodService.create(), update(), delete()
├─ orderService.getOrders(), updateStatus()
├─ promotionService.create(), get()
├─ reviewService.getReviews()
└─ WebSocket for notifications
```

**Admin Web App yêu cầu:**
```
┌─ authService.login()
├─ restaurantService.get(), approve(), block()
├─ orderService.getAll()
├─ userService.block(), unblock()
├─ droneService.get(), create(), assign()
├─ paymentService.getAll()
├─ websocketService for live tracking
└─ Maps API for drone display
```

---

## 📋 TÓSUM: COMPONENTS & RELATIONSHIPS

| **Component** | **Type** | **Kí hiệu** | **Cung Cấp** | **Yêu Cầu** | **Tái Sử Dụng** | **Tương Thích** |
|---|---|---|---|---|---|---|
| **Customer Web** | App | 🔲 | UI Pages, Navigation | Services, Hooks, Utils, Constants, Maps API | ✅ (components via shared) | ✅ |
| **Restaurant Web** | App | 🔲 | Management UI, Charts | Services, Hooks, Utils, Constants | ✅ (hooks, services) | ✅ |
| **Admin Web** | App | 🔲 | Dashboard, Reporting | Services, Hooks, Utils, Constants, Maps API | ✅ (tracking logic) | ✅ |
| **shared-services** | Library | 📦 | 17 Services (API layer) | Backend APIs, WebSocket | ✅✅✅ (MOST REUSABLE) | ✅✅ |
| **shared-hooks** | Library | 🪝 | 7 Custom Hooks | React, Services, Storage | ✅✅ (HIGH) | ✅✅ |
| **shared-constants** | Library | 📋 | Enums & Config | None | ✅✅✅ (PERFECT) | ✅✅✅ |
| **shared-utils** | Library | 🛠️ | Formatters, Validators, Helpers | None/Minimal | ✅✅✅ (PERFECT) | ✅✅✅ |
| **shared-styles** | Library | 🎨 | Global CSS, Design Tokens | None | ✅ | ✅✅ |
| **Mock Backend** | Service | 🗄️ | REST APIs, Data | Node.js, json-server | ⚠️ (DEV only) | ⚠️ (needs prod replacement) |

---

## 🎯 KẾT LUẬN

### **Kiến trúc Component Diagram Summary:**

1. **3 Frontend Apps** là các **isolated UI components** có:
   - Provided Interface: UI pages, navigation, user interactions
   - Required Interface: Cần services, hooks, utils, constants
   - NO direct dependencies với nhau → có thể phát triển độc lập

2. **5 Shared Packages** là **infrastructure components** có:
   - **shared-services**: ⭕⭕⭕ Cung cấp business logic, yêu cầu backend APIs
   - **shared-hooks**: ⭕⭕⭕ Cung cấp React logic reusable
   - **shared-constants**: ⭕⭕⭕ Cung cấp configuration/enums
   - **shared-utils**: ⭕⭕⭕ Cung cấp utility functions
   - Tất cả đều **tái sử dụng cực cao** cho 3 apps + mobile

3. **Mock Backend** là **API provider component**:
   - Cung cấp REST interfaces
   - Yêu cầu services gọi APIs
   - Chỉ dùng trong DEV, production thay bằng real backend

4. **Ball-and-Socket Connection** xuất hiện ở:
   - Services ← → APIs (required ← → provided)
   - Hooks ← → React components (required ← → provided)
   - Apps ← → Shared packages (required ← → provided)

5. **Mở rộng dễ** vì:
   - Loose coupling: Apps không phụ thuộc nhau
   - High cohesion: Services tập trung logic, Hooks tập trung state, Utils tập trung công cụ
   - Single Responsibility: Mỗi package có trách nhiệm rõ ràng

---

## 📌 KHUYẾN NGHỊ

1. **Hiện tại đã tốt** - Architecture là monorepo với shared packages đúng pattern
2. **Có thể cải thiện:**
   - Thêm `shared-ui` component library để tái sử dụng UI components
   - Tách riêng mobile app (`customer-shared` → full package)
   - Thêm Portal pattern nếu cần giao tiếp app ↔ app (hiện không cần)

3. **Maintain tính tương thích:**
   - shared-packages luôn giữ backward compatibility
   - Versioning (e.g., v1.0 → v1.1 không break, v2.0 có thể break)
