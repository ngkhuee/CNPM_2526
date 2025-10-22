import React, { useContext } from "react";
import { OrderContext } from "../../Context/OrderContext";
import "./MyOrders.css";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { orders } = useContext(OrderContext);
  const navigate = useNavigate();
  return (
    <div className="myorders">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Order #{order._id}</h3>
            <p><b>Trạng thái:</b> {order.status}</p>
            <p><b>Ngày đặt:</b> {order.createdAt}</p>
            {/* Thông tin khách hàng */}
            <p><b>Khách hàng:</b> {order.customer.name}</p>
            <p><b>SĐT:</b> {order.customer.phone}</p>
            <p><b>Địa chỉ:</b> {order.customer.address}</p>
            <button
              className="track-btn"
              onClick={() => navigate(`/tracking/${order._id}`)}
            >
              Theo dõi đơn hàng
            </button>
            <table>
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th>Nhà hàng</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.restaurant}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString("vi-VN")}đ</td>
                    <td>{item.total.toLocaleString("vi-VN")}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
