import React, { useContext } from "react";
import { RestaurantContext } from "../../Context/RestaurantContext";
import "./Partners.css";

const Partners = ({ selectRestaurant }) => {
  const { partners } = useContext(RestaurantContext);

  return (
    <div className="partners-container">
      <h2>Manage Partners</h2>
      <ul className="partners-list">
        {partners.map(p => (
          <li key={p._id}>
            <span>{p.name} - {p.address}</span>
            <button onClick={() => selectRestaurant(p._id)}>Manage</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Partners;
