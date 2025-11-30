/**
 * validationHelpers.js
 * Centralized validation functions for forms
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    if (!email || !email.trim()) {
        return { valid: false, message: 'Email là bắt buộc' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { valid: false, message: 'Email không hợp lệ' };
    }

    return { valid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
        return { valid: false, message: 'Số điện thoại là bắt buộc' };
    }

    // Remove spaces and check if it's 10-11 digits
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!phoneRegex.test(cleanPhone)) {
        return { valid: false, message: 'Số điện thoại phải có 10-11 số' };
    }

    return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return { valid: false, message: `${fieldName} là bắt buộc` };
    }
    return { valid: true };
};

/**
 * Validate checkout form
 */
export const validateCheckoutForm = (formData) => {
    const errors = {};

    // Name
    if (!formData.name || !formData.name.trim()) {
        errors.name = 'Họ tên là bắt buộc';
    }

    // Phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
        errors.phone = phoneValidation.message;
    }

    // Address
    if (!formData.address || !formData.address.trim()) {
        errors.address = 'Địa chỉ giao hàng là bắt buộc';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate payment card
 */
export const validatePaymentCard = (cardData) => {
    const errors = {};

    // Card number - must be 16 digits
    if (!cardData.cardNumber) {
        errors.cardNumber = 'Số thẻ là bắt buộc';
    } else {
        const cleanCardNumber = cardData.cardNumber.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cleanCardNumber)) {
            errors.cardNumber = 'Số thẻ phải có 16 chữ số';
        }
    }

    // Expiry date - format MM/YY
    if (!cardData.expiryDate) {
        errors.expiryDate = 'Ngày hết hạn là bắt buộc';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
        errors.expiryDate = 'Định dạng phải là MM/YY';
    } else {
        // Check if card is expired
        const [month, year] = cardData.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();

        if (expiry < now) {
            errors.expiryDate = 'Thẻ đã hết hạn';
        }
    }

    // CVV - must be 3 digits
    if (!cardData.cvv) {
        errors.cvv = 'CVV là bắt buộc';
    } else if (!/^\d{3}$/.test(cardData.cvv)) {
        errors.cvv = 'CVV phải có 3 chữ số';
    }

    // Cardholder name
    if (!cardData.cardholderName || !cardData.cardholderName.trim()) {
        errors.cardholderName = 'Tên chủ thẻ là bắt buộc';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate review form
 */
export const validateReviewForm = (reviewData) => {
    const errors = {};

    // Rating - must be 1-5
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        errors.rating = 'Vui lòng chọn số sao (1-5)';
    }

    // Comment - min 10 characters
    if (!reviewData.comment || !reviewData.comment.trim()) {
        errors.comment = 'Vui lòng nhập nội dung đánh giá';
    } else if (reviewData.comment.trim().length < 10) {
        errors.comment = 'Đánh giá phải có ít nhất 10 ký tự';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Mật khẩu là bắt buộc' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    return { valid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { valid: false, message: 'Mật khẩu không khớp' };
    }
    return { valid: true };
};
