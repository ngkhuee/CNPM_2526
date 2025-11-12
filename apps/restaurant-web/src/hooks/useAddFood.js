import { useState } from "react";
import { useFoodManagement } from "./useFoodManagement";

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
            return { success: false, message: "Please upload an image" };
        }

        if (!formData.categoryId) {
            return { success: false, message: "Please select a category!" };
        }

        setLoading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const newFoodData = {
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    categoryId: formData.categoryId,
                    image: reader.result,
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

        reader.readAsDataURL(image);
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
