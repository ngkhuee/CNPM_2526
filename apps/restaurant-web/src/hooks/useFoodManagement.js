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
            toast.success("Thêm món ăn thành công!");
            return { success: true, food: newFood };
        } catch (error) {
            console.error("Có lỗi khi thêm món ăn:", error);
            toast.error("Thêm món ăn thất bại!");
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
            toast.success("Cập nhật món ăn thành công!");
            return { success: true, food: updatedFood };
        } catch (error) {
            console.error("Có lỗi khi cập nhật món ăn:", error);
            toast.error("Cập nhật món ăn thất bại!");
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
            toast.success("Xóa món ăn thành công!");
            return { success: true };
        } catch (error) {
            console.error("Có lỗi khi xóa món ăn:", error);
            toast.error("Xóa món ăn thất bại!");
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
