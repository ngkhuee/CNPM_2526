import React, { createContext, useState, useCallback } from "react";

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
     * Request GPS location from browser
     */
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            setLocationPermissionDenied(true);
            return;
        }

        console.log("Requesting GPS location...");
        setGeoLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("GPS location granted:", position.coords);
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                });
                setLocationPermissionDenied(false);
                setGeoLoading(false);
            },
            (error) => {
                console.error("GPS error:", error.code, error.message);
                setLocationPermissionDenied(true);
                setUserLocation(null);
                setGeoLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
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
