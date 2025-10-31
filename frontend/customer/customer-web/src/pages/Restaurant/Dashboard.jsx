import React, { useContext, useEffect, useState } from "react";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { restaurant_list } from "../../assets/assets";

const Dashboard = () => {
  const { restaurantId } = useContext(RestaurantContext); // id hiện tại
  const [restaurantData, setRestaurantData] = useState(null);

  useEffect(() => {
    const data = restaurant_list.find(r => r._id === restaurantId);
    setRestaurantData(data);
  }, [restaurantId]);

  if (!restaurantData) return <div>Loading...</div>;

  return (
    <div>
      <h2>{restaurantData.name} Dashboard</h2>
      <h3>Orders:</h3>
      <ul>
        {restaurantData.orders?.length > 0 ? (
            restaurantData.orders.map((order, i) => (
                <li key={i}>{order.item} - {order.status}</li>
            ))
            ) : (
            <li>No orders yet</li>
            )}
      </ul>
    </div>
  );
};

export default Dashboard;
