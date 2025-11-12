import { useState, useContext } from "react";
import { FoodContext } from "../Context/FoodContext";
import { CategoryContext } from "../Context/CategoryContext";
import { AuthContext } from "../Context/AuthContext";
import { useFoodManagement } from "./useFoodManagement";

export const useFoodList = () => {
    const { foodList } = useContext(FoodContext);
    const { categories } = useContext(CategoryContext);
    const { currentUser } = useContext(AuthContext);
    const { updateFood, deleteFood } = useFoodManagement();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [selectedFood, setSelectedFood] = useState(null);

    const restaurantFoods = foodList.filter(
        (food) => food.restaurantId === currentUser?.restaurantId
    );

    const getCategoryName = (food) => {
        if (food.categoryId) {
            const category = categories.find((c) => c.id === food.categoryId);
            return category ? category.name : "Uncategorized";
        }
        return food.category || "Uncategorized";
    };

    const filteredFoods = restaurantFoods.filter((item) => {
        const matchName = item.name.toLowerCase().includes(search.toLowerCase());
        const itemCategory = item.categoryId || item.category;
        const matchCategory =
            categoryFilter === "All" ||
            itemCategory === categoryFilter ||
            (!itemCategory && categoryFilter === "Uncategorized");
        return matchName && matchCategory;
    });

    const getUniqueCategoriesFromFoods = () => {
        return [...new Set(restaurantFoods.map((f) => f.category).filter(Boolean))];
    };

    return {
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        restaurantFoods,
        filteredFoods,
        categories,
        selectedFood,
        setSelectedFood,
        getCategoryName,
        getUniqueCategoriesFromFoods,
        updateFood,
        deleteFood,
    };
};
