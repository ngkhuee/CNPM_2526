import React, { useState } from 'react';
import { useContext } from 'react';
import './List.css';
import { FoodContext } from '../../Context/FoodContext';

const List = () => {
  const { foodList, setFoodList } = useContext(FoodContext);

  const removeFood = (foodId) => {
    setFoodList(prev => prev.filter(item => item._id !== foodId));
  };

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          {/* <b>Description</b> */}
          <b>Action</b>
        </div>
        {foodList.map((item, index) => (
          <div key={index} className='list-table-format'>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
            <p className='cursor' onClick={() => removeFood(item._id)}>x</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
