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
    applicableTimeRange: "Cả ngày",
    isAllDay: true,
    startTime: "",
    endTime: "",
    status: "active",
};

export const usePromotionForm = (restaurantId, onSuccess) => {
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
            const timeRange = promotion.applicableTimeRange || "Cả ngày";
            const isAllDay = timeRange === "Cả ngày";
            let startTime = "";
            let endTime = "";

            // Parse time range if not all day
            if (!isAllDay) {
                const match = timeRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
                if (match) {
                    startTime = match[1];
                    endTime = match[2];
                }
            }

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
                applicableTimeRange: timeRange,
                isAllDay: isAllDay,
                startTime: startTime,
                endTime: endTime,
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

        if (!restaurantId) {
            alert("Lỗi: Không tìm thấy ID nhà hàng!");
            return;
        }

        // Validate time range if not all day
        if (!formData.isAllDay) {
            if (!formData.startTime || !formData.endTime) {
                alert("Vui lòng nhập đầy đủ khung giờ áp dụng!");
                return;
            }
            // Check if start time is before end time
            if (formData.startTime >= formData.endTime) {
                alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");
                return;
            }
        }

        const promotionData = {
            ...formData,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue) || 0,
            maxDiscount: Number(formData.maxDiscount) || 0,
            usageLimit: Number(formData.usageLimit) || 0,
            usedCount: editingPromotion ? editingPromotion.usedCount : 0,
            applicableTimeRange: formData.applicableTimeRange || "Cả ngày",
            restaurantId: restaurantId, // Set restaurant ID
            createdBy: "restaurant",
            applicableRestaurants: [restaurantId], // Only for this restaurant
        };

        // Remove UI-only fields
        delete promotionData.isAllDay;
        delete promotionData.startTime;
        delete promotionData.endTime;

        try {
            if (editingPromotion) {
                await promotionService.update(editingPromotion.id, promotionData);
                alert("Cập nhật khuyến mãi thành công!");
            } else {
                await promotionService.create(promotionData);
                alert("Tạo khuyến mãi thành công!");
            }
            closeModal();
            resetForm();
            onSuccess?.();
        } catch (error) {
            alert("Lỗi khi lưu khuyến mãi: " + error.message);
        }
    }, [formData, editingPromotion, restaurantId, closeModal, resetForm, onSuccess]);

    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
            try {
                await promotionService.delete(id);
                alert("Xóa khuyến mãi thành công!");
                onSuccess?.();
            } catch (error) {
                alert("Lỗi khi xóa khuyến mãi!");
            }
        }
    }, [onSuccess]);

    const handleToggleStatus = useCallback(async (promotion) => {
        const newStatus = promotion.status === "active" ? "inactive" : "active";
        try {
            await promotionService.update(promotion.id, { status: newStatus });
            onSuccess?.();
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái!");
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
