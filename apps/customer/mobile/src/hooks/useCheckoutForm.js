import { useState, useEffect } from 'react';

/**
 * useCheckoutForm - Hook to manage checkout form state and validation
 * Eliminates form logic duplication and simplifies CheckoutScreen
 * 
 * @param {Object} user - User object from AuthContext
 * @param {Object} gpsData - GPS data from useGeolocation { address, location }
 * @returns {Object} Form state, validation, and handlers
 */
export const useCheckoutForm = (user, gpsData = {}) => {
    // Form state
    const [checkoutData, setCheckoutData] = useState({
        customerName: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        addressId: null,
        paymentMethod: 'card',
        gps: null,
        specialInstructions: '',
    });

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [manualAddress, setManualAddress] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Auto-fill default address on mount
    useEffect(() => {
        if (user?.defaultAddress) {
            const defaultAddr = user.defaultAddress;
            setSelectedAddress(defaultAddr);
            setCheckoutData(prev => ({
                ...prev,
                address: defaultAddr.address_line || defaultAddr.address,
                addressId: defaultAddr.id,
                gps: defaultAddr.latitude && defaultAddr.longitude
                    ? { lat: defaultAddr.latitude, lng: defaultAddr.longitude }
                    : null,
            }));
        }
    }, []); // Only run once on mount

    // Update form when GPS data changes
    useEffect(() => {
        if (gpsData?.address) {
            setManualAddress(gpsData.address);
            setCheckoutData(prev => ({
                ...prev,
                address: gpsData.address,
                gps: gpsData.location,
            }));
        }
    }, [gpsData?.address, gpsData?.location?.latitude, gpsData?.location?.longitude]);

    /**
     * Validate form fields
     */
    const validateForm = () => {
        const newErrors = {};

        if (!checkoutData.customerName?.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên';
        }

        if (!checkoutData.phone?.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,}$/.test(checkoutData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!checkoutData.email?.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        const finalAddress = selectedAddress?.address_line || manualAddress || checkoutData.address;
        if (!finalAddress?.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
        }

        if (!checkoutData.paymentMethod || !['card', 'momo'].includes(checkoutData.paymentMethod)) {
            newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form field changes
     */
    const handleFormChange = (data) => {
        setCheckoutData(data);
        // Re-validate if field was touched
        const changedField = Object.keys(data)[0];
        if (touched[changedField]) {
            validateForm();
        }
    };

    /**
     * Handle field blur for validation
     */
    const handleFieldBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateForm();
    };

    /**
     * Handle address selection from saved addresses
     */
    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setCheckoutData(prev => ({
            ...prev,
            address: address.address_line || address.address,
            addressId: address.id,
            // Use {lat, lng} format for consistency
            gps: address.latitude && address.longitude
                ? { lat: address.latitude, lng: address.longitude }
                : null,
        }));
    };

    /**
     * Get final checkout data for submission
     */
    const getFinalCheckoutData = (location) => {
        return {
            ...checkoutData,
            address: selectedAddress?.address_line || manualAddress || checkoutData.address,
            addressId: selectedAddress?.id,
            gps: selectedAddress?.latitude && selectedAddress?.longitude
                ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
                : location,
        };
    };

    return {
        // State
        checkoutData,
        selectedAddress,
        manualAddress,
        errors,
        touched,

        // Setters
        setCheckoutData,
        setSelectedAddress,
        setManualAddress,

        // Handlers
        handleFormChange,
        handleFieldBlur,
        handleAddressSelect,

        // Validation
        validateForm,

        // Utils
        getFinalCheckoutData,
    };
};
