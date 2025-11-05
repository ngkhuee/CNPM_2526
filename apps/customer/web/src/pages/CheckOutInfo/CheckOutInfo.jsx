import React, { useContext, useState, useEffect } from "react";
import "./CheckOutInfo.css";
import {
  AuthContext,
  CartContext,
  StoreContext,
  OrderContext,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdCheckCircle, MdError } from "react-icons/md";

const CheckoutInfo = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, getTotalCartAmount, clearCart } = useContext(CartContext);
  const { food_list } = useContext(StoreContext);
  const { addOrder } = useContext(OrderContext);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const [gpsLocation, setGpsLocation] = React.useState(null);
  const [loadingGPS, setLoadingGPS] = React.useState(false);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation({ lat: latitude, lng: longitude });
        setLoadingGPS(false);
        alert(
          `Đã lấy vị trí GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
      },
      (error) => {
        setLoadingGPS(false);
        console.error("GPS error:", error);
        alert("Không thể lấy vị trí GPS. Vui lòng nhập địa chỉ thủ công.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Prepare order items
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        foodId: item._id,
        name: item.name,
        price: item.price, // Price already in VND from DB
        quantity: cartItems[item._id],
        restaurantId: item.restaurantId, // Use camelCase from foodService
      }));

    // Group by restaurant
    const groupedByRestaurant = {};
    orderItems.forEach((item) => {
      if (!groupedByRestaurant[item.restaurantId]) {
        groupedByRestaurant[item.restaurantId] = [];
      }
      groupedByRestaurant[item.restaurantId].push(item);
    });

    // Create orders for each restaurant
    try {
      for (const [restaurantId, items] of Object.entries(groupedByRestaurant)) {
        const orderData = {
          customerId: user?.id || "guest",
          restaurantId,
          items,
          customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
          },
          dropoff_gps: gpsLocation || null, // GPS coordinates hoặc null
          total_amount: items.reduce(
            (sum, it) => sum + it.price * it.quantity,
            0
          ),
          status: "pending",
          payment_method: "online",
        };

        console.log("📦 Creating order:", orderData);
        const result = await addOrder(orderData);
        if (!result.success) {
          alert(`Lỗi tạo đơn hàng: ${result.message}`);
          return;
        }
      }

      // Reset cart (cả frontend và backend)
      await clearCart();

      alert(`✅ Đặt hàng thành công! Vui lòng chờ nhà hàng xác nhận.`);
      navigate("/myorders");
    } catch (error) {
      console.error("Order error:", error);
      alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-info">
        <h2>Thông tin khách hàng</h2>
        <form onSubmit={handleSubmit}>
          <label>Họ và tên</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleInput}
            placeholder="Nhập họ tên"
          />
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleInput}
            placeholder="Nhập số điện thoại"
          />
          <label>Địa chỉ giao hàng</label>
          <textarea
            name="address"
            value={customer.address}
            onChange={handleInput}
            placeholder="Nhập địa chỉ chi tiết"
          ></textarea>

          <button
            type="button"
            onClick={handleGetGPS}
            disabled={loadingGPS}
            className="gps-btn"
            style={{
              marginBottom: "10px",
              background: gpsLocation ? "#28a745" : "#007bff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {loadingGPS ? (
              "Đang lấy GPS..."
            ) : gpsLocation ? (
              <>
                <MdCheckCircle /> Đã lấy GPS
              </>
            ) : (
              <>
                <MdLocationOn /> Lấy vị trí GPS
              </>
            )}
          </button>

          <button type="submit" className="confirm-btn">
            Xác nhận đặt hàng
          </button>
        </form>
      </div>

      <div className="checkout-summary">
        <div className="order-list">
          <h3>Đơn hàng của bạn</h3>
          {food_list.filter((item) => cartItems[item._id] > 0).length === 0 ? (
            <p>Chưa có sản phẩm nào.</p>
          ) : (
            food_list
              .filter((item) => cartItems[item._id] > 0)
              .map((item, i) => (
                <div key={i} className="order-item">
                  <span>{item.name}</span>
                  <span>
                    {cartItems[item._id]} x {formatCurrency(item.price)}
                  </span>
                </div>
              ))
          )}
        </div>

        <div className="order-total">
          <h3>Tổng cộng:</h3>
          <p className="total-amount">
            {formatCurrency(getTotalCartAmount(food_list))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutInfo;
