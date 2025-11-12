import { useState, useCallback } from "react";
import { promotionService } from "shared-services";

const INITIAL_FORM_DATA = {
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "active",
};

export const usePromotionForm = (onSuccess) => {
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
        setEditingPromotion(null);
    }, []);

    const openModal = useCallback((promotion = null) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setFormData({
                code: promotion.code,
                name: promotion.name,
                description: promotion.description,
                type: promotion.type,
                value: promotion.value,
                minOrderValue: promotion.minOrderValue,
                maxDiscount: promotion.maxDiscount,
                startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
                endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
                usageLimit: promotion.usageLimit,
                status: promotion.status,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    }, [resetForm]);

    const closeModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const promotionData = {
            ...formData,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue) || 0,
            maxDiscount: Number(formData.maxDiscount) || 0,
            usageLimit: Number(formData.usageLimit) || 0,
            usedCount: editingPromotion ? editingPromotion.usedCount : 0,
            applicableRestaurants: [],
        };

        try {
            if (editingPromotion) {
                await promotionService.update(editingPromotion.id, promotionData);
                alert("Promotion updated successfully!");
            } else {
                await promotionService.create(promotionData);
                alert("Promotion created successfully!");
            }
            closeModal();
            resetForm();
            onSuccess?.();
        } catch (error) {
            alert("Failed to save promotion: " + error.message);
        }
    }, [formData, editingPromotion, closeModal, resetForm, onSuccess]);

    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm("Are you sure you want to delete this promotion?")) {
            try {
                await promotionService.delete(id);
                alert("Promotion deleted successfully!");
                onSuccess?.();
            } catch (error) {
                alert("Failed to delete promotion");
            }
        }
    }, [onSuccess]);

    const handleToggleStatus = useCallback(async (promotion) => {
        const newStatus = promotion.status === "active" ? "inactive" : "active";
        try {
            await promotionService.update(promotion.id, { status: newStatus });
            onSuccess?.();
        } catch (error) {
            alert("Failed to update status");
        }
    }, [onSuccess]);

    return {
        showModal,
        editingPromotion,
        formData,
        openModal,
        closeModal,
        handleSubmit,
        handleChange,
        handleDelete,
        handleToggleStatus,
        resetForm,
    };
};
