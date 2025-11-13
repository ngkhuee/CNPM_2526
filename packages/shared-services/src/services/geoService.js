/**
 * Address Geocoding Service
 * Handles GPS geocoding, reverse geocoding, and address utilities
 * Shared between web and mobile customer apps
 */

/**
 * Reverse geocode coordinates to address
 * Uses Nominatim API (OpenStreetMap)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} - {display_name, address, lat, lng}
 */
export const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
            throw new Error("Reverse geocoding failed");
        }

        const data = await response.json();
        return {
            display_name: data.display_name,
            address: data.address || {},
            lat: data.lat,
            lng: data.lon,
        };
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw error;
    }
};

/**
 * Geocode address to coordinates
 * Uses Nominatim API (OpenStreetMap)
 * @param {string} address - Address string
 * @returns {Promise<Object>} - {lat, lng, display_name}
 */
export const geocodeAddress = async (address) => {
    try {
        const params = new URLSearchParams({
            q: address,
            format: "json",
            limit: 1,
        });

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params}`
        );

        if (!response.ok) {
            throw new Error("Geocoding failed");
        }

        const results = await response.json();
        if (results.length === 0) {
            throw new Error("Address not found");
        }

        const result = results[0];
        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            display_name: result.display_name,
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
};

/**
 * Calculate distance between two GPS points in kilometers
 * Uses Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
    const lat1 = point1.lat || point1.latitude;
    const lng1 = point1.lng || point1.longitude;
    const lat2 = point2.lat || point2.latitude;
    const lng2 = point2.lng || point2.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} - Radians
 */
const toRad = (degrees) => {
    return (degrees * Math.PI) / 180;
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} decimals - Number of decimal places (default 6)
 * @returns {string} - Formatted coordinates string
 */
export const formatCoordinates = (lat, lng, decimals = 6) => {
    return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

/**
 * Validate GPS coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Valid or not
 */
export const validateCoordinates = (lat, lng) => {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

/**
 * Parse address object to string
 * @param {Object} address - Address object with street, ward, district, city
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address) => {
    if (typeof address === "string") return address;

    const parts = [];
    if (address?.street) parts.push(address.street);
    if (address?.ward) parts.push(address.ward);
    if (address?.district) parts.push(address.district);
    if (address?.city) parts.push(address.city);

    return parts.filter(Boolean).join(", ");
};

/**
 * Parse address string to object
 * @param {string} addressString - Full address string
 * @returns {Object} - {street, ward, district, city}
 */
export const parseAddress = (addressString) => {
    // Simple parser - can be enhanced based on specific format
    const parts = addressString.split(",").map((p) => p.trim());

    return {
        street: parts[0] || "",
        ward: parts[1] || "",
        district: parts[2] || "",
        city: parts[3] || "",
    };
};

export const geoService = {
    reverseGeocode,
    geocodeAddress,
    calculateDistance,
    formatCoordinates,
    validateCoordinates,
    formatAddress,
    parseAddress,
};
