import React, { useContext } from "react";
import { OrderContext } from "../../Context/OrderContext";
import "./MyOrders.css";

const MyOrders = () => {
  const { orders } = useContext(OrderContext);

  return (
    <div className="myorders">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p><b>Trạng thái:</b> {order.status}</p>
            <p><b>Ngày đặt:</b> {order.createdAt}</p>
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
