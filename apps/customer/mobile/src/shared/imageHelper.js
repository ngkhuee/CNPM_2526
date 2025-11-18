// Mobile-local image helper (no import.meta) — uses same back-end base used by app
import apiConfig from '../config/api.config';

const API_BASE_URL = apiConfig.api.baseURL;

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
};

export const getFoodImageUrl = (food) => getImageUrl(food?.image);
export const getRestaurantImageUrl = (r) => getImageUrl(r?.image);
export const getRestaurantBannerUrl = (r) => getImageUrl(r?.banner);
