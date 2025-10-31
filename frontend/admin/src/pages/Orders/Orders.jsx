import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import './Orders.css'
import { assets } from '../../assets/assets';
import { OrderContext } from '../../Context/OrderContext';

const Orders = () => {
  const { orders, updateOrderStatus } = useContext(OrderContext);

  return (
    <div>
      <h2>All Orders</h2>
      {orders.map(o => (
        <div key={o._id}>
          <p>User: {o.user}</p>
          <p>Items: {o.items.join(", ")}</p>
          <p>Status: {o.status}</p>
          <button onClick={() => updateOrderStatus(o._id, "completed")}>Complete</button>
        </div>
      ))}
    </div>
  );
};
// const Orders = () => {
//   const { orders, setOrders } = useContext(OrderContext);
//   const navigate = useNavigate();

//   const goToDrone = (order) => {
//     if (!order.drone) return;
//     navigate('/admin/delivery', { state: { drone: order.drone, order } });
//   };

//   const statusHandler = (event, orderId) => {
//     const newStatus = event.target.value;
//     setOrders(prev =>
//       prev.map(order =>
//         order._id === orderId ? { ...order, status: newStatus } : order
//       )
//     );
//   };

//   return (
//     <div className='order-page'>
//       <h2>Order Management</h2>
//       <div className="order-list">
//         {orders.map((order) => (
//           <div key={order._id} className='order-item'>
//             {/* Icon */}
//             <img src={assets.parcel_icon} alt="" />

//             {/* Thông tin chi tiết */}
//             <div className='order-info'>
//               <p className='order-item-food'>
//                 <strong>Items:</strong> {order.items.map((item, i) =>
//                   i === order.items.length - 1
//                     ? `${item.name} x ${item.quantity}`
//                     : `${item.name} x ${item.quantity}, `
//                 )}
//               </p>
//               <p className='order-item-restaurant'>
//                 <strong>Restaurant:</strong> {order.restaurantName || 'N/A'}
//               </p>
//               <p className='order-item-name'>
//                 <strong>Customer:</strong> {order.address.firstName} {order.address.lastName}
//               </p>
//               <div className='order-item-address'>
//                 <p>{order.address.street}, {order.address.city}</p>
//                 <p>{order.address.state}, {order.address.country}, {order.address.zipcode}</p>
//                 <p><strong>Phone:</strong> {order.address.phone}</p>
//               </div>
//             </div>

//             {/* Trạng thái và tổng tiền */}
//             <div className='order-actions'>
//               <p className='order-amount'>{order.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
//               <select
//                 onChange={(e) => statusHandler(e, order._id)}
//                 value={order.status}
//                 className={`status-${order.status.replace(/\s/g,'')}`}
//               >
//                 <option value="Food Processing">Food Processing</option>
//                 <option value="Out for delivery">Out for delivery</option>
//                 <option value="Delivered">Delivered</option>
//               </select>
//               {order.drone && (
//                 <button className='btn-drone' onClick={() => goToDrone(order)}>Drone</button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

export default Orders;
