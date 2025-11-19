// hooks/useFoodSearch.js - Quản lý search logic
import { useState, useEffect } from 'react';

export const useFoodSearch = (allFoods) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState([]);

    useEffect(() => {
        let result = [...allFoods];

        if (searchQuery.trim()) {
            result = result.filter((food) =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (food.description &&
                    food.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredFoods(result);
    }, [searchQuery, allFoods]);

    return {
        searchQuery,
        setSearchQuery,
        filteredFoods,
    };
};
