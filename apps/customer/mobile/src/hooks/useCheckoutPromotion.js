import { useState, useEffect } from 'react';
import { showToast } from '../utils/toastHelper';

/**
 * useCheckoutPromotion - Hook to manage promotion/discount logic in checkout
 * Eliminates promotion logic duplication
 * 
 * @param {Object} promotionsHook - Object from usePromotions hook
 * @param {Number} subtotal - Order subtotal for validation
 * @param {String} restaurantId - Current restaurant ID
 * @returns {Object} Promotion state and handlers
 */
export const useCheckoutPromotion = (promotionsHook, subtotal, restaurantId) => {
    const { promotions, getApplicablePromotions, validatePromotion, calculateDiscount } = promotionsHook;

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [showPromosModal, setShowPromosModal] = useState(false);
    const [applicablePromos, setApplicablePromos] = useState([]);

    // Load applicable promotions for current restaurant
    useEffect(() => {
        if (restaurantId) {
            const promos = getApplicablePromotions(restaurantId);
            console.log('[useCheckoutPromotion] Applicable promotions:', {
                restaurantId,
                allPromotions: promotions.length,
                applicablePromos: promos.length,
            });
            setApplicablePromos(promos);
        }
    }, [restaurantId, promotions.length]);

    /**
     * Handle applying promo code manually
     */
    const handleApplyPromo = () => {
        if (!promoCode.trim()) {
            showToast('error', 'Vui lòng nhập mã khuyến mãi');
            return;
        }

        const validation = validatePromotion(promoCode, subtotal, restaurantId);
        if (validation.valid) {
            setAppliedPromo(validation.promotion);
            showToast('success', `Đã áp dụng mã: ${validation.promotion.code}`);
            setPromoCode('');
        } else {
            showToast('error', validation.message);
        }
    };

    /**
     * Handle removing applied promo
     */
    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        showToast('success', 'Đã xóa mã khuyến mãi');
    };

    /**
     * Handle apply promo from list with validation
     */
    const handleApplyPromoFromList = (promo) => {
        console.log('[useCheckoutPromotion] Applying promo from list:', promo);

        // Validate minimum order value
        const minOrderValue = promo.minOrderValue || promo.min_order_value || 0;
        if (minOrderValue > 0 && subtotal < minOrderValue) {
            showToast(
                'error',
                `Đơn tối thiểu: ₫${minOrderValue.toLocaleString('vi-VN')}. Đơn hiện tại: ₫${subtotal.toLocaleString('vi-VN')}`
            );
            setShowPromosModal(false);
            return;
        }

        // Validate date range
        const now = new Date();
        const startDate = new Date(promo.startDate || promo.start_date);
        const endDate = new Date(promo.endDate || promo.end_date);

        if (now < startDate) {
            showToast('error', 'Khuyến mãi chưa bắt đầu');
            setShowPromosModal(false);
            return;
        }

        if (now > endDate) {
            showToast('error', 'Khuyến mãi đã hết hạn');
            setShowPromosModal(false);
            return;
        }

        // All validations passed
        setAppliedPromo(promo);
        setPromoCode(promo.code);
        setShowPromosModal(false);
        showToast('success', `Đã áp dụng mã: ${promo.code}`);
    };

    /**
     * Calculate discount amount
     */
    const getDiscount = () => {
        return appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0;
    };

    return {
        // State
        promoCode,
        appliedPromo,
        showPromosModal,
        applicablePromos,

        // Setters
        setPromoCode,
        setAppliedPromo,
        setShowPromosModal,

        // Handlers
        handleApplyPromo,
        handleRemovePromo,
        handleApplyPromoFromList,

        // Utils
        getDiscount,
    };
};
