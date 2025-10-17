import React, { useContext } from "react";
import { RestaurantContext } from "../../Context/RestaurantContext";

const MenuList = ({ restaurantId }) => {
  const { partners } = useContext(RestaurantContext);

  if (!restaurantId) return <p>Please select a restaurant first</p>;

  const restaurant = partners.find(p => p._id === restaurantId);
  const menu = restaurant?.menu || [];

  return (
    <div>
      <h2>Menu for {restaurant.name}</h2>
      <ul>
        {menu.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuList;
