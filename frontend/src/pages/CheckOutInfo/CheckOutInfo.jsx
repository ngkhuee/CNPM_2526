import React, { useContext, useState } from "react";
import "./CheckOutInfo.css";
import { StoreContext } from "../../Context/StoreContext";
import { OrderContext } from "../../Context/OrderContext";
import { useNavigate } from "react-router-dom";

const CheckoutInfo = () => {
  const { cartItems, food_list, getTotalCartAmount, setCartItems } = useContext(StoreContext);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("❌ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Tạo đơn hàng gốc cho khách (dùng cho MyOrders)
    const newOrder = {
      id: Date.now(),
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
      items: food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          name: item.name,
          restaurant: item.restaurant,
          price: item.price * 1000,
          quantity: cartItems[item._id],
          total: item.price * 1000 * cartItems[item._id],
        })),
      total: getTotalCartAmount(),
      status: "Đang xử lý",
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    // 🧾 Lưu vào context cho khách (MyOrders)
    addOrder(newOrder);

    // 🍽️ Gom đơn hàng theo từng nhà hàng
    const groupedByRestaurant = {};
    newOrder.items.forEach(item => {
      if (!groupedByRestaurant[item.restaurant]) {
        groupedByRestaurant[item.restaurant] = [];
      }
      groupedByRestaurant[item.restaurant].push(item);
    });

    // 🧍‍♂️ Chuẩn bị dữ liệu khách hàng
    const addressInfo = {
      firstName: customer.name.split(" ")[0],
      lastName: customer.name.split(" ")[1] || "",
      phone: customer.phone,
      street: customer.address,
      city: "Hồ Chí Minh",
      state: "VN",
      country: "Việt Nam",
    };

    // 📦 Tạo đơn hàng riêng cho từng nhà hàng
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    Object.entries(groupedByRestaurant).forEach(([restaurantName, items]) => {
      const restaurantOrder = {
        id: newOrder.id + "-" + restaurantName,
        restaurantName,
        items,
        address: addressInfo,
        amount: items.reduce((sum, it) => sum + it.total, 0),
        status: "Food Processing",
        createdAt: newOrder.createdAt,
      };
      existingOrders.push(restaurantOrder);
    });

    // 💾 Lưu vào localStorage để nhà hàng đọc
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // ✅ Reset giỏ hàng và điều hướng
    setCartItems({});
    navigate("/myorders");
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
          <button type="submit" className="confirm-btn">
            Xác nhận đặt hàng
          </button>
        </form>
      </div>

      <div className="checkout-summary">
        <div className="order-list">
          <h3>Đơn hàng của bạn</h3>
          {food_list.filter(item => cartItems[item._id] > 0).length === 0 ? (
            <p>Chưa có sản phẩm nào.</p>
          ) : (
            food_list
              .filter(item => cartItems[item._id] > 0)
              .map((item, i) => (
                <div key={i} className="order-item">
                  <span>{item.name}</span>
                  <span>
                    {cartItems[item._id]} x {(item.price * 1000).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))
          )}
        </div>

        <div className="order-total">
          <h3>Tổng cộng:</h3>
          <p className="total-amount">
            {getTotalCartAmount().toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutInfo;
