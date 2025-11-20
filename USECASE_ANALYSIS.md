# 📋 USE CASE ANALYSIS - FOOD DELIVERY SYSTEM

## 🎯 Tóm tắt
**Tổng cộng: 47 UC** (gom chung các flow liên quan)

---

## **1️⃣ ACTOR: CUSTOMER (Khách hàng) - 16 UC**

### **Authentication & Account (3 UC)**

#### **UC-C01: Đăng ký & Đăng nhập**
- Người dùng chưa có tài khoản → Đăng ký (email, mật khẩu, name, phone)
- Hoặc: Có tài khoản → Đăng nhập (email, password)
- Hệ thống verify → Kiểm tra status (blocked/active) → Tạo session → Vào app
- **Lưu ý:** Khách đăng ký nhà hàng thì được redirect đặc biệt

---

#### **UC-C02: Quản lý tài khoản & địa chỉ**
- Vào Profile → Tab Account: cập nhật name, phone, gender, dob, avatar
- Tab Addresses: xem/thêm/sửa/xóa/set default các địa chỉ giao hàng
- Xem GPS, ghi chú cho từng địa chỉ
- Tất cả cập nhật PUT /users/:id hoặc POST/PATCH/DELETE /addresses

---

#### **UC-C03: Đăng xuất**
- Xóa session, token, user info
- Quay về login page

---

### **Discovery & Browsing (3 UC)**

#### **UC-C04: Tìm & khám phá nhà hàng**
- Vào Home → Request GPS location
- Hiển thị "Nearby Restaurants" (GET /restaurants?lat=X&lng=Y&radius=5000)
- Lọc theo category (Pizza, Gà rán, v.v.)
- Sắp xếp (nearby, top rated, best selling)
- Xem chi tiết nhà hàng: thông tin, menu, giờ mở, rating

---

#### **UC-C05: Xem menu & chi tiết sản phẩm**
- Từ nhà hàng → Xem menu (GET /menus/:restaurant_id)
- Menu chia theo danh mục
- Nhấn sản phẩm → Popup xem giá, mô tả, ảnh, tùy chọn (size, topping)
- Từ đây có thể thêm vào cart

---

#### **UC-C06: Xem danh sách & chi tiết đơn hàng cũ**
- MyOrders page → Danh sách tất cả orders của khách
- Lọc theo status (all, pending, confirmed, preparing, ready, shipping, completed, cancelled)
- Nhấn order → Xem chi tiết: items, address, payment, status
- Nếu status = "shipping" → Xem GPS tracking realtime của drone/shipper (WebSocket)
- Thông báo realtime khi status thay đổi

---

### **Shopping & Checkout (4 UC)**

#### **UC-C07: Quản lý giỏ hàng (add, update, remove)**
- Từ menu → Add product (chọn số lượng, ghi chú) → POST /carts/add
- Cart page → Xem items, cập nhật quantity (PATCH /carts/item/:id), xóa (DELETE /carts/item/:id)
- Tính tự động subtotal
- DELETE /carts/clear khi checkout xong

---

#### **UC-C08: Checkout hoàn chỉnh (địa chỉ, khuyến mãi, payment method, place order)**
- CheckOut page → Chọn delivery address (GET /addresses)
- Nhập/chọn mã khuyến mãi (GET /promotions?code=X verify) → Tính discount
- Chọn payment method (MoMo hoặc Cash)
- Nhập special instructions
- Review: subtotal, delivery fee, discount, total
- POST /orders → Nhận order_id
- **Nếu MoMo:** Redirect sang payment link → MoMo callback verify → POST /payments/callback → Order status = "confirmed"
- **Nếu Cash:** Order status = "pending", chờ restaurant confirm
- DELETE /carts/clear → Redirect Tracking page

---

#### **UC-C09: Hủy đơn hàng (khi còn cho phép)**
- MyOrders → Xem order (status = pending hoặc confirmed) → Nhấn "Cancel"
- POST /orders/:id/cancel → Order status = "cancelled"
- Nếu đã thanh toán → Hoàn tiền tự động
- Thông báo restaurant

---

### **Reviews & Ratings (2 UC)**

#### **UC-C10: Đánh giá sản phẩm & nhà hàng**
- MyOrders → Order completed → Button "Review"
- Modal review: chọn sao (1-5), viết comment, upload ảnh
- POST /reviews { menu_id, restaurant_id, rating, comment, images }
- Cập nhật trung bình rating của sản phẩm & nhà hàng

---

#### **UC-C11: Xem bình luận/đánh giá khác**
- RestaurantDetail → Reviews tab
- Xem danh sách reviews, lọc theo sao, sắp xếp

---

### **Special: Register as Restaurant Owner (2 UC)**

#### **UC-C12: Đăng ký trở thành chủ nhà hàng**
- Khách hàng (hoặc người lạ) → RegisterRestaurant page
- Nhập thông tin chủ (name, email, password, phone) + nhà hàng (name, address, description)
- Validation: email không duplicate
- POST /restaurants/register → Tạo Restaurant (status = "pending")
- POST /users/register-owner → Tạo User (role = "restaurant_owner", status = "pending")
- Chờ admin duyệt
- Thông báo email cho admin

---

#### **UC-C13: Xem trạng thái yêu cầu nhà hàng**
- Login bằng email nhà hàng vừa đăng ký → Kiểm tra status
- Nếu status = "pending" → Hiển thị "Awaiting approval"
- Nếu status = "active" → Redirect vào restaurant dashboard
- Nếu status = "blocked" → Alert lý do từ chối

---

### **Other (1 UC)**

#### **UC-C14: Mua hàng lần đầu (as guest flow tùy chọn)**
- Nếu hệ thống cho phép guest checkout (tùy design)
- Nhập email tạm → Không save vào database

---

## **TỔNG: 16 UC CUSTOMER**

---

## **2️⃣ ACTOR: RESTAURANT (Chủ nhà hàng) - 17 UC**

### **Authentication & Account (3 UC)**

#### **UC-R01: Đăng ký & Đăng nhập (sau khi admin approve)**
- Restaurant owner nhập email & password
- POST /auth/login → Kiểm tra role = "restaurant_owner", status = "active"
- Nếu status = "pending" → Alert chờ admin duyệt
- Nếu status = "blocked" → Alert bị từ chối
- Nếu active → Tạo session → Vào dashboard

---

#### **UC-R02: Cập nhật thông tin tài khoản & nhà hàng**
- RestaurantProfile page
- Tab "Account": cập nhật name, email, phone, avatar → PUT /users/:id
- Tab "Restaurant": cập nhật name, description, address, location, image, banner, opening_hours, phone → PUT /restaurants/:id

---

#### **UC-R03: Đăng xuất**
- Xóa session, token

---

### **Menu Management (4 UC)**

#### **UC-R04: Quản lý menu (xem, thêm, sửa, xóa, update status)**
- List/Add page → GET /menus/:restaurant_id
- **Thêm:** Button "Add Product" → Modal → Nhập name, description, price, category, image → POST /menus
- **Sửa:** Nhấn "Edit" → Modal → Cập nhật info → PATCH /menus/:id
- **Xóa:** Nhấn "Delete" → DELETE /menus/:id (chỉ khi không có order)
- **Update status:** Toggle "Available/Unavailable" → PATCH /menus/:id { is_available }
- Upload ảnh: POST /upload

---

#### **UC-R05: Quản lý danh mục menu**
- Category page → Xem danh sách categories
- Thêm: POST /menus/categories
- Sửa: PATCH /menus/categories/:id
- Xóa: DELETE /menus/categories/:id (chỉ khi trống)

---

#### **UC-R06: Quản lý giờ mở cửa & cài đặt nhà hàng**
- RestaurantProfile → Tab "Hours"
- Nhập opening_hours cho từng ngày (monday-sunday)
- Format: { open: "09:00", close: "22:00" }
- PUT /restaurants/:id
- Khách sẽ thấy "Closed" nếu ngoài giờ

---

#### **UC-R07: Tạo & quản lý mã khuyến mãi**
- Promotions page
- **Thêm:** POST /promotions { code, discount_type, discount_value, expiry_date, usage_limit, min_order_amount }
- **Sửa:** PATCH /promotions/:id
- **Xóa:** DELETE /promotions/:id
- Xem thống kê: số lần dùng, tổng tiền giảm

---

### **Order Management (5 UC)**

#### **UC-R08: Xem & quản lý danh sách đơn hàng**
- Orders page → GET /orders?restaurant_id=X
- Lọc theo status (all, pending, confirming, preparing, ready, shipping, completed, cancelled)
- Tìm kiếm theo order ID
- Xem order card: customer, items, total, status, time

---

#### **UC-R09: Xem chi tiết đơn hàng & liên hệ khách**
- Orders → Nhấn vào order → OrderDetail
- Xem items, customer info, delivery address, payment method
- Nút "Call" hoặc "SMS" customer
- Xem thời gian đặt, dự kiến giao

---

#### **UC-R10: Cập nhật trạng thái đơn hàng (flow: pending → confirming → preparing → ready → shipping)**
- OrderDetail → Nhấn button tương ứng
- **"Confirm":** pending → confirming
- **"Start Preparing":** confirming → preparing
- **"Ready":** preparing → ready (gọi shipper/drone)
- **"Shipping":** ready → shipping
- Mỗi lần thay đổi: PATCH /orders/:id { status }, WebSocket emit notification cho customer
- Khi shipping: assign drone nếu có

---

#### **UC-R11: Từ chối/Hủy đơn hàng**
- OrderDetail → Nhấn "Reject" hoặc "Cancel"
- Modal: nhập lý do
- PATCH /orders/:id { status: "cancelled", reason }
- Hoàn tiền tự động nếu đã thanh toán
- Thông báo customer qua WebSocket

---

#### **UC-R12: Xem báo cáo & thống kê (doanh thu, sản phẩm bán chạy, orders)**
- Dashboard → Hiển thị:
  - Doanh số hôm nay, tuần, tháng
  - Số đơn, completion rate
  - Top products, rating trung bình
- Reports page → Chọn date range → Xem chi tiết doanh thu, sản phẩm bán chạy, lợi nhuận

---

### **Reviews & Interaction (1 UC)**

#### **UC-R13: Xem & trả lời bình luận/đánh giá**
- Reviews page → Danh sách reviews (sản phẩm & nhà hàng)
- Xem từng review → Nhấn "Reply" → POST /reviews/:id/replies { message }
- Xem reply history

---

### **Other (1 UC)**

#### **UC-R14: Kích hoạt/tắt nhận đơn hàng**
- Dashboard/Settings → Toggle "Accept Orders"
- Khi tắt: khách không thể đặt hàng tại nhà hàng này

---

## **TỔNG: 17 UC RESTAURANT**

---

## **3️⃣ ACTOR: ADMIN (Quản trị viên) - 14 UC**

### **Authentication (1 UC)**

#### **UC-A01: Đăng nhập admin**
- Email + password → POST /auth/login
- Kiểm tra role = "admin"
- Tạo session → Vào dashboard

---

### **User Management (3 UC)**

#### **UC-A02: Quản lý khách hàng (view, block, delete)**
- Users page → Lọc status (active, blocked)
- Tìm kiếm email/name/phone
- **Xem chi tiết:** UserDetail → orders history, addresses
- **Khóa:** Nhấn "Block" → PATCH /users/:id { status: "blocked" } → Khách không thể login
- **Mở khóa:** PATCH /users/:id { status: "active" }
- **Xóa:** DELETE /users/:id (chỉ khi không có orders)

---

#### **UC-A03: Quản lý tài khoản admin (view, add, delete)**
- Admins page → Danh sách admin accounts
- **Thêm:** Button "Add Admin" → POST /users { role: "admin", ... }
- **Xóa:** DELETE /users/:id

---

#### **UC-A04: Xem lịch sử hoạt động (audit log - optional)**
- Logs page → Hiển thị tất cả actions (login, create, update, delete)
- Lọc theo user, hành động, ngày

---

### **Restaurant Approval & Management (4 UC)**

#### **UC-A05: Duyệt yêu cầu nhà hàng mới (pending → active/blocked)**
- Restaurants page → Lọc status = "pending"
- Xem chi tiết: thông tin nhà hàng, chủ, địa chỉ
- **Approve:** PATCH /restaurants/:id { status: "active" } + PATCH /users/:owner_id { status: "active" } → Gửi email thông báo owner
- **Reject:** PATCH /restaurants/:id { status: "blocked", reason } + PATCH /users/:owner_id { status: "blocked" } → Thông báo owner

---

#### **UC-A06: Khóa/Mở khóa nhà hàng (khi vi phạm chính sách)**
- Restaurants page → Nhấn "Block" hoặc "Unblock"
- Modal: nhập lý do (optional)
- PATCH /restaurants/:id { status: "blocked" | "active" }
- Khách không thể đặt khi blocked, nhà hàng không thể login

---

#### **UC-A07: Xem chi tiết nhà hàng & quản lý**
- Restaurants → Nhấn vào restaurant → RestaurantDetail
- Xem: menu, orders history, reviews, doanh số
- Có thể edit thông tin hộ nếu cần
- Xóa nhà hàng: DELETE /restaurants/:id (chỉ khi không có orders)

---

#### **UC-A08: Quản lý danh mục hệ thống & cài đặt**
- Settings page
- **Categories:** Thêm/sửa/xóa danh mục chính (Pizza, Gà rán, v.v.)
- **Settings:** Cập nhật delivery fee, min order, v.v. → PATCH /settings

---

### **Order & Payment Management (2 UC)**

#### **UC-A09: Xem tất cả đơn hàng & báo cáo**
- Orders page → GET /orders (tất cả orders hệ thống)
- Lọc theo status, date, restaurant
- Xem chi tiết
- **Reports:** Chọn date range → Xem:
  - Tổng doanh thu, số orders
  - Completion rate, cancel rate
  - Revenue per restaurant

---

#### **UC-A10: Quản lý thanh toán & khuyến mãi hệ thống**
- Payments page → Xem tất cả transactions, lọc status (pending, success, failed)
- **Promotions:** Xem/thêm/sửa/xóa mã khuyến mãi toàn hệ thống
- Xem thống kê: số lần dùng, tổng tiền giảm

---

### **Drone Management (2 UC)**

#### **UC-A11: Quản lý drone (view, add, edit, delete, lock/unlock)**
- Delivery → Drones tab
- **Xem:** Danh sách tất cả drones với status (available, busy, offline)
- **Thêm:** POST /drones { identifier, latitude, longitude, max_weight_kg, current_location }
- **Sửa:** PATCH /drones/:id
- **Xóa:** DELETE /drones/:id (chỉ khi idle)
- **Lock/Unlock:** PATCH /drones/:id { status: "locked" | "available" } (chỉ khi idle)
- Xem GPS location realtime

---

#### **UC-A12: Xem tracking giao hàng realtime (all drones)**
- Delivery → Map tab
- Hiển thị bản đồ với vị trí tất cả drones & orders đang giao
- WebSocket subscribe để update realtime

---

### **Analytics & Reports (2 UC)**

#### **UC-A13: Xem dashboard KPI chính**
- Dashboard page → Widgets:
  - Doanh số hôm nay, tuần, tháng, năm
  - Số đơn hàng, users, restaurants
  - Completion rate, average rating
  - Top customers, top restaurants

---

#### **UC-A14: Xem báo cáo chi tiết (users, drones, v.v.)**
- Reports page
- **Users:** Số users mới, active users, blocked users
- **Restaurants:** Doanh số per restaurant, new registrations
- **Delivery:** Drone efficiency, success rate, avg delivery time
- Xuất báo cáo (tùy chọn)

---

### **Other (1 UC)**

#### **UC-A15: Đăng xuất**
- Xóa session

---

## **TỔNG: 14 UC ADMIN**

---

# 📊 **TỔNG KẾT**

| **Actor** | **Số UC** | **Chi tiết** |
|-----------|-----------|------------|
| **CUSTOMER** | 16 | Auth, Browse, Cart, Checkout, Payment, Tracking, Review, Become Restaurant |
| **RESTAURANT** | 17 | Auth, Menu Mgmt, Order Mgmt, Promotions, Reports, Reviews |
| **ADMIN** | 14 | Users, Restaurants, Orders, Payments, Drones, Analytics |
| **TỔNG** | **47 UC** | |

---

## 🎯 **Mỗi UC = 1 Activity Diagram = 1 Sequence Diagram**

### **Ví dụ:**
- **UC-C08** (Checkout) bao gồm: chọn địa chỉ, áp dụng khuyến mãi, chọn payment method, tạo order, xử lý payment, cập nhật cart → 1 flow hoàn chỉnh
- **UC-R10** (Update Order Status) bao gồm: multiple state transitions (pending→confirming→preparing→ready→shipping) → 1 flow
- **UC-A05** (Duyệt nhà hàng) bao gồm: kiểm tra thông tin, approve/reject, update 2 entities (restaurant + user), gửi email → 1 flow

Mỗi UC có:
- **Main flow:** Hành động chính của user
- **Alternative flows:** Các nhánh xử lý lỗi, edge cases
- **Preconditions:** Điều kiện trước khi thực hiện
- **Postconditions:** Kết quả sau khi hoàn thành
