// hooks/useAuthForm.js - Custom hook để tách logic

import { useState } from 'react';
import { Alert } from 'react-native';

export const useLoginForm = (onSuccess) => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({ email: '', password: '' });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Validation Error', 'Please enter email and password');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Validation Error', 'Please enter a valid email');
            return false;
        }

        return true;
    };

    return {
        formData,
        updateField,
        resetForm,
        validateForm
    };
};

export const useRegisterForm = (onSuccess) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeTerms: false,
    });
    const [fieldErrors, setFieldErrors] = useState({});

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const toggleTerms = () => {
        setFormData(prev => ({ ...prev, agreeTerms: !prev.agreeTerms }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            agreeTerms: false,
        });
        setFieldErrors({});
    };

    const validateForm = () => {
        const errors = {};

        // Client-side validation
        if (!formData.name || !formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email || !formData.email.trim()) {
            errors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Invalid email format';
            }
        }

        if (!formData.password || !formData.password.trim()) {
            errors.password = 'Password is required';
        }
        // Removed password length check for testing

        if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Please confirm password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
                errors.phone = 'Phone must be 10-11 digits';
            }
        }

        if (!formData.agreeTerms) {
            errors.terms = 'Please agree to terms and conditions';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstError = Object.values(errors)[0];
            Alert.alert('Validation Error', firstError);
            return false;
        }

        return true;
    };

    return {
        formData,
        updateField,
        toggleTerms,
        resetForm,
        validateForm,
        fieldErrors,
        setFieldErrors
    };
};


