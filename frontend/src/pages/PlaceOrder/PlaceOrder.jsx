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
    const { addOrder } = useContext(OrderContext);
    const { orders, setOrders } = useContext(RestaurantContext);
    const { restaurantId } = useContext(RestaurantContext);
    const { token, getTotalCartAmount } = useContext(StoreContext);

    const handlePlaceOrder = () => {
    if (!restaurantId) return alert("Select a restaurant first!");

    const newOrder = {
      _id: Date.now().toString(),
      restaurantId, // liên kết order với nhà hàng
      items: ["Pizza 4 Formaggi", "Double Whopper Jr."], // bạn có thể map từ cart
      user: userName || "User 1",
      status: "pending",
      droneStatus: "waiting"
    };

    addOrder(newOrder);
    alert("Order placed!");
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
