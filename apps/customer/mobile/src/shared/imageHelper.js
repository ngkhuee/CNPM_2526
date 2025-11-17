// Mobile-local image helper (no import.meta) — uses same back-end base used by app
const API_BASE_URL = (() => {
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }
    return "http://192.168.0.127:4000";
})();

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
