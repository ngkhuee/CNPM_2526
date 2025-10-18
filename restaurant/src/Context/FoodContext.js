// src/Context/FoodContext.js
import React, { createContext, useState } from "react";
import { food_list as initialFoodList } from "../shared/foodData";

// Tạo context
export const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([...initialFoodList]);
    // Tạo object chứa state và updater
    const contextValue = {
        foodList,
        setFoodList,
    };
    
    return React.createElement(
        FoodContext.Provider,
        { value: contextValue },
        children
    );
};
