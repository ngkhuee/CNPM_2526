import apiClient from "../config/apiClient";

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
            formData.append("file", file);
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
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
        return `${apiBaseUrl}${imagePath}`;
    },
};

export default uploadService;
