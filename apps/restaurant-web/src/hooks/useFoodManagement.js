import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { foodService } from "shared-services";
import { FoodContext } from "../Context/FoodContext";

export const useFoodManagement = () => {
    const { setFoodList, foodList } = useContext(FoodContext);
    const [loading, setLoading] = useState(false);

    const addFood = async (foodData) => {
        try {
            setLoading(true);
            const newFood = await foodService.create(foodData);
            setFoodList((prev) => [...prev, newFood]);
            toast.success("Food added successfully!");
            return { success: true, food: newFood };
        } catch (error) {
            console.error("Error adding food:", error);
            toast.error("Failed to add food");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const updateFood = async (foodId, foodData) => {
        try {
            setLoading(true);
            const updatedFood = await foodService.update(foodId, foodData);
            setFoodList((prev) =>
                prev.map((f) => (f.id === foodId ? updatedFood : f))
            );
            toast.success("Food updated successfully!");
            return { success: true, food: updatedFood };
        } catch (error) {
            console.error("Error updating food:", error);
            toast.error("Failed to update food");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteFood = async (foodId) => {
        try {
            setLoading(true);
            await foodService.delete(foodId);
            setFoodList((prev) => prev.filter((f) => f.id !== foodId));
            toast.success("Food deleted successfully!");
            return { success: true };
        } catch (error) {
            console.error("Error deleting food:", error);
            toast.error("Failed to delete food");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const getFoodById = (foodId) => {
        return foodList.find((f) => f.id === foodId);
    };

    const getFoodsByCategory = (categoryId) => {
        return foodList.filter((f) => f.categoryId === categoryId || f.category === categoryId);
    };

    return {
        addFood,
        updateFood,
        deleteFood,
        getFoodById,
        getFoodsByCategory,
        loading,
    };
};
