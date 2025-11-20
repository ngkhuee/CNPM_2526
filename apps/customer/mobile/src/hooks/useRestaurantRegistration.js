import { useState, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';

/**
 * useRestaurantRegistration - Custom hook for restaurant registration logic
 * Handles form state, validation, and API calls
 */
export const useRestaurantRegistration = () => {
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        description: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setError('');
    }, []);

    const validateForm = useCallback(() => {
        // Check required fields
        if (
            !formData.restaurantName ||
            !formData.ownerName ||
            !formData.email ||
            !formData.password ||
            !formData.phone ||
            !formData.address
        ) {
            setError('Please fill in all required fields');
            return false;
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Please enter a valid phone number (10-11 digits)');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        // Validate form
        if (!validateForm()) {
            return { success: false, message: error };
        }

        try {
            setLoading(true);
            setError('');

            // Validate email uniqueness
            const emailValidation = await restaurantService.validateEmails(formData.email);
            if (!emailValidation.valid) {
                setError(emailValidation.message);
                return { success: false, message: emailValidation.message };
            }

            // Generate IDs
            const restaurantId = `r_${Date.now()}`;
            const userId = `u_${Date.now()}`;

            // Prepare restaurant data
            const restaurantData = {
                id: restaurantId,
                name: formData.restaurantName,
                owner_id: userId,
                description: formData.description || 'No description provided',
                address: formData.address,
                latitude: 10.762622, // Default coords
                longitude: 106.660172,
                phone: formData.phone,
                email: formData.email,
                image: '/images/restaurants/default.png',
                banner_image: '/images/restaurants/default.png',
                primary_category: 'Other',
                rating: 0,
                total_reviews: 0,
                is_open: false,
                opening_hours: {
                    monday: '09:00-22:00',
                    tuesday: '09:00-22:00',
                    wednesday: '09:00-22:00',
                    thursday: '09:00-22:00',
                    friday: '09:00-23:00',
                    saturday: '09:00-23:00',
                    sunday: '09:00-22:00',
                },
                delivery_time_minutes: 30,
                min_order_amount: 50000,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Prepare user data
            const userData = {
                id: userId,
                email: formData.email,
                password: formData.password,
                full_name: formData.ownerName,
                phone: formData.phone,
                avatar: '/images/avatars/restaurant_owner.png',
                roles: ['restaurant_owner'],
                restaurant_id: restaurantId,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Create restaurant
            const restaurantResponse = await restaurantService.registerRestaurant(restaurantData);
            if (!restaurantResponse.success) {
                throw new Error(restaurantResponse.message || 'Failed to create restaurant');
            }

            // Create user account
            const userResponse = await restaurantService.registerOwner(userData);
            if (!userResponse.success) {
                throw new Error(userResponse.message || 'Failed to create user account');
            }

            setLoading(false);
            return {
                success: true,
                message: 'Registration successful! Your restaurant has been submitted for review.',
            };
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err.message || 'Registration failed. Please try again.';
            setError(errorMsg);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [formData, validateForm, error]);

    const resetForm = useCallback(() => {
        setFormData({
            restaurantName: '',
            address: '',
            description: '',
            ownerName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        });
        setError('');
    }, []);

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit,
        resetForm,
    };
};
