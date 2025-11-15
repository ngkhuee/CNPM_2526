import React, { createContext, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export const GeolocationContext = createContext(null);

export function GeolocationProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationGranted, setLocationGranted] = useState(false);

    const requestLocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                setLocationGranted(true);
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                const coords = {
                    lat: currentLocation.coords.latitude,
                    lng: currentLocation.coords.longitude,
                };

                setLocation(coords);
            } else {
                setLocationGranted(false);
                setError('Location permission denied');
            }
        } catch (err) {
            console.error('Location error:', err);
            setError(err.message);
            setLocationGranted(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <GeolocationContext.Provider value={{
            location,
            loading,
            error,
            locationGranted,
            requestLocation
        }}>
            {children}
        </GeolocationContext.Provider>
    );
}
