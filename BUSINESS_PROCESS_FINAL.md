# 📋 QUY TRÌNH NGHIỆP VỤ CHÍNH - FOOD DELIVERY SYSTEM

---

## **1. Quy Trình Tìm Kiếm, Chọn Sản Phẩm & Thanh Toán**

Khách hàng mở ứng dụng và cấp quyền GPS để hệ thống tìm các nhà hàng gần nhất trong bán kính 5km. Danh sách nhà hàng được hiển thị kèm tên, ảnh logo, rating trung bình, giờ mở cửa, thời gian giao dự kiến, và khoảng cách từ vị trí hiện tại. Khách hàng có thể lọc theo danh mục (Pizza, Gà rán, Mì, v.v.) hoặc sắp xếp theo tiêu chí khác như rating cao nhất.

Sau khi chọn nhà hàng, khách hàng xem menu được chia theo các danh mục sản phẩm. Mỗi sản phẩm hiển thị tên, ảnh, giá, mô tả ngắn, và rating từ các khách hàng trước đó. Khách hàng click vào sản phẩm để xem chi tiết đầy đủ, chọn số lượng, và có thể thêm ghi chú đặc biệt (ví dụ: "ít đường", "không hành", v.v.). Sau đó, sản phẩm được thêm vào giỏ hàng. Khách hàng tiếp tục thêm các sản phẩm khác hoặc tiến hành thanh toán.

Tại trang giỏ hàng, khách hàng xem danh sách items với giá từng sản phẩm, có thể cập nhật số lượng hoặc xóa items không cần. Hệ thống hiển thị tổng giá (subtotal) và phí giao mặc định. Khách hàng có thể nhập mã khuyến mãi (nếu có) để được giảm giá. Hệ thống kiểm tra mã: kiểm tra mã tồn tại, còn hạn sử dụng, còn lượt dùng, và đơn hàng đủ tiền tối thiểu. Nếu hợp lệ, hệ thống tính toán giảm giá (phần trăm hoặc số tiền cố định) và cập nhật tổng tiền cuối cùng.

Khi khách hàng click "Proceed to Checkout", họ được chuyển tới trang thanh toán. Tại đây, khách hàng phải:
- **Chọn địa chỉ giao hàng:** Có thể dùng một trong các địa chỉ đã lưu trước (nhà riêng, công ty, v.v.) hoặc nhập địa chỉ mới bằng cách nhập tên đường, huyện, thành phố. Khách hàng có thể bấm "Get GPS" để hệ thống tự động lấy tọa độ hiện tại.
- **Chọn phương thức thanh toán:** Khách hàng chọn giữa MoMo hoặc tiền mặt (COD). Nếu chọn MoMo, hệ thống sẽ redirect sang MoMo app hoặc website. Khách xác nhận thanh toán trong MoMo, MoMo gửi callback về hệ thống, và nếu thành công, đơn hàng được confirm ngay. Nếu chọn tiền mặt, khách sẽ thanh toán khi nhận hàng.
- **Xem lại tóm tắt:** Trước khi submit, khách xem lại items, địa chỉ, phí giao, khuyến mãi, và tổng tiền.

Sau khi xác nhận, đơn hàng được tạo trong hệ thống với status = "pending" (hoặc "confirmed" nếu thanh toán MoMo). Giỏ hàng được xóa, và khách hàng chuyển sang trang "Order Tracking" để xem trạng thái đơn hàng realtime.

---

## **2. Quy Trình Theo Dõi & Nhận Hàng**

Sau khi đặt hàng, khách hàng được chuyển tới trang "Order Tracking" hiển thị thông tin đơn hàng (Order ID, danh sách items, tổng tiền, địa chỉ giao). Trang này hiển thị một thanh tiến trình (progress bar) của trạng thái đơn hàng: Pending → Confirming → Preparing → Ready → Shipping → Completed.

Khi đơn hàng được nhà hàng xác nhận, status chuyển sang "Confirming", và khách nhận được thông báo. Khi nhà hàng bắt đầu chuẩn bị, status chuyển sang "Preparing". Khi chuẩn bị xong, status chuyển sang "Ready". Tại mỗi bước, khách hàng nhận được push notification cập nhật.

Khi shipper/drone lấy hàng và bắt đầu giao, status chuyển sang "Shipping". Từ lúc này, trang tracking hiển thị bản đồ realtime với GPS location của drone/shipper, vị trí nhà hàng, và vị trí đích giao hàng. GPS tự động update mỗi 5-10 giây thông qua WebSocket connection. Khách hàng thấy thời gian dự kiến giao (ví dụ: "Est. delivery in 18-23 minutes") và có thể nhấn nút "Call Shipper" hoặc "Message Shipper" nếu cần.

Khi shipper đến địa chỉ giao, khách hàng kiểm tra hàng. Nếu đúng và đầy đủ, khách xác nhận nhận hàng trong ứng dụng (hoặc ứng dụng tự động đánh dấu sau khoảng thời gian). Nếu thanh toán bằng MoMo, tiền đã trả từ trước. Nếu tiền mặt, khách thanh toán lúc này. Order status chuyển sang "Completed". Khách hàng có thể xem lại thông tin đơn hàng trong tab "MyOrders" và lưu vào lịch sử.

---

## **3. Quy Trình Đánh Giá & Quản Lý Tài Khoản**

Sau khi nhận hàng thành công (order status = "completed"), khách hàng có thể viết đánh giá cho sản phẩm hoặc nhà hàng. Khách vào tab "MyOrders", chọn order đã completed, nhấn "Review", chọn sao (1-5), viết comment, và tải ảnh (tùy chọn). Submit review → review được lưu và dùng để tính rating trung bình của sản phẩm/nhà hàng. Các khách khác có thể xem reviews này khi duyệt menu.

Khách hàng có thể quản lý tài khoản và địa chỉ bằng cách vào Profile. Trên tab "Account", khách có thể cập nhật tên, số điện thoại, giới tính, ngày sinh, và ảnh đại diện. Trên tab "Addresses", khách có thể xem danh sách các địa chỉ đã lưu, thêm địa chỉ mới, sửa/xóa địa chỉ cũ, hoặc set một địa chỉ làm mặc định. Khi checkout lần sau, hệ thống tự động chọn địa chỉ mặc định.

---

## **4. Quy Trình Quản Lý Menu & Tiếp Nhận Đơn (Nhà Hàng)**

Chủ nhà hàng đăng nhập vào dashboard. Trên tab "Menu", chủ nhà hàng xem danh sách tất cả sản phẩm với tên, giá, danh mục, ảnh, và status (available/unavailable). Chủ có thể thêm sản phẩm mới bằng cách nhấn "Add Product" → nhập tên, mô tả, giá, chọn danh mục, upload ảnh → save. Sản phẩm ngay lập tức xuất hiện trong menu khách hàng.

Chủ nhà hàng có thể sửa thông tin sản phẩm (tên, giá, description, ảnh) bằng cách click "Edit" → cập nhật → save. Nếu sản phẩm hết hàng hoặc không muốn bán, chủ có thể toggle "Available/Unavailable" → sản phẩm ẩn khỏi menu khách, nhưng đơn cũ vẫn giữ. Chủ cũng có thể xóa sản phẩm hoàn toàn (chỉ khi không có orders) bằng "Delete".

Khi khách hàng đặt hàng thành công, chủ nhà hàng nhận được thông báo đơn hàng mới. Chủ vào tab "Orders" để xem danh sách orders. Mỗi order hiển thị Order ID, khách hàng, danh sách items, địa chỉ, tổng tiền, và thời gian đặt. Chủ click vào order để xem chi tiết đầy đủ, bao gồm các ghi chú đặc biệt từ khách.

Chủ nhà hàng kiểm tra kho: có đủ tất cả items không? Nếu có, chủ nhấn "Confirm Order" → status chuyển từ "pending" sang "confirming", khách được notify. Nếu hết hàng, chủ nhấn "Reject" → nhập lý do → order status = "cancelled", khách được hoàn tiền tự động, và nhận thông báo.

Một khi order được confirm, chủ bắt đầu chuẩn bị: lấy sản phẩm từ kho, kiểm tra, đóng gói. Chủ nhấn "Start Preparing" → status chuyển sang "preparing", khách được notify. Khi chuẩn bị xong, chủ nhấn "Ready" → status chuyển sang "ready", đơn đặt trên quầy chờ shipper/drone. Khi shipper lấy hàng, chủ nhấn "Assign to Delivery" → status chuyển sang "shipping", khách được notify và bản đồ tracking bắt đầu hiển thị.

---

## **5. Quy Trình Quản Lý Khuyến Mãi (Nhà Hàng)**

Chủ nhà hàng có thể tạo mã khuyến mãi riêng trên tab "Promotions". Chủ nhấn "Add Promotion" → nhập mã (ví dụ: "SUMMER50"), chọn loại giảm (Percentage hoặc Fixed amount), nhập giá trị giảm (ví dụ: 20% hoặc 50,000 VND), đặt ngày bắt đầu/kết thúc, giá trị tối thiểu order, và số lượt dùng tối đa. Save → mã được tạo.

Khách hàng có thể dùng mã này khi checkout bằng cách nhập mã vào field "Promo Code". Hệ thống verify mã: kiểm tra mã có tồn tại, còn hạn sử dụng, còn lượt dùng, và đơn hàng đủ minimum. Nếu hợp lệ, hệ thống tính discount (phần trăm hoặc cố định) và cập nhật tổng tiền. Mỗi khi khách dùng, usage_count tự động tăng.

Chủ nhà hàng có thể xem danh sách promotions, edit hoặc delete. Chủ cũng có thể xem thống kê: số lần dùng, tổng tiền đã giảm từ mã này.

---

## **6. Quy Trình Báo Cáo & Phân Tích (Nhà Hàng)**

Chủ nhà hàng có thể xem dashboard hiển thị các KPI chính:
- **Doanh số hôm nay, tuần, tháng:** Tính từ tất cả orders completed trong khoảng thời gian đó
- **Số orders hôm nay:** Tổng orders completed hôm nay
- **Rating trung bình:** Tính từ tất cả reviews
- **Top 5 products:** Sản phẩm bán chạy nhất hôm nay

Chủ nhà hàng có thể xem báo cáo chi tiết bằng cách vào tab "Reports". Chủ chọn khoảng thời gian (ngày, tuần, tháng) → hệ thống generate báo cáo với:
- Tổng doanh thu (breakdown by day nếu range lớn)
- Số orders completed
- Danh sách top 10 products: tên, số lượng bán, doanh thu
- Tổng discount từ promo codes
- Net revenue (doanh thu sau các khoản trừ)

Dữ liệu này giúp chủ hiểu trend kinh doanh và tối ưu hóa menu, giá cả, hoặc khuyến mãi.

---

## **7. Quy Trình Duyệt Đăng Ký & Quản Lý Nhà Hàng (Admin)**

Khi nhà hàng mới nộp đơn đăng ký (thông qua page "Register Restaurant"), yêu cầu được lưu với status = "pending". Admin nhận được thông báo. Admin truy cập dashboard, vào tab "Restaurants" → Filter status = "pending". Danh sách pending restaurants được hiển thị với tên, chủ, email, địa chỉ, ngày đăng ký.

Admin click vào request để xem chi tiết đầy đủ: thông tin chủ nhà hàng (tên, email, phone, address), thông tin nhà hàng (tên, description, address, GPS location, ảnh), menu hiện tại (nếu đã upload).

Admin kiểm tra thông tin. Nếu hợp lệ, admin nhấn "Approve" → restaurant status = "active", owner user status = "active". Email được gửi cho chủ: "Congratulations! Your restaurant has been approved." Chủ có thể login và bắt đầu bán hàng. Nếu không hợp lệ, admin nhấn "Reject" → restaurant status = "blocked", owner status = "blocked", email được gửi với lý do từ chối.

Admin cũng có thể khóa/mở khóa nhà hàng đang hoạt động (nếu vi phạm chính sách) bằng "Block" hoặc "Unblock".

---

## **8. Quy Trình Giám Sát Đơn Hàng & Giao Hàng (Admin)**

Admin có thể xem tất cả orders trong hệ thống qua tab "Orders". Admin có thể filter theo status (pending, confirming, preparing, ready, shipping, completed, cancelled), restaurant, hoặc date range. Admin click vào order để xem chi tiết đầy đủ.

Admin cũng có thể xem bản đồ realtime của tất cả drones/shipper đang giao hàng (Delivery → Map). Bản đồ hiển thị: pin restaurants, icon drone (chỉ khi shipping), pin customer addresses, đường nối từ restaurant → drone → customer. GPS update realtime mỗi 5 giây. Color coding: Green = on time, Yellow = at risk, Red = late.

Nếu có vấn đề (ví dụ: shipper bị lạc, late delivery), admin có thể liên hệ trực tiếp với shipper, xem lịch sử orders để phân tích, hoặc gửi bù tiền cho khách nếu cần.

---

## **9. Quy Trình Quản Lý Drone & Fleet (Admin)**

Admin quản lý toàn bộ drone fleet qua tab "Delivery" → "Drones". Danh sách drones hiển thị: ID, status (available, busy, offline), GPS location hiện tại, trọng tải tối đa, số orders đã giao hôm nay.

Admin có thể thêm drone mới: "Add Drone" → nhập identifier, model, max_weight, base_location → save. Admin có thể sửa thông tin drone: click "Edit" → cập nhật → save. Admin có thể xóa drone (chỉ khi idle): "Delete" → confirm.

Admin có thể lock/unlock drone (khi bảo trì hoặc không dùng): toggle button → drone locked không được gán orders mới. Admin có thể xem GPS realtime của drone bằng cách click vào drone → show location trên bản đồ.

Khi có orders ready for delivery, hệ thống tự động assign drone sẵn có (status = "available") tới orders theo thuật toán tối ưu (ví dụ: drone gần nhất, drone có capacity, v.v.).

---

## **10. Quy Trình Dashboard & Báo Cáo Hệ Thống (Admin)**

Admin có dashboard chính với nhiều widgets hiển thị KPI toàn hệ thống:

**Revenue Metrics:**
- Doanh số hôm nay, tuần, tháng, năm
- Chart: doanh thu trending (last 30 days)

**Orders Metrics:**
- Tổng số orders
- Completion rate (%)
- Cancel rate (%)
- Avg order value

**Users & Restaurants:**
- Số active customers
- Số new customers (today, this week)
- Số active restaurants
- Số pending restaurants (chờ duyệt)

**System Health:**
- Average rating (tất cả restaurants)
- Average delivery time
- Drone availability (available vs total)

**Top Performers:**
- Top 10 restaurants (by revenue)
- Top 10 customers (by order count)
- Top 10 products (by qty sold)

Tất cả metrics update realtime hoặc mỗi 1-5 phút.

Admin có thể tạo báo cáo chi tiết bằng cách vào "Reports" → chọn report type (Revenue, Orders, Users, Restaurants, Delivery) → chọn date range → hệ thống generate báo cáo với charts và tables. Admin có thể export dưới dạng PDF hoặc CSV.

---

## **11. Quy Trình Quản Lý Users & Moderation (Admin)**

Admin có thể xem tất cả users (customers + restaurant owners) qua tab "Users". Admin có thể filter theo role (customer, restaurant_owner) hoặc status (active, blocked). Admin có thể tìm kiếm theo email, name, hoặc phone.

Admin click vào user → xem detail: thông tin, orders history, reviews. Nếu phát hiện user vi phạm chính sách (spam, fraud, abuse), admin có thể "Block" → user không thể login, khách không thể đặt hàng, nhà hàng không thể receive orders. Admin cũng có thể "Unblock" nếu cần.

Admin có thể xóa tài khoản user (chỉ khi không có orders/transactions): "Delete" → confirm → tài khoản bị xóa vĩnh viễn.

---

## **12. Quy Trình Hủy Đơn Hàng**

Nếu khách hàng thay đổi ý hoặc cần hủy đơn, họ có thể hủy miễn là đơn hàng chưa bắt đầu chuẩn bị (status = "pending" hoặc "confirming").

Khách vào "MyOrders" → chọn order → nhấn "Cancel" → confirm hủy. Hệ thống gửi yêu cầu hủy tới nhà hàng. Nếu order status = "pending" (nhà hàng chưa confirm), hủy ngay, hoàn tiền nếu có. Nếu status = "confirming" (nhà hàng đã nhận), cần nhà hàng xác nhận hủy. Nếu thanh toán MoMo rồi, hoàn tiền tự động.

Order status chuyển sang "cancelled", khách được notify, và order biến mất khỏi "Active Orders", chuyển tới "Cancelled".

