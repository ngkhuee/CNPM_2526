import React, { useContext, useState } from "react";
import { RestaurantContext } from "customer-shared";

const MenuAdd = ({ restaurantId }) => {
  const { partners, setPartners } = useContext(RestaurantContext);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  if (!restaurantId) return <p>Please select a restaurant first</p>;

  const handleAdd = () => {
    if (!name || !price) return alert("Enter name and price");
    setPartners((prev) =>
      prev.map((p) =>
        p._id === restaurantId
          ? { ...p, menu: [...(p.menu || []), { name, price: Number(price) }] }
          : p
      )
    );
    setName("");
    setPrice("");
  };

  return (
    <div>
      <h2>Add Menu Item</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item Name"
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        type="number"
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default MenuAdd;
