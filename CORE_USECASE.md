# 🛍️ CORE USECASE - FOOD DELIVERY SYSTEM

## 📌 Tập trung: Luồng mua hàng online chính

---

## **1️⃣ CUSTOMER - 9 CORE UC**

### **UC-C01: Đăng ký & Đăng nhập**
- Đăng ký: email, password, name, phone → POST /auth/register
- Đăng nhập: email, password → POST /auth/login
- Kiểm tra status (active/blocked) → Vào app

---

### **UC-C02: Tìm & Khám phá Nhà Hàng**
- Vào Home → Request GPS
- GET /restaurants?lat=X&lng=Y&radius=5000 → Hiển thị nearby
- Lọc category, sắp xếp (nearby, rating, best selling)
- Xem chi tiết: info, menu, rating, giờ mở

---

### **UC-C03: Xem Menu & Thêm vào Giỏ**
- Nhấn nhà hàng → GET /menus/:restaurant_id
- Xem sản phẩm theo danh mục → Chi tiết giá, ảnh, mô tả
- Chọn số lượng → POST /carts/add
- Có thể thêm nhiều sản phẩm, xem giỏ realtime

---

### **UC-C04: Quản Lý Giỏ & Thanh Toán**
- Cart page: Xem items → PATCH (cập nhật qty) / DELETE (xóa)
- Nhập mã khuyến mãi: GET /promotions?code=X → Tính discount
- Chọn delivery address: GET /addresses
- Chọn payment method (MoMo / Cash)
- Review tổng: subtotal + delivery_fee - discount = total_amount

---

### **UC-C05: Đặt Hàng (Place Order)**
- Review order → Nhấn "Place Order"
- POST /orders { user_id, restaurant_id, items[], address_id, payment_method, total_amount, discount_code, special_instructions }
- Nhận order_id + status = "pending"
- DELETE /carts/clear

---

### **UC-C06: Thanh Toán**
- **Nếu MoMo:**
  - POST /payments → Nhận payment_url
  - Redirect sang MoMo
  - User confirm → MoMo callback (orderId, requestId, success)
  - POST /payments/callback → PATCH /orders { status: "confirmed" }
  
- **Nếu Cash:**
  - Order status = "pending", chờ restaurant confirm
  - POST /payments { status: "pending" }

---

### **UC-C07: Theo Dõi Đơn Hàng Realtime**
- MyOrders → Xem order → OrderDetail
- Xem items, address, status hiện tại
- Nếu status = "shipping" → WebSocket subscribe
- Xem GPS drone/shipper trên bản đồ (realtime update)
- Thông báo khi status thay đổi (pending → confirming → preparing → ready → shipping → completed)

---

### **UC-C08: Đánh Giá & Review**
- MyOrders → Order completed → "Review"
- Chọn sao (1-5), viết comment, upload ảnh
- POST /reviews { menu_id, restaurant_id, rating, comment }
- Cập nhật rating trung bình sản phẩm & nhà hàng

---

### **UC-C09: Quản Lý Tài Khoản & Địa Chỉ**
- Profile → Tab "Account": cập nhật name, phone, gender, dob, avatar
- Tab "Addresses": thêm/sửa/xóa/set default địa chỉ giao
- Xem GPS, ghi chú từng địa chỉ

---

## **2️⃣ RESTAURANT - 8 CORE UC**

### **UC-R01: Đăng Nhập**
- Email + password → POST /auth/login
- Kiểm tra role = "restaurant_owner", status = "active"
- Vào dashboard

---

### **UC-R02: Quản Lý Menu (Add/Edit/Delete)**
- List/Add page → GET /menus/:restaurant_id
- **Thêm:** Nhập name, description, price, category, image → POST /menus
- **Sửa:** Chọn product → PATCH /menus/:id
- **Xóa:** DELETE /menus/:id (nếu không có order)
- **Activate/Deactivate:** Toggle available → PATCH /menus/:id { is_available }

---

### **UC-R03: Xem & Quản Lý Đơn Hàng**
- Orders page → GET /orders?restaurant_id=X
- Lọc status (pending, confirming, preparing, ready, shipping, completed, cancelled)
- Xem danh sách orders: customer, items, total, status

---

### **UC-R04: Cập Nhật Trạng Thái Đơn & Giao Hàng**
- OrderDetail → Các nút button:
  - "Confirm" (pending → confirming)
  - "Start Preparing" (confirming → preparing)
  - "Ready" (preparing → ready)
  - "Assign Delivery" (ready → shipping)
- PATCH /orders/:id { status }
- Mỗi lần: WebSocket notify customer
- Khi shipping: assign drone nếu có

---

### **UC-R05: Từ Chối/Hủy Đơn**
- OrderDetail → "Reject" hoặc "Cancel"
- Nhập lý do → PATCH /orders/:id { status: "cancelled", reason }
- Hoàn tiền tự động (nếu đã pay)
- Notify customer

---

### **UC-R06: Xem Báo Cáo Doanh Thu & Sản Phẩm Bán Chạy**
- Dashboard: doanh số hôm nay/tuần/tháng, số orders, rating
- Reports: chọn date range → chi tiết doanh thu per day/week/month
- Top products: sản phẩm bán chạy nhất

---

### **UC-R07: Quản Lý Giờ Mở Cửa & Cài Đặt**
- RestaurantProfile → Tab "Hours"
- Nhập opening_hours { monday: {open, close}, ... }
- PUT /restaurants/:id → Khách sẽ thấy "Closed" ngoài giờ

---

### **UC-R08: Tạo Mã Khuyến Mãi**
- Promotions → "Add Promotion"
- Nhập code, discount value, expiry_date, min_order_amount
- POST /promotions
- Khách dùng: GET /promotions?code=X verify khi checkout

---

## **3️⃣ ADMIN - 8 CORE UC**

### **UC-A01: Đăng Nhập Admin**
- Email + password → POST /auth/login (role = admin)
- Vào admin dashboard

---

### **UC-A02: Duyệt Nhà Hàng Mới (Approval)**
- Restaurants → Lọc status = "pending"
- Xem chi tiết: chủ, thông tin nhà hàng, address
- **Approve:** PATCH /restaurants/:id { status: "active" } + PATCH /users { status: "active" }
- **Reject:** PATCH /restaurants/:id { status: "blocked", reason }
- Gửi email thông báo

---

### **UC-A03: Khóa/Mở Nhà Hàng (Nếu Vi Phạm)**
- Restaurants → Nhấn "Block" / "Unblock"
- PATCH /restaurants/:id { status: "blocked" | "active" }
- Khách không thể đặt khi blocked

---

### **UC-A04: Quản Lý Khách Hàng (Block/Delete)**
- Users → Lọc role = "customer"
- **Block:** PATCH /users/:id { status: "blocked" } → Khách không thể login
- **Unblock:** PATCH /users/:id { status: "active" }
- **Delete:** DELETE /users/:id (chỉ khi không có orders)

---

### **UC-A05: Xem Tất Cả Đơn Hàng & Báo Cáo Doanh Thu**
- Orders page → GET /orders (toàn hệ thống)
- Lọc status, date, restaurant
- Reports: chọn date range → tổng doanh thu, số orders, completion rate
- Revenue per restaurant

---

### **UC-A06: Quản Lý Drone (Add/Edit/Delete/Lock)**
- Delivery → Drones
- **Xem:** Danh sách drones + status (available, busy, offline)
- **Thêm:** POST /drones { identifier, latitude, longitude, max_weight_kg }
- **Sửa:** PATCH /drones/:id
- **Xóa:** DELETE /drones/:id (chỉ khi idle)
- **Lock/Unlock:** PATCH /drones/:id { status }

---

### **UC-A07: Xem Tracking Giao Hàng Realtime**
- Delivery → Map
- Hiển thị bản đồ: tất cả drones + orders đang giao
- WebSocket subscribe update vị trí realtime

---

### **UC-A08: Xem Dashboard KPI Chính**
- Dashboard: doanh số (hôm nay/tuần/tháng/năm)
- Số đơn, users, restaurants
- Completion rate, avg rating
- Top customers, top restaurants

---

## 📊 **TỔNG CỘNG: 25 CORE UC**

| **Actor** | **CORE UC** | **Chức năng** |
|-----------|-----------|------------|
| **CUSTOMER** | 9 | Login, Browse, Add to Cart, Checkout, Payment, Track, Review, Account, Addresses |
| **RESTAURANT** | 8 | Login, Menu Mgmt, Order Mgmt, Status Update, Reports, Hours, Promotions |
| **ADMIN** | 8 | Login, Restaurant Approval, Block User, Orders Report, Drone Mgmt, Tracking, Dashboard |

---

## 🎯 **Các Luồng Chính (Main Flows)**

### **1. Purchase Flow (Khách → Nhà hàng → Admin)**
```
Customer Login 
  ↓
Browse Restaurants & Menu (UC-C02, C03)
  ↓
Add to Cart & Manage (UC-C04)
  ↓
Place Order + Payment (UC-C05, C06)
  ↓
Restaurant Confirms (UC-R04)
  ↓
Restaurant Prepares (UC-R04)
  ↓
Ready for Delivery (UC-R04)
  ↓
Assign Drone (UC-R04, A06)
  ↓
Customer Track Realtime (UC-C07, A07)
  ↓
Completed → Review (UC-C08)
```

### **2. Restaurant Setup Flow (Admin → Restaurant)**
```
Restaurant Registers
  ↓
Admin Approves (UC-A02)
  ↓
Restaurant Login (UC-R01)
  ↓
Setup Menu (UC-R02)
  ↓
Setup Hours & Promotions (UC-R07, R08)
  ↓
Ready to receive orders
```

### **3. Monitoring Flow (Admin)**
```
Dashboard (UC-A08)
  ↓
All Orders Report (UC-A05)
  ↓
All Restaurants (UC-A03)
  ↓
Drone Tracking (UC-A07)
```

---

## ✅ **Key Features Liên Quan Trực Tiếp Mua Hàng**
- ✔️ **Authentication:** Đăng ký, đăng nhập
- ✔️ **Product Discovery:** Tìm nhà hàng, xem menu
- ✔️ **Shopping:** Giỏ hàng, quản lý items
- ✔️ **Checkout:** Địa chỉ, khuyến mãi, payment
- ✔️ **Order Tracking:** Realtime GPS, status updates
- ✔️ **Payment:** MoMo, tiền mặt
- ✔️ **Review:** Đánh giá sản phẩm & nhà hàng
- ✔️ **Order Management:** Restaurant confirm & process
- ✔️ **Delivery:** Admin quản lý drone & tracking
- ✔️ **Reports:** Dashboard & revenue analytics

---

## ❌ **Features NOT Core (loại bỏ)**
- ❌ Quên mật khẩu (hệ thống không có)
- ❌ Edit/Delete reviews (không cần thiết)
- ❌ Admin tạo user manually (ít dùng)
- ❌ Category management detail (là feature phụ)
- ❌ Audit log (là feature support, không liên quan mua hàng)
