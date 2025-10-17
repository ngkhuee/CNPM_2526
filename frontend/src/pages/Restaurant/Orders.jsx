import React, { useContext } from "react";
import { RestaurantContext } from "../../Context/RestaurantContext";

const Orders = ({ restaurantId }) => {
  const { orders, updateOrderStatus, updateDroneStatus } = useContext(RestaurantContext);

  if (!restaurantId) return <p>Please select a restaurant first</p>;

  const myOrders = orders.filter(o => o.restaurantId === restaurantId);

  return (
    <div>
      <h2>Orders for Restaurant </h2>
      {myOrders.length === 0 && <p>No orders yet.</p>}
      <ul>
        {myOrders.map(o => (
          <li key={o._id}>
            <p>Order #{o._id} - {o.status}</p>
            <p>Drone: {o.droneStatus || "not assigned"}</p>
            <button onClick={() => updateOrderStatus(o._id, "preparing")}>Set Preparing</button>
            <button onClick={() => updateOrderStatus(o._id, "ready")}>Set Ready</button>
            <button onClick={() => updateDroneStatus(o._id, "picked_up")}>Drone Picked</button>
            <button onClick={() => updateDroneStatus(o._id, "delivered")}>Drone Delivered</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
