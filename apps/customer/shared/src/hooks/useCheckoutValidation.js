/**
 * Checkout Validation Hook
 * Handles form validation for checkout
 * Shared between web and mobile customer apps
 */

import { useState, useCallback } from "react";

export const useCheckoutValidation = () => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    /**
     * Validate customer info
     * @param {Object} customer - {name, phone, address}
     * @returns {Object} - Validation errors
     */
    const validateCustomer = useCallback((customer) => {
        const customerErrors = {};

        if (!customer.name || customer.name.trim() === "") {
            customerErrors.name = "Name is required";
        } else if (customer.name.length < 3) {
            customerErrors.name = "Name must be at least 3 characters";
        }

        if (!customer.phone || customer.phone.trim() === "") {
            customerErrors.phone = "Phone number is required";
        } else if (!/^[0-9\s\-\+\(\)]{7,}$/.test(customer.phone)) {
            customerErrors.phone = "Invalid phone number";
        }

        if (!customer.address || customer.address.trim() === "") {
            customerErrors.address = "Address is required";
        } else if (customer.address.length < 5) {
            customerErrors.address = "Address must be at least 5 characters";
        }

        return customerErrors;
    }, []);

    /**
     * Validate address selection
     * @param {boolean} useNewAddress - Using new address
     * @param {string} selectedAddressId - Selected address ID
     * @returns {Object} - Validation errors
     */
    const validateAddressSelection = useCallback(
        (useNewAddress, selectedAddressId) => {
            const addressErrors = {};

            if (!useNewAddress && !selectedAddressId) {
                addressErrors.address = "Please select or enter a delivery address";
            }

            return addressErrors;
        },
        []
    );

    /**
     * Validate all checkout data
     * @param {Object} data - Checkout data
     * @returns {boolean} - Is valid
     */
    const validateCheckout = useCallback(
        (data) => {
            const newErrors = {};

            const customerErrors = validateCustomer(data.customer);
            const addressErrors = validateAddressSelection(
                data.useNewAddress,
                data.selectedAddressId
            );

            if (Object.keys(customerErrors).length > 0) {
                Object.assign(newErrors, customerErrors);
            }

            if (Object.keys(addressErrors).length > 0) {
                Object.assign(newErrors, addressErrors);
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [validateCustomer, validateAddressSelection]
    );

    /**
     * Mark field as touched
     * @param {string} fieldName - Field name
     */
    const markAsTouched = useCallback((fieldName) => {
        setTouched((prev) => ({
            ...prev,
            [fieldName]: true,
        }));
    }, []);

    /**
     * Get error for specific field (only if touched)
     * @param {string} fieldName - Field name
     * @returns {string|undefined}
     */
    const getFieldError = useCallback(
        (fieldName) => {
            return touched[fieldName] ? errors[fieldName] : undefined;
        },
        [errors, touched]
    );

    /**
     * Clear all errors
     */
    const clearErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    /**
     * Clear specific field error
     * @param {string} fieldName - Field name
     */
    const clearFieldError = useCallback((fieldName) => {
        setErrors((prev) => ({
            ...prev,
            [fieldName]: undefined,
        }));
    }, []);

    return {
        errors,
        touched,
        validateCheckout,
        validateCustomer,
        validateAddressSelection,
        markAsTouched,
        getFieldError,
        clearErrors,
        clearFieldError,
    };
};
