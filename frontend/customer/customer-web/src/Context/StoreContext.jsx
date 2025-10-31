import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
//import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    //const url = "https://tomato-food-del-backend-p1ni.onrender.com"
    //const [food_list, setFoodList] = useState({});
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    
    // thêm vào state
    const [user, setUser] = useState(() =>  {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
    });

    // thêm hàm login/logout
    const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken("fake-token"); // nếu cần token tạm
    localStorage.setItem("token", "fake-token"); // localStorage
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        setToken("");
        };

        const addToCart = (itemId, qty = 1) => {
            setCartItems((prev) => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + qty, // nếu chưa có thì = qty, nếu có thì +qty
            }));
        };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            if (!prev[itemId]) return prev; // nếu chưa có thì giữ nguyên
            if (prev[itemId] === 1) {
            const updatedCart = { ...prev };
            delete updatedCart[itemId]; // xoá món nếu về 0
            return updatedCart;
            }
            return { ...prev, [itemId]: prev[itemId] - 1 }; // giảm số lượng
        });
    };

    

    // code mới
    const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
        if (cartItems[item] > 0) {
        let itemInfo = food_list.find(
            (product) => String(product._id) === String(item) // ép kiểu so sánh
        );
        if (itemInfo) {
             totalAmount += itemInfo.price * 1000 * cartItems[item];
        } else {
            console.warn("Không tìm thấy sản phẩm:", item);
        }
        }
    }
    return totalAmount;
    };



    const contextValue = {
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        setCartItems,
        user,
        login,
        logout,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;
