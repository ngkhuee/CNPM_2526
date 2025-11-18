// services/profileService.js
import axios from 'axios';
import apiConfig from '../config/api.config';

const API_BASE_URL = apiConfig.api.baseURL;

export const profileService = {
    // Get user profile
    getUserProfile: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Update user profile
    updateUserProfile: async (userId, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
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
            const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/addresses`);
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },

    // Add new address
    addAddress: async (userId, addressData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/addresses`, addressData);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    // Update address
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/addresses/${addressId}`);
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    },

    // Set default address
    setDefaultAddress: async (userId, addressId) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/users/${userId}/addresses/${addressId}/default`
            );
            return response.data;
        } catch (error) {
            console.error('Error setting default address:', error);
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
