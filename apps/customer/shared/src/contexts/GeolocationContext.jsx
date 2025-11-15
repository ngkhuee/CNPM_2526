import React, { createContext, useState, useCallback } from "react";
import { geolocation } from "shared-services";

export const GeolocationContext = createContext();

/**
 * GeolocationProvider - Manages shared GPS location state
 * Allows web and mobile to share the same geolocation state
 */
export const GeolocationProvider = ({ children }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] =
        useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    /**
     * Request GPS location (works on both web and mobile)
     */
    const requestLocation = useCallback(async () => {
        try {
            console.log("Requesting GPS location...");
            setGeoLoading(true);

            // Request permission first
            const permission = await geolocation.requestPermission();
            if (!permission.granted) {
                console.log("GPS permission denied");
                setLocationPermissionDenied(true);
                setUserLocation(null);
                setGeoLoading(false);
                return;
            }

            // Get current position
            const position = await geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });

            console.log("GPS location granted:", position.coords);
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            });
            setLocationPermissionDenied(false);
            setGeoLoading(false);
        } catch (error) {
            console.error("GPS error:", error.message);
            setLocationPermissionDenied(true);
            setUserLocation(null);
            setGeoLoading(false);
        }
    }, []);

    /**
     * Clear location
     */
    const clearLocation = useCallback(() => {
        setUserLocation(null);
        setLocationPermissionDenied(false);
    }, []);

    /**
     * Manually set location
     */
    const setLocation = useCallback((latitude, longitude) => {
        setUserLocation({
            latitude,
            longitude,
            timestamp: Date.now(),
        });
        setLocationPermissionDenied(false);
    }, []);

    /**
     * Check if location permission is denied
     */
    const isLocationDenied = locationPermissionDenied;

    /**
     * Check if we have a valid location
     */
    const hasLocation = !!userLocation;

    const value = {
        userLocation,
        locationPermissionDenied: isLocationDenied,
        geoLoading,
        requestLocation,
        clearLocation,
        setLocation,
        hasLocation,
    };

    return (
        <GeolocationContext.Provider value={value}>
            {children}
        </GeolocationContext.Provider>
    );
};

export default GeolocationProvider;
