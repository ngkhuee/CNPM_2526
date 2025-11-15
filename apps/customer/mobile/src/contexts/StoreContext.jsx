import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StoreContext = createContext(null);

const API_BASE = 'http://192.168.0.127:4000';

export function StoreContextProvider({ children }) {
    const [foodList, setFoodList] = useState([]);
    const [restaurantList, setRestaurantList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [foodRes, restaurantRes] = await Promise.all([
                axios.get(`${API_BASE}/menus`),
                axios.get(`${API_BASE}/restaurants`),
            ]);

            setFoodList(foodRes.data || []);
            setRestaurantList(restaurantRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StoreContext.Provider value={{ foodList, restaurantList, loading, error }}>
            {children}
        </StoreContext.Provider>
    );
}
