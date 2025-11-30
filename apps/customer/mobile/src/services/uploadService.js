// services/uploadService.js
import axios from 'axios';
import { Platform } from 'react-native';
import apiConfig from '../config/api.config';

const BASE_URL = apiConfig.api.baseURL;

export const uploadService = {
    /**
     * Upload image to backend
     * @param {Object} imageFile - Image file object from expo-image-picker
     * @param {string} category - Image category (avatars, foods, restaurants, etc.)
     * @returns {Promise<Object>} Upload response with image URL
     */
    uploadImage: async (imageFile, category = 'avatars') => {
        try {
            const formData = new FormData();

            // Prepare file object for upload
            const fileUri = imageFile.uri;
            const fileName = fileUri.split('/').pop();

            // Determine MIME type from file extension
            const fileExtension = fileName.split('.').pop().toLowerCase();
            const mimeTypes = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp',
            };
            const fileType = mimeTypes[fileExtension] || 'image/jpeg';

            // Create file object for React Native FormData
            const file = {
                uri: fileUri,
                name: fileName,
                type: fileType,
            };

            formData.append('file', file);
            formData.append('category', category);

            console.log('[uploadService] Uploading image:', { fileName, fileType, category, uri: fileUri });
            console.log('[uploadService] BASE_URL:', BASE_URL);
            console.log('[uploadService] Full upload URL:', `${BASE_URL}/upload`);

            // Use fetch instead of axios for better React Native FormData support
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('[uploadService] Upload successful:', data.url);
                return {
                    success: true,
                    url: data.url,
                    path: data.path,
                };
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('[uploadService] Upload error:', error);
            console.error('[uploadService] Error type:', error.name);
            console.error('[uploadService] Error message:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to upload image',
            };
        }
    },
};
