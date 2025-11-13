/**
 * Image Helper for Mobile
 * Handles image URLs from backend
 */
import { BACKEND_URL } from '../config/constants';

/**
 * Build full image URL from backend path
 * Handles both absolute URLs and relative paths
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return null;
    }

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Build full URL with backend base
    return `${BACKEND_URL}${imagePath}`;
};

/**
 * Get placeholder image for loading/error states
 * Returns a gray placeholder for now (can be replaced with actual image later)
 */
export const getPlaceholderImage = () => {
    // Return null to use fallback in Image component
    return null;
};

export default {
    getImageUrl,
    getPlaceholderImage,
};
