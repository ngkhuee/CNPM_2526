import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { categoryService } from "shared-services";
import { CategoryContext } from "../Context/CategoryContext";

export const useCategoryManagement = () => {
    const { setCategories, categories } = useContext(CategoryContext);
    const [loading, setLoading] = useState(false);

    const addCategory = async (categoryData) => {
        setLoading(true);
        try {
            const newCategory = await categoryService.create(categoryData);
            setCategories((prev) => [...prev, newCategory]);
            toast.success("Category created successfully!");
            return { success: true, data: newCategory };
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Error creating category");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (id, updatedData) => {
        setLoading(true);
        try {
            const updated = await categoryService.update(id, updatedData);
            setCategories((prev) =>
                prev.map((cat) => (cat.id === id ? updated : cat))
            );
            toast.success("Category updated successfully!");
            return { success: true, data: updated };
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        setLoading(true);
        try {
            await categoryService.delete(id);
            setCategories((prev) => prev.filter((cat) => cat.id !== id));
            toast.success("Category deleted successfully!");
            return { success: true };
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Error deleting category");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const getCategoryById = (id) => {
        return categories.find((cat) => cat.id === id);
    };

    return {
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        loading,
    };
};
