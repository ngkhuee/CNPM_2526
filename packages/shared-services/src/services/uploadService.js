import apiClient from "../config/apiClient";

// Calculate API_BASE_URL at module level
const getAPIBaseURL = () => {
    // Check for Node/React Native environment first (priority for mobile)
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }
    // Check for Vite environment (web)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Default
    return "http://localhost:4000";
};

const API_BASE_URL = getAPIBaseURL();

/**
 * Upload Service - xử lý file upload
 * Tải ảnh lên server và lưu vào /public/images/[category]/
 */
const uploadService = {
    /**
     * Upload image to server
     * @param {File} file - Image file from input
     * @param {string} category - Category folder (avatars, restaurants, foods, etc.)
     * @returns {Promise<{success: boolean, path: string, filename: string, url: string}>}
     */
    async uploadImage(file, category = "other") {
        try {
            // Validate file exists
            if (!file) {
                throw new Error("No file provided");
            }

            // Create FormData for multipart upload
            const formData = new FormData();

            // Check if running in React Native (file will have uri property)
            if (file.uri) {
                // React Native file format
                formData.append("file", {
                    uri: file.uri,
                    type: file.type || 'image/jpeg',
                    name: file.fileName || file.name || `upload_${Date.now()}.jpg`,
                });
            } else {
                // Web file format
                formData.append("file", file);
            }

            formData.append("category", category);

            // Upload to backend
            const response = await apiClient.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Response format: { success: true, filename, path, url }
            return response;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    },

    /**
     * Upload multiple images
     * @param {File[]} files - Array of image files
     * @param {string} category - Category folder
     * @returns {Promise<Array>} Array of upload results
     */
    async uploadMultipleImages(files, category = "other") {
        try {
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error("No files provided");
            }

            // Upload all files in parallel
            const uploadPromises = files.map((file) =>
                this.uploadImage(file, category)
            );

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error uploading multiple images:", error);
            throw error;
        }
    },

    /**
     * Get full image URL from path
     * @param {string} imagePath - Image path (e.g., "/images/foods/food_1.png")
     * @returns {string} Full URL
     */
    getImageUrl(imagePath) {
        if (!imagePath) return "/images/default.png";

        // If already full URL, return as is
        if (imagePath.startsWith("http")) return imagePath;

        // If relative path, combine with API base URL
        return `${API_BASE_URL}${imagePath}`;
    },
};

export default uploadService;
