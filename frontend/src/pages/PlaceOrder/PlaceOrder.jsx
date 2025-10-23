import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { OrderContext } from '../../Context/OrderContext';


const PlaceOrder = () => {

    // const [data, setData] = useState({
    //     firstName: "",
    //     lastName: "",
    //     email: "",
    //     street: "",
    //     city: "",
    //     state: "",
    //     zipcode: "",
    //     country: "",
    //     phone: ""
    // })
    // const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext);

    // const navigate = useNavigate();

    // const onChangeHandler = (event) => {
    //     const name = event.target.name
    //     const value = event.target.value
    //     setData(data => ({ ...data, [name]: value }))
    // }

    // const placeOrder = async (e) => {
    //     e.preventDefault()
    //     let orderItems = [];
    //     food_list.map(((item) => {
    //         if (cartItems[item._id] > 0) {
    //             let itemInfo = item;
    //             itemInfo["quantity"] = cartItems[item._id];
    //             orderItems.push(itemInfo)
    //         }
    //     }))
    //     let orderData = {
    //         address: data,
    //         items: orderItems,
    //         amount: getTotalCartAmount() + 5,
    //     }
    //     let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    //     if (response.data.success) {
    //         const { session_url } = response.data;
    //         window.location.replace(session_url);
    //     }
    //     else {
    //         toast.error("Something Went Wrong")
    //     }
    // }
    const { token, getTotalCartAmount, cartItems, food_list, user } = useContext(StoreContext);
    const { restaurantId, partners } = useContext(RestaurantContext);

    const handlePlaceOrder = () => {
      if (!restaurantId) return alert("Select a restaurant first!");
      if (!cartItems || Object.keys(cartItems).length === 0) return alert("Giỏ hàng rỗng");

      // build items array from cartItems and food_list
      const items = [];
      for (const fid of Object.keys(cartItems)) {
        const qty = cartItems[fid];
        const info = (food_list || []).find(f => String(f._id) === String(fid));
        if (info) {
          items.push({ name: info.name, quantity: qty, price: info.price });
        } else {
          items.push({ name: fid, quantity: qty, price: 0 });
        }
      }

      const restaurant = (partners || []).find(r => r._id === restaurantId) || {};

      const amount = items.reduce((s, it) => s + (Number(it.price || 0) * 1000) * it.quantity, 0);

      const newOrder = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        restaurantId,
        restaurantName: restaurant.name || "Unknown",
        items,
        user: user ? (user.firstName || user.name || user.email) : "Guest",
        status: "pending",
        droneStatus: "waiting",
        amount
      };

      // write to shared localStorage key 'orders'
      const existing = JSON.parse(localStorage.getItem('orders') || '[]');
      existing.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(existing));

      alert('Order placed!');
    };
    // const handlePlaceOrder = () => {
    //     const newOrder = {
    //     _id: Date.now().toString(),
    //     items: ["Pizza 4 Formaggi", "Double whopper jr."],
    //     user: "User 1",
    //     status: "pending"
    //     };
    //     addOrder(newOrder);
    //     alert("Order placed!");
    // };

    useEffect(() => {
    if (!token) {
        toast.error("to place an order sign in first")
        navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
        navigate('/cart')
    }
    }, [token])


    return <button onClick={handlePlaceOrder}>Place Order</button>;
        
}

export default PlaceOrder
