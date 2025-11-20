# 📊 BUSINESS PROCESS & USER STORIES

---

## **PART 1: QUY TRÌNH NGHIỆP VỤ (BUSINESS PROCESS)**

### **BP1: Quy Trình Mua Hàng Trực Tuyến**

```
┌─────────────────────────────────────────────────────────────────┐
│                    KHÁCH HÀNG TÌM KIẾM & ĐẶT HÀNG              │
└─────────────────────────────────────────────────────────────────┘

START: Khách hàng muốn đặt đồ ăn
  │
  ├─ Điều kiện: Khách đã đăng ký & đăng nhập
  │
  ▼
┌─ Tìm Kiếm ────────────────────┐
│ 1. Gửi vị trí GPS             │
│ 2. Hệ thống tìm nhà hàng gần  │
│ 3. Lọc theo danh mục          │
│ 4. Khách chọn nhà hàng        │
└─ Duyệt Menu ─────────────────┐
             │
             ▼
       ┌─────────────────────────────┐
       │ 1. Xem menu nhà hàng       │
       │ 2. Xem giá & ảnh sản phẩm  │
       │ 3. Chọn sản phẩm          │
       └─ Thêm Giỏ ──────────────────┐
                      │
                      ▼
              ┌──────────────────────┐
              │ 1. Nhập số lượng     │
              │ 2. Thêm vào giỏ     │
              │ 3. Có thể add thêm   │
              └─ Thanh Toán ─────────┐
                           │
                           ▼
                   ┌────────────────────────┐
                   │ 1. Chọn địa chỉ giao  │
                   │ 2. Nhập khuyến mãi    │
                   │ 3. Chọn thanh toán    │
                   │ 4. Review tổng tiền   │
                   └─ Đặt Hàng ──────────────┐
                                   │
                                   ▼
                           ┌─────────────────────┐
                           │ 1. Confirm đơn      │
                           │ 2. Tạo Order ID     │
                           │ 3. Xóa giỏ          │
                           └─ Thanh Toán ────────┐
                                         │
                        ┌────────────────┴────────────────┐
                        │                                 │
                    MoMo Pay                        Cash on Delivery
                        │                                 │
                        ▼                                 ▼
            ┌──────────────────────┐      ┌──────────────────────┐
            │ 1. Redirect MoMo    │      │ 1. Chờ restaurant   │
            │ 2. User confirm     │      │    confirm          │
            │ 3. MoMo callback    │      │ 2. Status: pending  │
            │ 4. Verify payment   │      │ 3. Chờ giao hàng    │
            │ 5. Order confirmed  │      └──────────────────────┘
            └──────────────────────┘
                        │
                        └────────────────┬────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────┐
                        │ TRACKING REALTIME            │
                        │ 1. WebSocket subscribe       │
                        │ 2. Xem status thay đổi:      │
                        │    pending → confirming →    │
                        │    preparing → ready →       │
                        │    shipping → completed      │
                        │ 3. Xem GPS drone trên bản đồ│
                        │ 4. Nhận thông báo            │
                        └──────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────┐
                        │ ĐƠN HÀNG HOÀN THÀNH          │
                        │ 1. Nhận hàng                 │
                        │ 2. Thanh toán tiền mặt (nếu) │
                        │ 3. Xác nhận nhận hàng        │
                        │ 4. Order completed           │
                        └──────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────┐
                        │ ĐÁNH GIÁ & REVIEW            │
                        │ 1. Rate sao (1-5)            │
                        │ 2. Viết comment              │
                        │ 3. Upload ảnh                │
                        │ 4. Submit review             │
                        └──────────────────────────────┘
                                         │
                                         ▼
                                       END
```

---

### **BP2: Quy Trình Xử Lý Đơn Hàng (Nhà Hàng)**

```
┌──────────────────────────────────────────────────────────────────┐
│              NHÀ HÀNG NHẬN & XỬ LÝ ĐƠN HÀNG                      │
└──────────────────────────────────────────────────────────────────┘

START: Khách đặt hàng thành công
  │
  ▼
┌─────────────────────────────────────────┐
│ NHẬN THÔNG BÁO                          │
│ 1. Email/SMS thông báo đơn mới          │
│ 2. Order xuất hiện trong danh sách      │
│ 3. Xem chi tiết: khách, items, address  │
└─ Confirm Đơn ───────────────────────────┐
        │
        ▼
┌─────────────────────────────────────────┐
│ XÁC NHẬN ĐƠN HÀNG                       │
│ 1. Kiểm tra kho: có đủ sản phẩm?      │
│ 2. Nếu không → Reject với lý do        │
│ 3. Nếu có → Accept order               │
│ 4. Status: pending → confirming        │
│ 5. Notify customer                      │
└─ Chuẩn Bị Hàng ────────────────────────┐
        │
        ▼
┌─────────────────────────────────────────┐
│ CHUẨN BỊ ĐƠN HÀNG                       │
│ 1. Chọn sản phẩm từ kho                 │
│ 2. Kiểm tra chất lượng                  │
│ 3. Đóng gói                             │
│ 4. Status: confirming → preparing      │
│ 5. Notify customer                      │
└─ Sẵn Sàng Giao ────────────────────────┐
        │
        ▼
┌─────────────────────────────────────────┐
│ HOÀN THÀNH CHUẨN BỊ                     │
│ 1. Đóng gói xong, kiểm tra lại         │
│ 2. Đặt trên quầy chờ shipper/drone    │
│ 3. Status: preparing → ready           │
│ 4. Notify customer (sắp giao)          │
└─ Giao Cho Shipper/Drone ───────────────┐
        │
        ▼
┌─────────────────────────────────────────┐
│ GIAO HÀNG                               │
│ 1. Admin assign drone/shipper           │
│ 2. Shipper lấy hàng                     │
│ 3. Status: ready → shipping            │
│ 4. Notify customer + GPS tracking      │
│ 5. Khách tracking realtime              │
└─ Hoàn Thành ───────────────────────────┐
        │
        ▼
┌─────────────────────────────────────────┐
│ ĐƠN HÀNG HOÀN THÀNH                     │
│ 1. Shipper giao cho khách               │
│ 2. Khách xác nhận nhận hàng             │
│ 3. Status: shipping → completed        │
│ 4. Tính doanh thu                       │
└─────────────────────────────────────────┘
                   │
                   ▼
              Khách Review
```

---

### **BP3: Quy Trình Quản Lý Hệ Thống (Admin)**

```
┌──────────────────────────────────────────────────────────────────┐
│              ADMIN QUẢN LÝ & GIÁM SÁT HỆ THỐNG                   │
└──────────────────────────────────────────────────────────────────┘

START: Admin đăng nhập
  │
  ▼
┌──────────────────────────────────────────┐
│ DASHBOARD & MONITORING                   │
│ 1. Xem KPI: doanh số, số orders         │
│ 2. Xem tất cả orders đang xử lý         │
│ 3. Xem drone status & location          │
│ 4. Xem restaurants hoạt động            │
└──────────────────────────────────────────┘
         │
         ├─ QUẢN LÝ NHÀ HÀNG
         │  │
         │  ▼
         │ ┌──────────────────────────────┐
         │ │ DUYỆT NHÀ HÀNG MỚI (PENDING) │
         │ │ 1. Xem danh sách pending     │
         │ │ 2. Xem chi tiết: chủ, info  │
         │ │ 3. Approve → active         │
         │ │ 4. Or Reject → blocked      │
         │ │ 5. Notify owner             │
         │ └──────────────────────────────┘
         │
         ├─ QUẢN LÝ USERS
         │  │
         │  ▼
         │ ┌──────────────────────────────┐
         │ │ BLOCK/UNBLOCK CUSTOMER       │
         │ │ 1. Xem danh sách users      │
         │ │ 2. Tìm user vi phạm         │
         │ │ 3. Block (banned from app)   │
         │ │ 4. Or Unblock               │
         │ └──────────────────────────────┘
         │
         ├─ QUẢN LÝ DRONE
         │  │
         │  ▼
         │ ┌──────────────────────────────┐
         │ │ DRONE MANAGEMENT             │
         │ │ 1. Xem tất cả drones         │
         │ │ 2. Thêm drone mới            │
         │ │ 3. Lock/Unlock drone         │
         │ │ 4. Xem vị trí realtime       │
         │ │ 5. Xem orders đang giao      │
         │ └──────────────────────────────┘
         │
         └─ REPORTS & ANALYTICS
            │
            ▼
          ┌──────────────────────────────┐
          │ XEM BÁO CÁO DOANH THU        │
          │ 1. Chọn khoảng thời gian    │
          │ 2. Xem tổng doanh số        │
          │ 3. Xem per restaurant        │
          │ 4. Xem orders stats          │
          │ 5. Export báo cáo            │
          └──────────────────────────────┘
```

---

### **BP4: Quy Trình Khuyến Mãi & Chiết Khấu**

```
NHẬP MÃ KHUYẾN MÃI KÍCH HOẠT:
  │
  ├─ GET /promotions?code=ABC123
  │
  ├─ Verify:
  │  ├─ Code có tồn tại?
  │  ├─ Còn hạn sử dụng? (expiry_date > now)
  │  ├─ Còn lượt dùng? (usage_count < usage_limit)
  │  ├─ Đơn đủ tiền tối thiểu? (subtotal >= min_order_amount)
  │
  ├─ Tính Discount:
  │  ├─ Nếu discount_type = "percentage"
  │  │  → discount_amount = subtotal * discount_value / 100
  │  │
  │  └─ Nếu discount_type = "fixed"
  │     → discount_amount = discount_value
  │
  ├─ Cập Nhật Total:
  │  → total_amount = subtotal + delivery_fee - discount_amount
  │
  └─ Order thành công → usage_count++
```

---

## **PART 2: USER STORIES**

### **CUSTOMER USER STORIES**

#### **US-C01: Tìm Kiếm Nhà Hàng Gần Nhất**
```
AS A: Khách hàng đang đói
I WANT: Tìm những nhà hàng gần vị trí của tôi
SO THAT: Tôi có thể đặt hàng và nhận nó nhanh nhất

ACCEPTANCE CRITERIA:
✓ Khi mở app → hệ thống request GPS permission
✓ Hiển thị danh sách nhà hàng sắp xếp theo khoảng cách
✓ Có thể lọc theo loại hình (Pizza, Gà rán, v.v.)
✓ Xem được thông tin: tên, ảnh, rating, giờ mở cửa
✓ Nếu từ chối GPS → hiển thị "All Restaurants" (không sắp xếp)
✓ Nhấn nhà hàng → vào chi tiết menu

PRIORITY: HIGH
EFFORT: 3 điểm
```

---

#### **US-C02: Thêm Sản Phẩm Vào Giỏ Với Ghi Chú Đặc Biệt**
```
AS A: Khách hàng có yêu cầu khác biệt
I WANT: Thêm ghi chú cho từng sản phẩm (ít đường, no onion, v.v.)
SO THAT: Nhà hàng biết nhu cầu của tôi

ACCEPTANCE CRITERIA:
✓ Khi click vào sản phẩm → xem chi tiết & nhập số lượng
✓ Có textbox để ghi chú đặc biệt
✓ Nhấn "Add to Cart" → thêm vào, hiển thị "Item added" toast
✓ Giỏ hàng update realtime (hiển thị số items)
✓ Có thể xem giỏ bất cứ lúc nào

PRIORITY: MEDIUM
EFFORT: 3 điểm
```

---

#### **US-C03: Áp Dụng Mã Khuyến Mãi Trước Thanh Toán**
```
AS A: Khách hàng muốn tiết kiệm
I WANT: Nhập mã khuyến mãi và thấy được giảm giá trước khi thanh toán
SO THAT: Tôi biết chắc tiền cần trả bao nhiêu

ACCEPTANCE CRITERIA:
✓ Trên Cart/Checkout có textbox "Promo Code"
✓ Nhập code → hệ thống verify (có tồn tại, còn hạn, đơn đủ tiền)
✓ Nếu valid → hiển thị discount amount, tính lại total
✓ Nếu invalid → hiển thị error message rõ ràng
✓ Có thể remove promo → quay về giá gốc
✓ Có nút "Review Order" để xem tóm tắt trước khi submit

PRIORITY: HIGH
EFFORT: 5 điểm
```

---

#### **US-C04: Theo Dõi Đơn Hàng Realtime Trên Bản Đồ**
```
AS A: Khách hàng chờ hàng
I WANT: Xem vị trí drone/shipper trên bản đồ realtime
SO THAT: Tôi biết hàng sẽ đến lúc nào

ACCEPTANCE CRITERIA:
✓ Sau khi đặt hàng → tự động vào Tracking page
✓ Hiển thị bản đồ với:
  - Vị trí nhà hàng (pickup point)
  - Vị trí hiện tại của drone/shipper
  - Địa chỉ giao hàng (destination)
✓ GPS update realtime mỗi 5-10 giây
✓ Hiển thị thời gian dự kiến giao
✓ Order status thay đổi → thông báo realtime
✓ Có nút gọi/SMS shipper

PRIORITY: HIGH
EFFORT: 8 điểm (phức tạp vì WebSocket + Maps)
```

---

#### **US-C05: Quản Lý Nhiều Địa Chỉ Giao Hàng**
```
AS A: Khách hàng bận rộn
I WANT: Lưu 3-4 địa chỉ thường dùng (nhà, công ty, gym, v.v.)
SO THAT: Lần sau không cần nhập lại

ACCEPTANCE CRITERIA:
✓ Profile → Addresses tab
✓ Xem danh sách địa chỉ đã lưu
✓ Thêm địa chỉ mới:
  - Nhập address line, district, city, phone
  - Có nút "Get GPS" để lấy tọa độ tự động
✓ Sửa/Xóa địa chỉ
✓ Set 1 địa chỉ làm default
✓ Khi checkout → mặc định chọn địa chỉ default
✓ Có thể chọn địa chỉ khác nếu cần

PRIORITY: MEDIUM
EFFORT: 4 điểm
```

---

#### **US-C06: Đánh Giá & Xem Review Sản Phẩm**
```
AS A: Khách hàng tin tưởng cộng đồng
I WANT: Xem reviews của khách khác trước khi mua
SO THAT: Tôi biết sản phẩm có tốt không

ACCEPTANCE CRITERIA:
✓ RestaurantDetail → Food tab → Xem products
✓ Mỗi product có thể xem:
  - Trung bình rating (stars)
  - Số reviews
  - Danh sách reviews (user, sao, comment, ảnh, ngày)
✓ Lọc reviews theo sao (5★, 4★, v.v.)
✓ Sau khi order completed → có nút "Write Review"
✓ Review form: chọn sao (1-5), viết comment, upload ảnh
✓ Submit review → cập nhật rating trung bình

PRIORITY: MEDIUM
EFFORT: 5 điểm
```

---

#### **US-C07: Thanh Toán Bằng MoMo**
```
AS A: Khách hàng không có tiền mặt
I WANT: Thanh toán bằng ứng dụng MoMo
SO THAT: Đơn hàng được xác nhận ngay mà không cần chờ shipper

ACCEPTANCE CRITERIA:
✓ Checkout → Chọn "MoMo" payment method
✓ Place Order → Redirect sang trang MoMo
✓ MoMo app mở → confirm payment
✓ Quay lại app → Verify page kiểm tra thanh toán
✓ Nếu thành công → order status = "confirmed", vào Tracking
✓ Nếu thất bại → hiển thị error, khách có thể retry
✓ Order details hiển thị payment status

PRIORITY: HIGH
EFFORT: 6 điểm (tích hợp MoMo API)
```

---

#### **US-C08: Hủy Đơn Hàng Khi Cần**
```
AS A: Khách hàng thay đổi ý
I WANT: Hủy đơn hàng nếu nó chưa bắt đầu chuẩn bị
SO THAT: Tôi không bị mất tiền hoặc nhận hàng không cần

ACCEPTANCE CRITERIA:
✓ MyOrders → Order (status = pending hoặc confirming) → Button "Cancel"
✓ Confirm hủy → PATCH /orders/:id { status: "cancelled" }
✓ Nếu đã thanh toán → hoàn tiền tự động
✓ Hiển thị "Refunding..." → sau "Refund Completed"
✓ Order status = "cancelled" → xóa khỏi active orders
✓ Lý do hủy (tùy chọn)

PRIORITY: MEDIUM
EFFORT: 4 điểm
```

---

### **RESTAURANT USER STORIES**

#### **US-R01: Quản Lý Menu (Thêm/Sửa/Xóa Sản Phẩm)**
```
AS A: Chủ nhà hàng
I WANT: Dễ dàng thêm, sửa, xóa sản phẩm trên menu
SO THAT: Menu luôn up-to-date và khách hàng mua những gì tôi còn

ACCEPTANCE CRITERIA:
✓ Dashboard → Menu tab → Danh sách products
✓ Thêm: Button "Add Product" → Form:
  - Nhập name, description, price, category
  - Upload ảnh
  - Nút "Save" → POST /menus
✓ Sửa: Click "Edit" → Form pre-filled → PATCH /menus/:id
✓ Xóa: Click "Delete" → Confirm → DELETE /menus/:id
✓ Toggle "Available/Unavailable" → Ẩn sản phẩm khỏi menu
✓ Thay đổi ngay được → khách thấy menu updated

PRIORITY: HIGH
EFFORT: 5 điểm
```

---

#### **US-R02: Xác Nhận & Chuẩn Bị Đơn Hàng**
```
AS A: Nhân viên nhà hàng
I WANT: Xem danh sách orders đến và cập nhật trạng thái
SO THAT: Khách biết đơn hàng được xử lý

ACCEPTANCE CRITERIA:
✓ Orders tab → Danh sách orders (realtime, incoming at top)
✓ Mỗi order hiển thị:
  - Order ID, customer name, items, address
  - Thời gian đặt
  - Payment status
✓ Click order → OrderDetail:
  - Danh sách items (qty, name, ghi chú đặc biệt)
  - Customer phone → nút call/SMS
  - Địa chỉ giao
✓ Buttons: "Confirm" → "Start Preparing" → "Ready" → "Shipping"
✓ Mỗi lần bấm → status update, customer được notify

PRIORITY: HIGH
EFFORT: 6 điểm
```

---

#### **US-R03: Từ Chối Đơn Hàng Nếu Hết Hàng**
```
AS A: Nhân viên nhà hàng
I WANT: Reject đơn hàng khi không có đủ sản phẩm
SO THAT: Khách hiểu lý do và được hoàn tiền

ACCEPTANCE CRITERIA:
✓ OrderDetail → Nút "Reject" hoặc "Cancel"
✓ Modal yêu cầu nhập lý do (select from list hoặc text)
✓ Bấm "Confirm Rejection" → POST /orders/:id/cancel
✓ Nếu khách đã thanh toán → hoàn tiền tự động
✓ Order status = "cancelled", khách nhận thông báo
✓ Lý do hiển thị cho khách

PRIORITY: MEDIUM
EFFORT: 3 điểm
```

---

#### **US-R04: Xem Báo Cáo Doanh Thu**
```
AS A: Chủ nhà hàng
I WANT: Xem chi tiết doanh thu theo ngày/tuần/tháng
SO THAT: Tôi biết kinh doanh đang thế nào

ACCEPTANCE CRITERIA:
✓ Dashboard → Cards hiển thị:
  - Doanh số hôm nay
  - Số orders hôm nay
  - Rating trung bình
  - Sản phẩm bán chạy top 5
✓ Reports tab → Date range picker
✓ Chọn date range → Hiển thị:
  - Tổng doanh thu (breakdown by day nếu range lớn)
  - Số orders completed
  - Top products (qty, revenue)
  - Discount used (total giảm giá)
✓ Export báo cáo (PDF hoặc CSV)

PRIORITY: MEDIUM
EFFORT: 6 điểm
```

---

#### **US-R05: Tạo Mã Khuyến Mãi Riêng**
```
AS A: Chủ nhà hàng muốn tăng sales
I WANT: Tạo các mã khuyến mãi cho nhà hàng của tôi
SO THAT: Khách hàng có động lực mua hàng

ACCEPTANCE CRITERIA:
✓ Promotions tab → Button "Add Promotion"
✓ Form:
  - Mã promotion (vd: "SUMMER50")
  - Loại giảm: Percentage (%) hoặc Fixed amount (VND)
  - Giá trị giảm (vd: 20% hoặc 50,000 VND)
  - Ngày bắt đầu - kết thúc
  - Giá trị tối thiểu order
  - Số lượt dùng tối đa
✓ Save → POST /promotions
✓ Danh sách promotions: xem, edit, delete, view usage stats
✓ Khách apply → hệ thống verify & tính discount tự động

PRIORITY: MEDIUM
EFFORT: 5 điểm
```

---

### **ADMIN USER STORIES**

#### **US-A01: Duyệt Yêu Cầu Đăng Ký Nhà Hàng Mới**
```
AS A: Quản trị viên hệ thống
I WANT: Xem & duyệt/reject các yêu cầu đăng ký nhà hàng mới
SO THAT: Chỉ những nhà hàng chất lượng mới được hoạt động

ACCEPTANCE CRITERIA:
✓ Dashboard → "Pending Approvals" widget
✓ Restaurants tab → Filter status = "pending"
✓ Danh sách pending restaurants:
  - Tên nhà hàng, chủ, email, phone
  - Địa chỉ
  - Loại hình
✓ Click → RestaurantDetail:
  - Xem toàn bộ thông tin
  - Preview menu (nếu đã có)
  - Buttons: "Approve" / "Reject"
✓ Approve → status = "active", owner status = "active"
  - Gửi email chúc mừng owner
  - Owner có thể login & bán hàng
✓ Reject → status = "blocked", owner status = "blocked"
  - Gửi email giải thích lý do
  - Yêu cầu reapply hoặc contact support

PRIORITY: HIGH
EFFORT: 4 điểm
```

---

#### **US-A02: Theo Dõi Giao Hàng Realtime (Tất Cả Drones)**
```
AS A: Quản trị viên giao vận
I WANT: Xem bản đồ realtime tất cả drones & orders đang giao
SO THAT: Tôi có thể tối ưu hóa và xử lý lỗi nhanh

ACCEPTANCE CRITERIA:
✓ Dashboard → Delivery tab → Map
✓ Bản đồ hiển thị:
  - Pin địa điểm tất cả restaurants
  - Icon drone (chỉ khi đang giao)
  - Pin customer address
  - Đường nối từ restaurant → drone → customer
✓ Drone marker: hover → xem order ID, khách, items
✓ Realtime update GPS mỗi 5 giây (WebSocket)
✓ Color coding: 
  - Green = on time
  - Yellow = at risk
  - Red = late
✓ List view: danh sách orders & drone assignments

PRIORITY: HIGH
EFFORT: 8 điểm (Maps API + WebSocket)
```

---

#### **US-A03: Quản Lý Drone (Thêm/Xóa/Lock)**
```
AS A: Quản trị viên giao vận
I WANT: Quản lý fleet drone (thêm, khóa, xóa, xem status)
SO THAT: Đảm bảo luôn có đủ drone giao hàng

ACCEPTANCE CRITERIA:
✓ Delivery → Drones tab → Danh sách drones
✓ Mỗi drone: identifier, status (available/busy/offline), location
✓ Thêm: Button "Add Drone"
  - Nhập ID/name, model, max_weight, base location
✓ Edit: Click → Update thông tin
✓ Delete: Chỉ khi drone idle (status = "available")
✓ Lock/Unlock: Khóa drone khi không dùng → không assign orders
✓ Xem GPS location realtime (update từ drone telemetry)

PRIORITY: MEDIUM
EFFORT: 5 điểm
```

---

#### **US-A04: Xem Dashboard KPI Toàn Hệ Thống**
```
AS A: Quản trị viên cao cấp
I WANT: Xem KPI chính của hệ thống trên 1 dashboard
SO THAT: Tôi biết tình hình kinh doanh tổng thể

ACCEPTANCE CRITERIA:
✓ Dashboard → Multiple widgets:
  - Revenue: doanh số hôm nay, tuần, tháng, năm
  - Orders: số orders, completion rate, cancel rate
  - Users: số active users, new users (hôm nay/tuần)
  - Restaurants: số active restaurants, new registrations
  - Rating: average rating hệ thống
✓ Charts & graphs: doanh thu trending, orders per day, v.v.
✓ Table: Top 10 restaurants, top 10 customers
✓ Nút export → báo cáo PDF/CSV
✓ Update realtime (mỗi 1 phút)

PRIORITY: HIGH
EFFORT: 7 điểm
```

---

#### **US-A05: Xem Tất Cả Orders & Báo Cáo Chi Tiết**
```
AS A: Quản trị viên
I WANT: Xem tất cả orders trong hệ thống & báo cáo doanh thu
SO THAT: Tôi có data để phân tích & quyết định kinh doanh

ACCEPTANCE CRITERIA:
✓ Orders tab → Danh sách tất cả orders:
  - Filter: status, restaurant, date range
  - Search: order ID
  - Sort: theo date, revenue
✓ Click order → OrderDetail (xem tất cả info)
✓ Reports tab:
  - Date range picker (date_from, date_to)
  - Metrics:
    - Total revenue
    - Total orders
    - Avg order value
    - Revenue per restaurant
    - Completion rate
    - Cancel rate
  - Charts: revenue trend, orders per day, etc.
  - Export: PDF hoặc CSV

PRIORITY: HIGH
EFFORT: 6 điểm
```

---

## 📋 **USER STORY TEMPLATE ĐƯỢC DÙNG**

```
AS A: [role/type of user]
I WANT: [action/feature]
SO THAT: [benefit/reason]

ACCEPTANCE CRITERIA:
✓ [Criteria 1]
✓ [Criteria 2]
...

PRIORITY: HIGH / MEDIUM / LOW
EFFORT: [1-13 điểm - Planning Poker]
```

---

## 📊 **TỔNG HỢP USER STORIES**

| **Category** | **Số Stories** | **Actors** |
|-----------|-----------|-----------|
| **Customer** | 8 | Khách hàng |
| **Restaurant** | 5 | Chủ nhà hàng |
| **Admin** | 5 | Quản trị viên |
| **TỔNG** | **18 User Stories** | |

