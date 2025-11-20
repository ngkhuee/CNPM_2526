# 📋 QUY TRÌNH NGHIỆP VỤ & USER STORIES
## Food Delivery System

---

## **PHẦN 1: CÁC QUY TRÌNH NGHIỆP VỤ CHÍNH**

---

### **1. QUY TRÌNH MUA HÀNG TRỰ TUYẾN**

#### **1.1 Giai Đoạn: Khám Phá & Tìm Kiếm**

Khi khách hàng mở ứng dụng, hệ thống yêu cầu cấp quyền truy cập vị trí GPS. Một khi nhân khách hàng cấp quyền, ứng dụng sẽ gửi tọa độ hiện tại lên máy chủ để tìm kiếm các nhà hàng lân cận trong bán kính 5km. Danh sách nhà hàng được sắp xếp theo khoảng cách gần nhất trước, kèm theo thông tin như tên, ảnh, rating trung bình, giờ mở cửa, và thời gian giao dự kiến.

Khách hàng có thể lọc danh sách này theo loại hình nhà hàng (Pizza, Gà rán, Mì, v.v.) hoặc sắp xếp theo tiêu chí khác như rating cao nhất, sản phẩm bán chạy nhất. Nếu khách hàng từ chối chia sẻ vị trí, ứng dụng vẫn hiển thị danh sách tất cả nhà hàng nhưng không sắp xếp theo khoảng cách.

Khi khách hàng chọn 1 nhà hàng, hệ thống sẽ tải menu của nhà hàng đó, chia thành các danh mục (khai vị, món chính, tráng miệng, v.v.). Mỗi sản phẩm hiển thị với ảnh, tên, giá, mô tả ngắn, và rating trung bình dựa trên đánh giá của khách hàng trước đó.

---

#### **1.2 Giai Đoạn: Chọn Sản Phẩm & Quản Lý Giỏ**

Khách hàng click vào sản phẩm để xem chi tiết đầy đủ: hình ảnh to hơn, mô tả chi tiết, giá, và các tùy chọn (nếu có như size, topping). Khách hàng chọn số lượng mong muốn và có thể thêm ghi chú đặc biệt (ví dụ: "ít đường", "không hành", "không dressing", v.v.).

Sau khi hoàn tất, khách hàng nhấn nút "Add to Cart". Sản phẩm được thêm vào giỏ hàng và ứng dụng hiển thị thông báo thành công. Khách hàng có thể tiếp tục thêm các sản phẩm khác từ cùng một nhà hàng, hoặc xem giỏ hàng bất cứ lúc nào.

Trong giỏ hàng, khách hàng có thể:
- **Xem danh sách items:** Tên sản phẩm, số lượng, giá từng item, tổng cộng
- **Cập nhật số lượng:** Bấm + hoặc - để tăng/giảm qty, hoặc xóa item
- **Xem tóm tắt giá:** Subtotal (tổng giá sản phẩm), phí giao mặc định
- **Nhập mã khuyến mãi (nếu có):** Để nhận được giảm giá

Khi khách hàng thỏa mãn với giỏ hàng, họ bấm nút "Proceed to Checkout".

---

#### **1.3 Giai Đoạn: Thanh Toán & Xác Nhận Đơn**

Trên trang Checkout, khách hàng cần hoàn tất 3 bước:

**Bước 1 - Chọn Địa Chỉ Giao:**
Hệ thống hiển thị danh sách các địa chỉ mà khách hàng đã lưu trong hồ sơ (nhà riêng, công ty, gym, v.v.). Khách hàng chọn 1 địa chỉ làm địa điểm giao hàng. Nếu muốn giao tới một nơi mới, khách hàng có thể nhập địa chỉ mới bằng cách nhập tên đường, huyện, thành phố, hoặc bấm nút "Get GPS" để hệ thống tự động lấy tọa độ hiện tại.

**Bước 2 - Áp Dụng Khuyến Mãi (Nếu Có):**
Khách hàng có thể nhập mã khuyến mãi nếu có. Hệ thống kiểm tra:
- Mã có tồn tại không?
- Mã còn hạn sử dụng không? (kiểm tra expiry_date)
- Mã còn lượt sử dụng không? (so sánh usage_count với usage_limit)
- Giá trị đơn hàng có đủ tối thiểu không? (so sánh subtotal với min_order_amount)

Nếu tất cả điều kiện được thỏa mãn, hệ thống tính toán giảm giá:
- Nếu khuyến mãi là phần trăm: `discount_amount = subtotal * discount_value / 100`
- Nếu khuyến mãi là số tiền cố định: `discount_amount = discount_value`

Tổng tiền cuối cùng được tính: `total_amount = subtotal + delivery_fee - discount_amount`

Khách hàng có thể xóa mã khuyến mãi nếu muốn.

**Bước 3 - Chọn Phương Thức Thanh Toán:**
Hệ thống cung cấp 2 lựa chọn:
- **Thanh toán MoMo:** Khách hàng bấm nút "Pay with MoMo", hệ thống sẽ chuyển hướng sang ứng dụng MoMo hoặc website thanh toán MoMo. Sau khi khách xác nhận thanh toán trong MoMo, MoMo gửi callback về hệ thống để xác thực. Nếu thành công, đơn hàng status = "confirmed" ngay lập tức.
- **Thanh toán Tiền Mặt (COD):** Khách hàng chọn tùy chọn này nếu muốn thanh toán khi nhận hàng. Đơn hàng sẽ có status = "pending" và chờ nhà hàng xác nhận.

Trước khi submit, khách hàng được xem lại tóm tắt đơn hàng (items, địa chỉ, phí giao, khuyến mãi, tổng tiền). Khi nhấn "Place Order", hệ thống tạo đơn hàng mới trong database, xóa giỏ hàng của khách, và chuyển hướng sang trang tracking.

---

#### **1.4 Giai Đoạn: Theo Dõi Đơn Hàng Realtime**

Sau khi đặt hàng thành công, khách hàng được chuyển tới trang "Order Tracking". Trang này hiển thị:

- **Thông tin đơn hàng:** Order ID, danh sách items, tổng tiền, địa chỉ giao
- **Trạng thái hiện tại:** Một thanh tiến trình (progress bar) hiển thị trạng thái thực tế (Pending → Confirming → Preparing → Ready → Shipping → Completed)
- **Bản đồ realtime:** Nếu đơn hàng đang trong trạng thái "Shipping", bản đồ sẽ hiển thị vị trí hiện tại của drone/shipper, vị trí nhà hàng, và vị trí đích giao hàng. GPS tự động update mỗi 5-10 giây thông qua WebSocket connection.
- **Thời gian dự kiến:** Hiển thị khoảng thời gian giao hàng dự kiến (ví dụ: "Est. delivery in 20-25 minutes")
- **Thông tin liên hệ:** Nút gọi hoặc gửi SMS cho shipper (nếu đơn hàng đang giao)

Khi trạng thái đơn hàng thay đổi, khách hàng nhận được thông báo realtime (push notification hoặc in-app notification). Ứng dụng sử dụng WebSocket để subscribe tới events liên quan đến order này, đảm bảo khách hàng luôn nhìn thấy thông tin mới nhất.

---

#### **1.5 Giai Đoạn: Nhận Hàng & Xác Nhận**

Khi shipper/drone đến địa chỉ giao hàng, shipper sẽ liên hệ khách hàng để giao hàng. Khách hàng kiểm tra hàng, nếu đúng là những gì đã đặt, họ xác nhận nhận hàng trong ứng dụng hoặc ngoài ứng dụng (ứng dụng sẽ tự động đánh dấu "delivered" sau một khoảng thời gian nếu khách không phản hồi).

Nếu thanh toán bằng MoMo, thanh toán đã hoàn tất từ trước. Nếu thanh toán tiền mặt, khách hàng trả tiền cho shipper lúc này. Đơn hàng status chuyển từ "Shipping" sang "Completed".

Khách hàng có thể xem lại thông tin đơn hàng đã hoàn thành trong tab "MyOrders" và lưu nó vào lịch sử.

---

#### **1.6 Giai Đoạn: Đánh Giá & Review**

Sau khi nhận hàng thành công (order status = "completed"), khách hàng có thể viết đánh giá cho từng sản phẩm hoặc cả nhà hàng. 

Để đánh giá sản phẩm, khách hàng:
1. Vào tab "MyOrders" → Chọn order đã completed
2. Nhấn nút "Review" hoặc "Rate Products"
3. Chọn sản phẩm → Chọn số sao (1-5), viết comment, tải lên ảnh (tùy chọn)
4. Submit review

Review này được lưu vào database và sử dụng để tính rating trung bình của sản phẩm. Các khách hàng khác có thể xem reviews này khi duyệt menu.

---

#### **1.7 Giai Đoạn: Hủy Đơn Hàng (Nếu Cần)**

Nếu khách hàng thay đổi ý hoặc cần hủy đơn hàng, họ có thể hủy miễn là đơn hàng chưa bắt đầu chuẩn bị (status = "pending" hoặc "confirming"). 

Để hủy:
1. Vào "MyOrders" → Chọn order → Bấm "Cancel"
2. Ứng dụng yêu cầu xác nhận hủy
3. Nếu xác nhận, hệ thống gửi yêu cầu hủy tới nhà hàng
4. Nếu order status = "pending", nhà hàng chưa nhận → hủy ngay, hoàn tiền nếu có
5. Nếu order status = "confirming", nhà hàng đã nhận → cần xác nhận hủy từ nhà hàng
6. Nếu thanh toán rồi → hoàn tiền tự động

---

---

### **2. QUY TRÌNH XỬ LÝ ĐƠN HÀNG (NHÌN TỪ NHÂN VIÊN NHÀ HÀNG)**

#### **2.1 Giai Đoạn: Nhận & Xác Nhận Đơn Hàng**

Khi khách hàng đặt hàng thành công, nhân viên nhà hàng nhận được thông báo đơn hàng mới (qua email, SMS, hoặc in-app notification). Nhân viên đăng nhập vào dashboard nhà hàng và vào tab "Orders".

Trên tab "Orders", danh sách các đơn hàng được sắp xếp theo thời gian, với các đơn mới nhất ở đầu. Mỗi đơn hiển thị:
- Order ID
- Tên khách hàng, số điện thoại
- Danh sách items (sản phẩm + số lượng)
- Địa chỉ giao
- Tổng tiền
- Thời gian đặt

Nhân viên nhấn vào đơn hàng để xem chi tiết đầy đủ, bao gồm các ghi chú đặc biệt từ khách hàng (ví dụ: "ít đường", "không cay", v.v.).

Tiếp theo, nhân viên kiểm tra kho:
- Có đủ tất cả các sản phẩm trong đơn không?
- Các sản phẩm còn hạn sử dụng không? (nếu có thời hạn)

Nếu tất cả đều có sẵn, nhân viên nhấn nút "Confirm Order". Order status từ "pending" chuyển sang "confirming". Khách hàng nhận được thông báo rằng nhà hàng đã nhận đơn.

Nếu một số sản phẩm hết hàng, nhân viên có thể nhấn "Reject Order" và nhập lý do (ví dụ: "Out of stock"). Đơn hàng status = "cancelled", khách hàng được hoàn tiền tự động, và nhận được thông báo về lý do hủy.

---

#### **2.2 Giai Đoạn: Chuẩn Bị & Đóng Gói**

Một khi order được confirm, nhân viên bắt đầu chuẩn bị. Họ sẽ:
1. Lấy tất cả sản phẩm từ kho theo danh sách
2. Kiểm tra lại: số lượng, chất lượng, có đúng ghi chú đặc biệt không?
3. Đóng gói sản phẩm (nếu cần nóng → đặt vào hộp giữ nhiệt, v.v.)
4. Dán nhãn đơn hàng

Trong giao diện dashboard, nhân viên nhấn nút "Start Preparing" (hoặc tương tự). Order status từ "confirming" chuyển sang "preparing". Khách hàng nhận được thông báo rằng nhà hàng đang chuẩn bị đơn.

---

#### **2.3 Giai Đoạn: Sẵn Sàng Giao Hàng**

Khi sản phẩm hoàn tất đóng gói và kiểm tra lại, nhân viên nhấn nút "Ready for Delivery". Order status từ "preparing" chuyển sang "ready". Đơn hàng được đặt trên quầy/khu vực chuyên dụng chờ shipper/drone lấy.

Khách hàng nhận được thông báo: "Your order is ready and will be picked up for delivery soon". Nếu hệ thống sử dụng drone, admin sẽ nhìn thấy order này trong danh sách "Ready for Pickup" và gán một drone sẵn có.

---

#### **2.4 Giai Đoạn: Giao Cho Shipper/Drone**

Khi shipper đến quán để lấy hàng, nhân viên xác nhận delivery bằng cách nhấn nút "Assign to Delivery" (hoặc "Hand over to Shipper"). Order status từ "ready" chuyển sang "shipping".

Khách hàng nhận được thông báo: "Your order has been picked up and is on the way". Ứng dụng khách sẽ bắt đầu hiển thị bản đồ realtime với vị trí của shipper/drone.

---

#### **2.5 Giai Đoạn: Hoàn Thành & Thanh Toán**

Khi shipper giao hàng đến khách và khách xác nhận nhận được, order status tự động chuyển sang "completed". Nếu khách không xác nhận sau một khoảng thời gian (ví dụ 10 phút), hệ thống tự động đánh dấu completed.

Nhà hàng có thể xem tất cả các đơn hoàn thành trong tab "Completed Orders". Tại đây, doanh số được tính, discount được trừ, và net revenue được ghi nhận.

---

#### **2.6 Giai Đoạn: Báo Cáo & Phân Tích**

Nhà hàng có thể xem báo cáo chi tiết:
- **Dashboard:** Doanh số hôm nay, số orders, sản phẩm bán chạy top 5, rating trung bình
- **Reports:** Chọn khoảng thời gian (ngày, tuần, tháng) → xem chi tiết:
  - Tổng doanh thu (breakdown by day nếu range lớn)
  - Số orders completed/cancelled
  - Top products (qty sold, revenue)
  - Total discount used
  - Net revenue after commission (nếu có)

Dữ liệu này giúp nhà hàng hiểu được tren của kinh doanh và tối ưu hóa menu, giá cả, hoặc khuyến mãi.

---

---

### **3. QUY TRÌNH QUẢN LÝ HỆ THỐNG (NHÌN TỪ ADMIN)**

#### **3.1 Giai Đoạn: Duyệt Đăng Ký Nhà Hàng Mới**

Khi một nhà hàng mới nộp đơn đăng ký (thông qua page "Register Restaurant"), yêu cầu này được lưu vào database với status = "pending". Admin nhận được thông báo.

Admin truy cập dashboard, vào mục "Pending Approvals" hoặc tab "Restaurants" → Filter status = "pending". Danh sách các yêu cầu pending được hiển thị với thông tin:
- Tên nhà hàng
- Chủ nhà hàng (tên, email, số điện thoại)
- Địa chỉ, loại hình
- Ngày đăng ký

Admin click vào yêu cầu để xem chi tiết đầy đủ:
- Thông tin chủ nhà hàng (email, phone, address)
- Thông tin nhà hàng (tên, description, address, GPS location, image, banner)
- Menu hiện tại (nếu đã upload)

Admin kiểm tra thông tin có hợp lệ, đầy đủ không. Nếu hợp lệ → nhấn "Approve". Hệ thống:
1. Cập nhật restaurant status = "active"
2. Cập nhật owner user status = "active"
3. Gửi email cho chủ nhà hàng: "Congratulations! Your restaurant has been approved. You can now login and start accepting orders."
4. Chủ nhà hàng có thể login và bán hàng ngay

Nếu thông tin không hợp lệ hoặc bị nghi ngờ → admin nhấn "Reject" và nhập lý do (ví dụ: "Document not clear", "Incomplete information", v.v.). Hệ thống:
1. Cập nhật restaurant status = "blocked"
2. Cập nhật owner user status = "blocked"
3. Gửi email cho chủ: "Your registration has been rejected because [reason]. Please contact support to reapply."

---

#### **3.2 Giai Đoạn: Giám Sát Orders & Tracking**

Admin có thể xem tất cả orders trong hệ thống thông qua tab "Orders". Danh sách này cho phép:
- **Filter:** Theo status (pending, confirming, preparing, ready, shipping, completed, cancelled), theo restaurant, theo date range
- **Search:** Theo Order ID hoặc customer name
- **Sort:** Theo date, revenue, status

Khi click vào order, admin xem chi tiết:
- Order ID, khách hàng, nhà hàng
- Danh sách items, tổng tiền, payment status
- Địa chỉ giao
- Trạng thái hiện tại

Admin cũng có thể xem bản đồ realtime của tất cả drones/shipper đang giao hàng. Bản đồ hiển thị:
- Pin các nhà hàng
- Icon drone/shipper (chỉ khi đang giao)
- Đường nối từ restaurant → drone → customer
- Realtime GPS location, updated mỗi 5 giây

Nếu có vấn đề (ví dụ: shipper bị lạc, late delivery), admin có thể:
- Liên hệ trực tiếp với shipper
- Xem lịch sử các orders để phân tích vấn đề
- Gửi bù tiền cho khách hàng nếu delivery muộn

---

#### **3.3 Giai Đoạn: Quản Lý Drone Fleet**

Admin quản lý toàn bộ fleet drone thông qua tab "Delivery" → "Drones". Danh sách drones hiển thị:
- Drone ID/name
- Status: available, busy (đang giao), offline
- Current location (GPS)
- Trọng tải tối đa
- Số orders đã giao hôm nay

Admin có thể:
- **Thêm drone:** Button "Add Drone" → nhập identifier, model, max_weight, base location → lưu
- **Sửa thông tin:** Click "Edit" → cập nhật thông tin
- **Xóa drone:** Chỉ khi drone idle (không giao hàng) → DELETE
- **Lock/Unlock:** Khóa drone khi bảo trì hoặc không dùng → drone không được gán orders
- **Xem GPS realtime:** Xem vị trí hiện tại của drone trên bản đồ

---

#### **3.4 Giai Đoạn: Xem Dashboard & KPI**

Admin có dashboard chính với các widget hiển thị KPI:

**Revenue Metrics:**
- Doanh số hôm nay, tuần, tháng, năm
- Chart: doanh thu trending

**Orders Metrics:**
- Tổng số orders
- Completion rate (%)
- Cancel rate (%)
- Avg order value

**Users & Restaurants:**
- Số active customers
- Số new customers (hôm nay, tuần)
- Số active restaurants
- Số new restaurants (pending approval)

**System Health:**
- Average rating (tất cả nhà hàng)
- Average delivery time
- Drone availability (số drone available vs total)

**Top Performers:**
- Top 10 restaurants (by revenue)
- Top 10 customers (by order count)
- Top 10 products (by qty sold)

Tất cả các metric được update realtime hoặc mỗi 1-5 phút.

---

#### **3.5 Giai Đoạn: Báo Cáo Chi Tiết & Phân Tích**

Admin có thể tạo báo cáo chi tiết bằng cách:
1. Vào tab "Reports"
2. Chọn report type: "Revenue", "Orders", "Users", "Restaurants", "Delivery"
3. Chọn date range
4. Hệ thống generate báo cáo với charts & tables

**Ví dụ:**
- **Revenue Report:** Danh sách tất cả orders trong period, grouped by day/week/month. Tính subtotal, total discount, net revenue per restaurant.
- **Orders Report:** Số orders, completion rate, cancel rate, avg delivery time.
- **Delivery Report:** Drone efficiency (avg orders/drone/day), delivery success rate, avg delivery time, late deliveries.

Admin có thể export báo cáo dưới dạng PDF hoặc CSV.

---

#### **3.6 Giai Đoạn: Quản Lý Users & Moderation**

Admin có thể xem tất cả users (customers + restaurant owners) thông qua tab "Users". Danh sách cho phép:
- **Filter:** Theo role (customer, restaurant_owner), status (active, blocked)
- **Search:** Theo email, name, phone
- **Action:** 
  - Click user → xem detail (info, orders history, reviews)
  - "Block" → khóa tài khoản (user không thể login, khách không thể order, nhà hàng không thể receive orders)
  - "Unblock" → mở khóa
  - "Delete" → xóa tài khoản (chỉ khi không có orders/transactions)

Nếu admin phát hiện user vi phạm chính sách (spam, fraud, abuse), họ có thể block ngay lập tức.

---

---

## **PHẦN 2: USER STORIES**

---

### **CUSTOMER USER STORIES**

---

#### **US-C01: Tìm Kiếm Nhà Hàng Gần Nhất Dựa Vào Vị Trí GPS**

**Là một:** Khách hàng đang đói và muốn tìm hàng ăn gần nhất  
**Tôi muốn:** Ứng dụng hiển thị các nhà hàng gần vị trí của tôi, sắp xếp theo khoảng cách từ gần đến xa  
**Để:** Tôi có thể đặt hàng và nhận nó nhanh nhất

**Tiêu Chí Chấp Nhận:**
- ✓ Khi mở app lần đầu, hệ thống yêu cầu cấp quyền truy cập GPS
- ✓ Sau khi cấp quyền, app hiển thị danh sách nhà hàng sắp xếp theo khoảng cách (gần nhất ở đầu)
- ✓ Mỗi nhà hàng hiển thị: tên, ảnh, rating, giờ mở cửa, time delivery estimate, khoảng cách (km)
- ✓ Khách có thể lọc theo category (Pizza, Gà rán, Mì, v.v.)
- ✓ Khách có thể lọc theo rating (4★+, 3★+, v.v.)
- ✓ Nếu khách từ chối GPS → app hiển thị "All Restaurants" không sắp xếp
- ✓ Click nhà hàng → vào chi tiết & menu

**Độ Ưu Tiên:** CAO  
**Công Sức:** 3 điểm

---

#### **US-C02: Xem Chi Tiết Sản Phẩm & Thêm Ghi Chú Đặc Biệt**

**Là một:** Khách hàng có yêu cầu khác biệt về đồ ăn  
**Tôi muốn:** Khi chọn sản phẩm, tôi có thể xem chi tiết đầy đủ (ảnh, mô tả, giá) và thêm ghi chú (ít đường, không hành, không dressing, v.v.)  
**Để:** Nhà hàng biết chính xác những gì tôi cần

**Tiêu Chí Chấp Nhận:**
- ✓ Nhấn vào sản phẩm → popup/modal với: ảnh to, tên, mô tả chi tiết, giá, rating
- ✓ Có input field để nhập ghi chú đặc biệt (ví dụ: "ít đường", "không cay", "dressing on the side")
- ✓ Chọn số lượng (1, 2, 3, ... hoặc +/-)
- ✓ Nút "Add to Cart" → thêm vào, show toast "Added to cart"
- ✓ Giỏ hàng update realtime (badge với số items)
- ✓ Khách có thể tiếp tục chọn sản phẩm khác hoặc xem giỏ

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 3 điểm

---

#### **US-C03: Áp Dụng Mã Khuyến Mãi Trước Khi Thanh Toán**

**Là một:** Khách hàng thích tiết kiệm  
**Tôi muốn:** Khi checkout, tôi có thể nhập mã khuyến mãi và nhìn thấy số tiền giảm trước khi thanh toán  
**Để:** Tôi biết chắc tôi sẽ tiết kiệm bao nhiêu tiền

**Tiêu Chí Chấp Nhận:**
- ✓ Trên trang Cart/Checkout, có field "Promo Code" hoặc "Discount Code"
- ✓ Nhập mã → hệ thống verify: code tồn tại, còn hạn, đơn đủ tiền minimum
- ✓ Nếu valid → hiển thị "Discount: -50,000 VND" (hoặc "20% off")
- ✓ Tổng tiền tự động tính lại: Total = Subtotal + DeliveryFee - Discount
- ✓ Nếu invalid → hiển thị error: "Code expired" hoặc "Invalid code"
- ✓ Khách có thể xóa promo → quay về giá gốc
- ✓ Nút "Review Order" để xem tóm tắt trước submit

**Độ Ưu Tiên:** CAO  
**Công Sức:** 5 điểm

---

#### **US-C04: Theo Dõi Đơn Hàng Realtime Trên Bản Đồ Với GPS**

**Là một:** Khách hàng chờ hàng và muốn biết nó ở đâu  
**Tôi muốn:** Trên bản đồ, tôi thấy vị trí của drone/shipper, nhà hàng, và địa chỉ của tôi  
**Để:** Tôi biết hàng sẽ đến lúc nào và có thể đón chúng

**Tiêu Chí Chấp Nhận:**
- ✓ Sau khi place order (nếu order status = "shipping"), tự động vào Tracking page
- ✓ Bản đồ hiển thị 3 điểm:
  - Pin nhà hàng (Pickup point)
  - Icon drone/shipper (moving realtime)
  - Pin địa chỉ giao (Destination)
- ✓ Có đường nối từ restaurant → drone → customer
- ✓ GPS update realtime mỗi 5-10 giây (WebSocket)
- ✓ Hiển thị thời gian dự kiến: "Est. delivery in 18-23 minutes"
- ✓ Order status bar: Pending → Confirming → Preparing → Ready → Shipping → Completed
- ✓ Khi status thay đổi → notification realtime
- ✓ Nút "Call Shipper" hoặc "Message Shipper"
- ✓ Nếu late delivery → notification "Delivery is running late"

**Độ Ưu Tiên:** CAO  
**Công Sức:** 8 điểm (phức tạp vì Maps API + WebSocket)

---

#### **US-C05: Quản Lý Nhiều Địa Chỉ Giao Hàng**

**Là một:** Khách hàng bận rộn với công việc  
**Tôi muốn:** Lưu 3-4 địa chỉ thường dùng (nhà riêng, công ty, gym, nhà bạn) để không cần nhập lại  
**Để:** Lúc checkout, tôi chỉ cần chọn 1 địa chỉ có sẵn

**Tiêu Chí Chấp Nhận:**
- ✓ Profile page → "Addresses" tab
- ✓ Danh sách địa chỉ đã lưu (nếu có): hiển thị address line, city, label (Home, Work, v.v.)
- ✓ Nút "Add New Address":
  - Nhập address line, district, city, phone, note
  - Nút "Get GPS" → lấy tọa độ hiện tại tự động
  - Hoặc nhập tọa độ thủ công
  - Checkbox "Set as Default"
- ✓ Edit/Delete address
- ✓ Set 1 address làm default (star icon)
- ✓ Khi checkout → mặc định chọn default address
- ✓ Có thể đổi address khi checkout nếu cần

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 4 điểm

---

#### **US-C06: Đọc Reviews & Đánh Giá Sản Phẩm Trước Mua**

**Là một:** Khách hàng muốn mua hàng chất lượng  
**Tôi muốn:** Trước khi mua, tôi đọc được reviews từ khách hàng khác về sản phẩm/nhà hàng  
**Để:** Tôi tự tin vào chất lượng

**Tiêu Chí Chấp Nhận:**
- ✓ RestaurantDetail page → "Reviews" tab
- ✓ Hiển thị:
  - Average rating (3.8/5, ví dụ)
  - Số reviews
  - Reviews breakdown: 5★ (100), 4★ (50), 3★ (20), v.v.
- ✓ Danh sách reviews: user name, avatar, rating (stars), comment, ngày
- ✓ Có thể filter theo rating (5★ only, 4★+, v.v.)
- ✓ Có thể xem ảnh từ reviews (nếu có)
- ✓ Sau khi order completed → nút "Write Review"
- ✓ Review form: chọn sao (1-5 with emoji), viết comment, upload ảnh
- ✓ Submit → update rating trung bình

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 5 điểm

---

#### **US-C07: Thanh Toán Bằng MoMo Một Lần Click**

**Là một:** Khách hàng không có tiền mặt sẵn  
**Tôi muốn:** Bấm "Pay with MoMo" → được redirect sang MoMo app, confirm, và quay lại  
**Để:** Đơn hàng được confirm ngay mà không cần chờ shipper

**Tiêu Chí Chấp Nhận:**
- ✓ Checkout page → Payment method section
- ✓ Chọn "MoMo" → nút "Pay Now"
- ✓ Bấm → app redirect sang MoMo (app hoặc web)
- ✓ MoMo app: xác nhận payment
- ✓ MoMo callback → app verify
- ✓ Nếu success → Verify page → "Payment successful!"
- ✓ Order status = "confirmed", vào Tracking page
- ✓ Order details: payment status = "completed"
- ✓ Nếu fail → "Payment failed, try again" → có thể retry
- ✓ Nếu timeout → "Payment pending, please wait" hoặc cancel

**Độ Ưu Tiên:** CAO  
**Công Sức:** 6 điểm (tích hợp MoMo API)

---

#### **US-C08: Hủy Đơn Hàng Nếu Cần**

**Là một:** Khách hàng thay đổi ý hoặc tìm thấy lựa chọn tốt hơn  
**Tôi muốn:** Hủy đơn hàng nếu nó chưa bắt đầu chuẩn bị  
**Để:** Tôi không bị mất tiền hoặc hàng lạc hứng

**Tiêu Chí Chấp Nhận:**
- ✓ MyOrders page → order (status = "pending" hoặc "confirming") → nút "Cancel"
- ✓ Modal: "Are you sure?" → Confirm
- ✓ POST /orders/:id/cancel
- ✓ Nếu COD (Cash on Delivery) → cancel ngay
- ✓ Nếu thanh toán MoMo rồi → show "Refunding..." → "Refund completed"
- ✓ Order status = "cancelled"
- ✓ Danh sách orders: order bị xóa khỏi "Active", chuyển tới "Cancelled"
- ✓ Notification cho khách

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 4 điểm

---

### **RESTAURANT USER STORIES**

---

#### **US-R01: Quản Lý Menu Dễ Dàng (Add/Edit/Delete/Toggle)**

**Là một:** Chủ nhà hàng  
**Tôi muốn:** Dễ dàng thêm, sửa, xóa sản phẩm trên menu hoặc toggle available/unavailable  
**Để:** Menu luôn up-to-date với kho hàng

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → "Menu" tab → danh sách products
- ✓ Danh sách hiển thị: name, price, category, image thumbnail, available status
- ✓ Thêm: nút "Add Product" → form pre-built
  - Nhập: name, description, price, category, image (upload)
  - Nút "Save" → POST /menus
- ✓ Sửa: click "Edit" → form pre-filled → PATCH /menus/:id
- ✓ Xóa: click "Delete" → confirm → DELETE /menus/:id (chỉ nếu không có orders)
- ✓ Toggle: checkbox "Available" → hiểu hoặc ẩn sản phẩm khỏi menu khách
- ✓ Thay đổi ngay → khách thấy menu updated (không cần refresh)

**Độ Ưu Tiên:** CAO  
**Công Sức:** 5 điểm

---

#### **US-R02: Xác Nhận & Chuẩn Bị Đơn Hàng**

**Là một:** Nhân viên nhà hàng  
**Tôi muốn:** Xem danh sách orders đến, xác nhận kho, chuẩn bị, rồi đánh dấu "ready for delivery"  
**Để:** Khách biết đơn hàng được xử lý

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → "Orders" tab → danh sách orders (realtime, incoming at top)
- ✓ Mỗi order card: ID, khách, items count, total, status, time received
- ✓ Click → OrderDetail:
  - Danh sách items (product name, qty, ghi chú đặc biệt)
  - Customer name, phone, address
  - Total price, payment method, payment status
- ✓ Nút "Confirm Order" → kiểm tra kho, có đủ không
- ✓ Nếu đủ → status "pending" → "confirming", customer notify
- ✓ Nếu không → nút "Reject" → nhập lý do → status "cancelled", hoàn tiền
- ✓ Nút "Start Preparing" → status "confirming" → "preparing"
- ✓ Nút "Ready" → status "preparing" → "ready", place on counter
- ✓ Mỗi bước → customer notify + app update status bar

**Độ Ưu Tiên:** CAO  
**Công Sức:** 6 điểm

---

#### **US-R03: Từ Chối Đơn Khi Hết Hàng**

**Là một:** Nhân viên nhà hàng  
**Tôi muốn:** Nếu không có đủ sản phẩm, tôi reject đơn với lý do rõ ràng  
**Để:** Khách hiểu tại sao và được hoàn tiền

**Tiêu Chí Chấp Nhận:**
- ✓ OrderDetail → nút "Reject" hoặc "Can't Fulfill"
- ✓ Modal: "Why are you rejecting?"
  - Select reason: "Out of stock", "Ingredient issue", "Technical problem", v.v.
  - Hoặc text input để custom message
- ✓ Bấm "Confirm Rejection"
- ✓ Order status = "cancelled"
- ✓ Nếu khách đã thanh toán MoMo → hoàn tiền tự động
- ✓ Notification cho khách với lý do
- ✓ Order nhận tên "Rejected" hoặc "Cancelled" trong khách history

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 3 điểm

---

#### **US-R04: Xem Báo Cáo Doanh Thu & Phân Tích**

**Là một:** Chủ nhà hàng  
**Tôi muốn:** Xem doanh số chi tiết (ngày, tuần, tháng) và top products bán chạy  
**Để:** Hiểu kinh doanh và quyết định chiến lược

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → widgets:
  - "Today Revenue": doanh số hôm nay
  - "Orders Today": số orders completed
  - "Avg Rating": rating trung bình
  - "Top 5 Products": sản phẩm bán chạy
- ✓ Reports tab → date range picker
- ✓ Chọn date range → hiển thị:
  - Chart: doanh thu by day (nếu range > 7 days)
  - Tổng revenue, total orders, completion rate
  - List: top 10 products (name, qty sold, revenue)
  - Total discount used (từ promo codes)
- ✓ Nút "Export" → download PDF hoặc CSV

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 6 điểm

---

#### **US-R05: Tạo Mã Khuyến Mãi Riêng Cho Nhà Hàng**

**Là một:** Chủ nhà hàng muốn tăng sales  
**Tôi muốn:** Tạo mã khuyến mãi (ví dụ "SUMMER50") để khách dùng khi checkout  
**Để:** Khách hàng có động lực mua, volume tăng

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → "Promotions" tab → danh sách promotions (nếu có)
- ✓ Nút "Add Promotion" → form:
  - "Code": text input (vd: "SUMMER50", "FREESHIP100")
  - "Discount Type": select "Percentage (%)" hoặc "Fixed amount (VND)"
  - "Discount Value": number (vd: 20 cho 20%, hoặc 50000 cho 50k VND)
  - "Min Order Amount": (vd: 100,000 VND minimum to use)
  - "Start Date" - "End Date": date picker
  - "Usage Limit": số lượt dùng tối đa (vd: 100)
- ✓ Nút "Create" → POST /promotions
- ✓ Danh sách promotions: xem, edit, delete, view "Used X times"
- ✓ Khách apply code → hệ thống verify & discount apply

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 5 điểm

---

### **ADMIN USER STORIES**

---

#### **US-A01: Duyệt & Approve/Reject Đăng Ký Nhà Hàng Mới**

**Là một:** Quản trị viên hệ thống  
**Tôi muốn:** Xem yêu cầu đăng ký nhà hàng mới (pending), kiểm tra thông tin, rồi approve hoặc reject  
**Để:** Chỉ những nhà hàng chất lượng được hoạt động trên nền tảng

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → "Pending Approvals" widget hoặc tab
- ✓ Restaurants tab → filter status = "pending"
- ✓ Danh sách pending: name, owner, email, date registered
- ✓ Click → RestaurantDetail:
  - Thông tin chủ: name, email, phone, address
  - Thông tin nhà hàng: name, description, address, GPS, category, image
  - Menu (nếu đã upload)
  - Buttons: "Approve" / "Reject"
- ✓ Approve → status "active", owner status "active"
  - Email to owner: "Congratulations! Your restaurant is now active."
  - Owner có thể login & accept orders
- ✓ Reject → status "blocked", owner status "blocked"
  - Modal: "Reason" → nhập lý do
  - Email to owner: "Your registration was rejected because [reason]. Contact support to reapply."

**Độ Ưu Tiên:** CAO  
**Công Sức:** 4 điểm

---

#### **US-A02: Theo Dõi Giao Hàng Realtime Trên Bản Đồ**

**Là một:** Quản trị viên giao vận  
**Tôi muốn:** Trên bản đồ, tôi thấy tất cả drones & orders đang giao, tất cả realtime  
**Để:** Tôi có thể tối ưu hóa, phát hiện sự cố, hoặc xử lý late delivery

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard → "Delivery" tab → Map view
- ✓ Bản đồ hiển thị:
  - Pin restaurants
  - Icon drone (chỉ khi đang shipping) với order ID
  - Pin customer addresses
  - Polyline từ restaurant → drone → customer
- ✓ Hover drone icon → popup: order ID, customer, items count, time elapsed
- ✓ GPS update realtime mỗi 5 giây (WebSocket)
- ✓ Color coding:
  - Green: on time
  - Yellow: at risk (>80% of ETA)
  - Red: late (>ETA)
- ✓ List view: alternative hiển thị danh sách orders (order ID, drone, status, time remaining)

**Độ Ưu Tiên:** CAO  
**Công Sức:** 8 điểm (Maps API + WebSocket)

---

#### **US-A03: Quản Lý Fleet Drone (Add/Edit/Delete/Lock/Status)**

**Là một:** Quản trị viên giao vận  
**Tôi muốn:** Add drone mới, sửa thông tin, xóa, hoặc lock khi bảo trì  
**Để:** Đảm bảo fleet luôn sẵn sàng & được bảo trì đúng cách

**Tiêu Chí Chấp Nhận:**
- ✓ Delivery → "Drones" tab → danh sách drones
- ✓ Mỗi drone: ID, status (available, busy, offline), location (lat/lng), max_weight
- ✓ Add: nút "Add Drone"
  - Nhập: identifier, model, max_weight_kg, base_location
  - POST /drones
- ✓ Edit: click "Edit" → form pre-filled → PATCH /drones/:id
- ✓ Delete: click "Delete" → confirm → DELETE (chỉ nếu status = "available")
- ✓ Lock/Unlock: toggle button → PATCH { status: "locked" | "available" }
  - Khi locked → drone không được gán orders
- ✓ Xem GPS realtime: click drone → show current location on map

**Độ Ưu Tiên:** TRUNG  
**Công Sức:** 5 điểm

---

#### **US-A04: Xem Dashboard KPI & Metrics Chính**

**Là một:** Quản trị viên cao cấp  
**Tôi muốn:** Trên 1 dashboard, xem tất cả KPI chính của hệ thống  
**Để:** Hiểu tình hình kinh doanh tổng thể & phát hiện vấn đề

**Tiêu Chí Chấp Nhận:**
- ✓ Dashboard home page → multiple widgets:
  - **Revenue:** today, this week, this month, this year (cards)
  - **Orders:** total, completed, cancelled, completion rate (%)
  - **Users:** active today, new today, total
  - **Restaurants:** active, new (pending), blocked
  - **Avg Rating:** overall rating across all restaurants
  - **Drone Status:** available, busy, offline count
- ✓ Charts:
  - Revenue trending (line chart, last 30 days)
  - Orders by hour (bar chart, today)
- ✓ Tables:
  - Top 10 restaurants (by revenue today)
  - Top 10 customers (by order count)
  - Recent orders (last 5)
- ✓ Update realtime hoặc auto-refresh mỗi 1 phút

**Độ Ưu Tiên:** CAO  
**Công Sức:** 7 điểm

---

#### **US-A05: Xem Tất Cả Orders & Báo Cáo Doanh Thu Chi Tiết**

**Là một:** Quản trị viên  
**Tôi muốn:** Xem & filter tất cả orders trong hệ thống, rồi generate báo cáo doanh thu chi tiết  
**Để:** Có data để phân tích & quyết định kinh doanh

**Tiêu Chí Chấp Nhận:**
- ✓ Orders tab → danh sách tất cả orders:
  - Filters: status, restaurant, date range, payment status
  - Search: order ID, customer name
  - Sort: by date, revenue, status
- ✓ Click order → OrderDetail (xem tất cả)
- ✓ Reports tab:
  - Date range picker (from/to)
  - Report type: select "Revenue", "Orders", hoặc "Delivery"
  - Generate report:
    - **Revenue:** tổng revenue, breakdown by day/week, revenue per restaurant, total discount
    - **Orders:** tổng orders, completion rate, cancel rate, avg delivery time
    - **Delivery:** drone efficiency, success rate, late deliveries count
  - Display: charts (revenue trend, orders per day), tables (per restaurant)
  - Export: PDF hoặc CSV

**Độ Ưu Tiên:** CAO  
**Công Sức:** 6 điểm

---

## **TỔNG KẾT**

**Tổng cộng 18 User Stories:**
- **Customer:** 8 stories
- **Restaurant:** 5 stories
- **Admin:** 5 stories

Mỗi story có:
- ✅ **AS A / I WANT / SO THAT** format rõ ràng
- ✅ **Tiêu chí chấp nhận (Acceptance Criteria)** cụ thể
- ✅ **Độ ưu tiên (Priority):** CAO / TRUNG / THẤP
- ✅ **Công sức (Effort):** 1-13 điểm (Planning Poker)

