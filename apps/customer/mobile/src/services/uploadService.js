// Mobile version of uploadService - using RN compatible file upload
import apiClient from '../config/apiClient';

/**
 * Mobile Upload Service for React Native
 * Handles file uploads in React Native format
 */
export const uploadService = {
    /**
     * Upload image to server (React Native version)
     * @param {object} file - File object from React Native (has uri, type, name properties)
     * @param {string} category - Category folder (avatars, restaurants, foods, etc.)
     * @returns {Promise<{success: boolean, path: string, filename: string, url: string}>}
     */
    async uploadImage(file, category = 'other') {
        try {
            // Validate file exists
            if (!file) {
                throw new Error('No file provided');
            }

            // Create FormData for React Native
            const formData = new FormData();

            // React Native file format with uri
            formData.append('file', {
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.fileName || file.name || `upload_${Date.now()}.jpg`,
            });

            formData.append('category', category);

            // Upload to backend
            return await apiClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    /**
     * Upload multiple images
     * @param {Array} files - Array of file objects
     * @param {string} category - Category folder
     * @returns {Promise<Array>} Array of upload results
     */
    async uploadMultipleImages(files, category = 'other') {
        try {
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error('No files provided');
            }

            // Upload all files in parallel
            const uploadPromises = files.map((file) => this.uploadImage(file, category));
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            throw error;
        }
    },

    /**
     * Get full image URL from path
     * Uses shared imageHelper logic
     * @param {string} imagePath - Image path (e.g., "/images/foods/food_1.png")
     * @returns {string} Full URL
     */
    getImageUrl(imagePath) {
        if (!imagePath) return '/images/default.png';

        // If already full URL, return as is
        if (imagePath.indexOf('http') === 0) return imagePath;

        // Calculate API base URL
        const API_BASE_URL = (() => {
            // Check for Node/React Native environment first (priority for mobile)
            if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
                return process.env.REACT_APP_API_BASE_URL;
            }
            // Default
            return 'http://localhost:4000';
        })();

        // If relative path, combine with API base URL
        return API_BASE_URL + imagePath;
    },
};

export default uploadService;
