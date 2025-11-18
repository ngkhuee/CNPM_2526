// services/profileService.js
import apiClient from './apiClient';

export const profileService = {
    // Get user profile
    getUserProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response;
        } catch (error) {
            console.error('[profileService.getUserProfile] Error:', error);
            throw error;
        }
    },

    // Update user profile
    updateUserProfile: async (userId, data) => {
        try {
            const response = await apiClient.put(`/users/${userId}`, data);
            return response;
        } catch (error) {
            console.error('[profileService.updateUserProfile] Error:', error);
            throw error;
        }
    },

    // Mock function for demo - remove in production
    getMockUser: () => ({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0123456789',
        gender: 'Male',
        dob: '1990-01-01',
        avatar: null,
    }),
};

export const addressService = {
    // Get user addresses
    getAddresses: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}/addresses`);
            return response;
        } catch (error) {
            console.error('[addressService.getAddresses] Error:', error);
            throw error;
        }
    },

    // Add new address
    addAddress: async (userId, addressData) => {
        try {
            const response = await apiClient.post(`/users/${userId}/addresses`, addressData);
            return response;
        } catch (error) {
            console.error('[addressService.addAddress] Error:', error);
            throw error;
        }
    },

    // Update address
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await apiClient.put(`/addresses/${addressId}`, addressData);
            return response;
        } catch (error) {
            console.error('[addressService.updateAddress] Error:', error);
            throw error;
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        try {
            await apiClient.delete(`/addresses/${addressId}`);
        } catch (error) {
            console.error('[addressService.deleteAddress] Error:', error);
            throw error;
        }
    },

    // Set default address
    setDefaultAddress: async (userId, addressId) => {
        try {
            // Update the target address to be default
            const response = await apiClient.put(`/addresses/${addressId}`, {
                is_default: true
            });
            // Optionally: reset other addresses to not be default
            // For now, backend should handle this
            return response;
        } catch (error) {
            console.error('[addressService.setDefaultAddress] Error:', error);
            throw error;
        }
    },

    // Mock addresses for demo - remove in production
    getMockAddresses: () => [
        {
            id: '1',
            city: 'Ho Chi Minh',
            district: 'District 1',
            address_line: '123 Main Street',
            note: 'Near the park',
            isDefault: true,
            lat: 10.776,
            lng: 106.7,
        },
        {
            id: '2',
            city: 'Ho Chi Minh',
            district: 'District 2',
            address_line: '456 Nguyen Hue Blvd',
            note: 'Building A',
            isDefault: false,
            lat: 10.798,
            lng: 106.701,
        },
    ],
};
