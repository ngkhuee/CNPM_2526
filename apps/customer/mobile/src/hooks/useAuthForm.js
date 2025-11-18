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
        phone: '',
        agreeTerms: false,
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleTerms = () => {
        setFormData(prev => ({ ...prev, agreeTerms: !prev.agreeTerms }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            agreeTerms: false,
        });
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password) {
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Validation Error', 'Please enter a valid email');
            return false;
        }

        if (!formData.agreeTerms) {
            Alert.alert('Terms Required', 'Please agree to terms and conditions');
            return false;
        }

        return true;
    };

    return {
        formData,
        updateField,
        toggleTerms,
        resetForm,
        validateForm
    };
};


