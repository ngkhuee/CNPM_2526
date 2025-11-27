import { useState } from "react";
import { useFoodManagement } from "./useFoodManagement";
import { uploadService } from "shared-services";

export const useAddFood = () => {
    const { addFood } = useFoodManagement();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (file) => {
        if (file) {
            setImage(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (onSuccess) => {
        if (!image) {
            return { success: false, message: "Vui lòng tải lên ảnh" };
        }

        if (!formData.categoryId) {
            return { success: false, message: "Vui lòng chọn danh mục!" };
        }

        setLoading(true);

        try {
            // Step 1: Upload image to server
            const uploadResult = await uploadService.uploadImage(image, "foods");

            if (!uploadResult.success) {
                return { success: false, message: "Tải ảnh lên thất bại" };
            }

            // Step 2: Create food with uploaded image path
            const newFoodData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                categoryId: formData.categoryId,
                image: uploadResult.path, // Use path returned from server
                isAvailable: true,
                isFeatured: false,
                preparationTime: 20,
                rating: 0,
                total_reviews: 0,
            };

            const result = await addFood(newFoodData);

            if (result.success) {
                resetForm();
                if (onSuccess) {
                    onSuccess();
                }
            }

            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            return { success: false, message: error.message };
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            categoryId: "",
        });
        setImage(null);
    };

    const formatVND = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return {
        formData,
        image,
        loading,
        handleImageChange,
        handleInputChange,
        handleSubmit,
        resetForm,
        formatVND,
    };
};
