/**
 * GPS Location Hook
 * Handles GPS geolocation and reverse geocoding
 * Shared between web and mobile customer apps
 */

import { useState, useCallback } from "react";
import { geoService } from "shared-services";

export const useGPSLocation = () => {
    const [gpsLocation, setGpsLocation] = useState(null);
    const [loadingGPS, setLoadingGPS] = useState(false);
    const [gpsError, setGpsError] = useState(null);

    /**
     * Get GPS location from browser's geolocation API
     * @returns {Promise<Object>} - {success, location, address, message}
     */
    const handleGetGPS = useCallback(async () => {
        if (!navigator.geolocation) {
            return {
                success: false,
                message: "Browser does not support GPS",
            };
        }

        setLoadingGPS(true);
        setGpsError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setGpsLocation({ lat: latitude, lng: longitude });

                    // Convert GPS coordinates to address text
                    try {
                        const result = await geoService.reverseGeocode(latitude, longitude);
                        resolve({
                            success: true,
                            location: { lat: latitude, lng: longitude },
                            address: result.display_name,
                            coordinates: result,
                        });
                    } catch (error) {
                        console.error("Reverse geocoding error:", error);
                        resolve({
                            success: true,
                            location: { lat: latitude, lng: longitude },
                            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                        });
                    } finally {
                        setLoadingGPS(false);
                    }
                },
                (error) => {
                    setLoadingGPS(false);
                    setGpsError(error.message);
                    console.error("GPS error:", error);
                    resolve({
                        success: false,
                        message: "Cannot get GPS location. Please enter address manually.",
                    });
                }
            );
        });
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
