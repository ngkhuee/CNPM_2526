/**
 * GPS Location Hook
 * Handles GPS geolocation and reverse geocoding
 * Shared between web and mobile customer apps
 */

import { useState, useCallback } from "react";
import { geoService, geolocation } from "shared-services";

export const useGPSLocation = () => {
    const [gpsLocation, setGpsLocation] = useState(null);
    const [loadingGPS, setLoadingGPS] = useState(false);
    const [gpsError, setGpsError] = useState(null);

    /**
     * Get GPS location (works on both web and mobile)
     * @returns {Promise<Object>} - {success, location, address, message}
     */
    const handleGetGPS = useCallback(async () => {
        setLoadingGPS(true);
        setGpsError(null);

        try {
            // Request permission first
            const permission = await geolocation.requestPermission();
            if (!permission.granted) {
                setLoadingGPS(false);
                setGpsError("Permission denied");
                return {
                    success: false,
                    message: "Location permission denied",
                };
            }

            // Get current position
            const position = await geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });

            const { latitude, longitude } = position.coords;
            setGpsLocation({ lat: latitude, lng: longitude });

            // Convert GPS coordinates to address text
            try {
                const result = await geoService.reverseGeocode(latitude, longitude);
                setLoadingGPS(false);
                return {
                    success: true,
                    location: { lat: latitude, lng: longitude },
                    address: result.display_name,
                    coordinates: result,
                };
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                setLoadingGPS(false);
                return {
                    success: true,
                    location: { lat: latitude, lng: longitude },
                    address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                };
            }
        } catch (error) {
            setLoadingGPS(false);
            setGpsError(error.message);
            console.error("GPS error:", error);
            return {
                success: false,
                message: error.message || "Cannot get GPS location. Please enter address manually.",
            };
        }
    }, []);

    /**
     * Geocode address to get GPS coordinates
     * @param {string} address - Address string
     * @returns {Promise<Object|null>} - {lat, lng, display_name} or null
     */
    const geocodeAddressToCoords = useCallback(async (address) => {
        if (!address) return null;

        try {
            console.log("🗺️ Geocoding address to get GPS coordinates...");
            const result = await geoService.geocodeAddress(address);
            if (result) {
                console.log("✅ Geocoded GPS:", result);
                return { lat: result.lat, lng: result.lng };
            }
        } catch (error) {
            console.error("❌ Geocoding error:", error);
            setGpsError(error.message);
        }
        return null;
    }, []);

    /**
     * Clear GPS error
     */
    const clearGpsError = useCallback(() => {
        setGpsError(null);
    }, []);

    return {
        gpsLocation,
        loadingGPS,
        gpsError,
        setGpsLocation,
        handleGetGPS,
        geocodeAddressToCoords,
        clearGpsError,
    };
};
