/**
 * GeolocationContext for Mobile (React Native)
 * Uses expo-location instead of navigator.geolocation
 */
import React, { createContext, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export const GeolocationContext = createContext({
    userLocation: null,
    locationPermissionDenied: false,
    geoLoading: false,
    requestLocation: async () => { },
    clearLocation: () => { },
    setLocation: (lat, lng) => { },
    hasLocation: false,
});

export const GeolocationProvider = ({ children }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    /**
     * Request GPS location from device
     */
    const requestLocation = useCallback(async () => {
        try {
            console.log('[GeolocationProvider] requestLocation() called');
            setGeoLoading(true);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            console.log('[GeolocationProvider] Permission status:', status);

            if (status !== 'granted') {
                console.log('[GeolocationProvider] GPS permission denied');
                setLocationPermissionDenied(true);
                setGeoLoading(false);
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            console.log('[GeolocationProvider] Location granted:', location.coords);
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                timestamp: location.timestamp,
            });
            setLocationPermissionDenied(false);
            setGeoLoading(false);
        } catch (error) {
            console.error('[GeolocationProvider] GPS error:', error);
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

    console.log('[GeolocationProvider] RENDERING - providing geolocation value:', {
        hasLocation,
        geoLoading,
        locationPermissionDenied: isLocationDenied,
    });

    return (
        <GeolocationContext.Provider value={value}>
            {children}
        </GeolocationContext.Provider>
    );
};

export default GeolocationProvider;
