/**
 * toastHelper.js - Helper hiển thị toast notifications
 * Sử dụng Alert từ react-native (simple implementation)
 */

import { Alert } from 'react-native';

/**
 * Hiển thị toast message
 * 
 * @param {string} type - Loại toast: 'success', 'error', 'info'
 * @param {string} message - Nội dung message
 * @param {string} title - Tiêu đề (tuỳ chọn)
 */
export const showToast = (type, message, title = '') => {
    let alertTitle = title;

    // Nếu không có title, dùng title mặc định theo type
    if (!alertTitle) {
        if (type === 'success') {
            alertTitle = 'Success';
        } else if (type === 'error') {
            alertTitle = 'Error';
        } else if (type === 'info') {
            alertTitle = 'Information';
        } else {
            alertTitle = 'Message';
        }
    }

    // Hiển thị Alert
    Alert.alert(alertTitle, message);
};

/**
 * Hiển thị success toast
 * 
 * @param {string} message - Nội dung message
 */
export const showSuccess = (message) => {
    showToast('success', message, 'Success');
};

/**
 * Hiển thị error toast
 * 
 * @param {string} message - Nội dung message
 */
export const showError = (message) => {
    showToast('error', message, 'Error');
};

/**
 * Hiển thị info toast
 * 
 * @param {string} message - Nội dung message
 */
export const showInfo = (message) => {
    showToast('info', message, 'Information');
};
